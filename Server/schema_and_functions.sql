-- SQL Script for Expense Tracker Supabase Stored Procedures
-- Synchronized with Live Supabase Database Source of Truth
-- Master Migration Script: Income Ownership, Savings Vault Ledger & Account Transfers

BEGIN;

-- ============================================================================
-- 1. INCOME OWNERSHIP MIGRATION
-- ============================================================================

ALTER TABLE income
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

CREATE TEMP TABLE temp_income_owners AS
SELECT 
    i.id AS income_id,
    ARRAY_AGG(DISTINCT owner_id) AS distinct_owners
FROM income i
JOIN (
    SELECT income_id, user_id AS owner_id FROM budget WHERE income_id IS NOT NULL AND user_id IS NOT NULL
    UNION
    SELECT income_id, user_id AS owner_id FROM expense WHERE income_id IS NOT NULL AND user_id IS NOT NULL
) combined ON combined.income_id = i.id
GROUP BY i.id;

DO $$
DECLARE
    v_conflict_count INT;
    v_unmapped_count INT;
BEGIN
    SELECT COUNT(*) INTO v_conflict_count
    FROM temp_income_owners
    WHERE CARDINALITY(distinct_owners) > 1;

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Migration aborted: % income records are referenced by multiple conflicting users.', v_conflict_count;
    END IF;

    SELECT COUNT(*) INTO v_unmapped_count
    FROM income i
    LEFT JOIN temp_income_owners t ON t.income_id = i.id
    WHERE t.income_id IS NULL;

    IF v_unmapped_count > 0 THEN
        RAISE EXCEPTION 'Migration aborted: % income records have no referenced owner in budget or expense.', v_unmapped_count;
    END IF;
END $$;

UPDATE income i
SET user_id = t.distinct_owners[1]
FROM temp_income_owners t
WHERE i.id = t.income_id AND i.user_id IS NULL;

ALTER TABLE income
ALTER COLUMN user_id SET NOT NULL;

DROP TABLE temp_income_owners;

-- ============================================================================
-- 2. SAVINGS_HISTORY LEDGER MIGRATION
-- ============================================================================

ALTER TABLE savings_history
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR,
ADD COLUMN IF NOT EXISTS related_expense_id UUID REFERENCES expense(id) ON DELETE SET NULL;

ALTER TABLE savings_history
ALTER COLUMN budget_id DROP NOT NULL;

UPDATE savings_history sh
SET transaction_type = CASE
    WHEN LOWER(b.budget_type) = 'regular' THEN 'REGULAR_CREDIT'
    WHEN LOWER(b.budget_type) = 'savings' THEN 'GOAL_CONTRIBUTION'
    ELSE NULL
END
FROM budget b
WHERE b.id = sh.budget_id
  AND sh.transaction_type IS NULL;

DO $$
DECLARE
    v_unclassified_count INT;
BEGIN
    SELECT COUNT(*) INTO v_unclassified_count
    FROM savings_history
    WHERE transaction_type IS NULL;

    IF v_unclassified_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: % unclassified savings_history rows remain.', v_unclassified_count;
    END IF;
END $$;

-- ============================================================================
-- 3. ACCOUNT_TRANSFER LEDGER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_transfer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    from_income_id UUID NOT NULL REFERENCES income(id) ON DELETE RESTRICT,
    to_income_id UUID NOT NULL REFERENCES income(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    transferred_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_different_accounts CHECK (from_income_id <> to_income_id)
);

-- ============================================================================
-- 4. STORED PROCEDURES
-- ============================================================================

-- A. CREATE BUDGET RPC FUNCTION
CREATE OR REPLACE FUNCTION create_budget(
    p_user_id UUID,
    p_budget_name TEXT,
    p_budget_type TEXT,
    p_frequency TEXT,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_target_amount NUMERIC,
    p_income_id UUID,
    p_variable_expense NUMERIC,
    p_budget_amount NUMERIC
)
RETURNS TABLE(id UUID) AS $$
DECLARE
    new_budget_id UUID;
    v_overlap_count INT;
BEGIN
    new_budget_id := gen_random_uuid();

    IF LOWER(p_budget_type) = 'regular' THEN
        SELECT COUNT(*) INTO v_overlap_count
        FROM budget
        WHERE user_id = p_user_id 
          AND income_id = p_income_id 
          AND LOWER(budget_type) = 'regular'
          AND is_active = true
          AND (p_start_date <= end_date AND p_end_date >= start_date);

        IF v_overlap_count > 0 THEN
            RAISE EXCEPTION 'A regular budget already exists for this income source during the selected period.';
        END IF;
    END IF;

    INSERT INTO budget (
        id, user_id, income_id, budget_name, budget_type, frequency, start_date, end_date, target_amount, budget_amount, variable_expense, is_active, is_savings_credited, created_at
    ) VALUES (
        new_budget_id, p_user_id, p_income_id, p_budget_name, p_budget_type, p_frequency, p_start_date, p_end_date, COALESCE(p_target_amount, 0), COALESCE(p_budget_amount, 0), COALESCE(p_variable_expense, 0), true, false, NOW()
    );

    RETURN QUERY SELECT new_budget_id AS id;
END;
$$ LANGUAGE plpgsql;


-- B. GET BUDGET DASHBOARD RPC FUNCTION
DROP FUNCTION IF EXISTS get_budget_dashboard(UUID);

CREATE OR REPLACE FUNCTION get_budget_dashboard(
    p_user_id UUID
)
RETURNS TABLE
(
    budget_id UUID,
    is_active BOOLEAN,
    is_savings_credited BOOLEAN,
    budget_name VARCHAR,
    budget_type VARCHAR,
    start_date DATE,
    end_date DATE,
    budget_amount NUMERIC,
    target_amount NUMERIC,
    spent_amount NUMERIC,
    remaining_amount NUMERIC,
    saved_amount NUMERIC,
    spending_percentage NUMERIC,
    budget_status TEXT,
    target_achieved BOOLEAN,
    frequency VARCHAR,
    income_source VARCHAR,
    income_id UUID
)
LANGUAGE plpgsql
AS
$$
DECLARE
    today_ist DATE;
BEGIN
    today_ist := (now() AT TIME ZONE 'Asia/Kolkata')::date;

    RETURN QUERY
    SELECT
        b.id AS budget_id,
        b.is_active,
        b.is_savings_credited,
        b.budget_name,
        b.budget_type,
        b.start_date::date,
        b.end_date::date,
        b.budget_amount,
        b.target_amount,

        CASE
            WHEN b.budget_type = 'regular' THEN expense_data.amount
            ELSE 0
        END AS spent_amount,

        CASE
            WHEN b.budget_type = 'regular' THEN GREATEST(b.budget_amount - expense_data.amount, 0)
            WHEN b.budget_type = 'savings' THEN GREATEST(b.target_amount - savings_data.amount, 0)
            ELSE 0
        END AS remaining_amount,

        savings_data.amount AS saved_amount,

        CASE
            WHEN b.budget_type = 'regular' THEN LEAST(ROUND((expense_data.amount / NULLIF(b.budget_amount, 0)) * 100, 2), 100)
            WHEN b.budget_type = 'savings' THEN LEAST(ROUND((savings_data.amount / NULLIF(b.target_amount, 0)) * 100, 2), 100)
            ELSE 0
        END AS spending_percentage,

        CASE
            WHEN NOT b.is_active AND b.is_savings_credited THEN 'Completed'
            WHEN today_ist < b.start_date::date THEN 'Upcoming'
            WHEN b.budget_type = 'regular' AND today_ist > b.end_date::date THEN 'Completed'
            WHEN b.budget_type = 'regular' AND expense_data.amount > b.budget_amount THEN 'Overspent'
            WHEN b.budget_type = 'savings' AND savings_data.amount >= b.target_amount THEN 'Completed'
            WHEN b.budget_type = 'savings' AND today_ist > b.end_date::date AND savings_data.amount < b.target_amount THEN 'Past Due'
            ELSE 'Active'
        END AS budget_status,

        CASE
            WHEN b.budget_type = 'regular' AND expense_data.amount <= b.budget_amount THEN TRUE
            WHEN b.budget_type = 'savings' AND savings_data.amount >= b.target_amount THEN TRUE
            ELSE FALSE
        END AS target_achieved,

        b.frequency,
        i.source AS income_source,
        i.id AS income_id

    FROM budget b
    LEFT JOIN income i ON i.id = b.income_id AND (i.user_id = b.user_id OR i.user_id IS NULL)
    LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(e.amount), 0) AS amount
        FROM expense e
        WHERE e.user_id = b.user_id
          AND e.income_id = b.income_id
          AND e.transaction_date BETWEEN b.start_date AND b.end_date
          AND e.created_at >= b.created_at
          AND NOT EXISTS (
              SELECT 1 FROM fixed_expense fe 
              WHERE fe.user_id = b.user_id
                AND fe.budget_id = b.id 
                AND fe.category_id = e.category_id
          )
    ) expense_data ON TRUE
    LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(sh.saved_amount), 0) AS amount
        FROM savings_history sh
        WHERE sh.user_id = b.user_id
          AND sh.budget_id = b.id
    ) savings_data ON TRUE
    WHERE b.user_id = p_user_id
    ORDER BY b.start_date DESC;
END;
$$;


-- C. FINALIZE EXPIRED REGULAR BUDGETS RPC FUNCTION
CREATE OR REPLACE FUNCTION finalize_expired_regular_budgets()
RETURNS VOID AS $$
DECLARE
    rec RECORD;
    v_spent NUMERIC;
    v_leftover NUMERIC;
    v_income_bal NUMERIC;
    v_actual_credit NUMERIC;
    v_desc TEXT;
    today_ist DATE;
BEGIN
    today_ist := (now() AT TIME ZONE 'Asia/Kolkata')::date;

    FOR rec IN
        SELECT b.id, b.user_id, b.income_id, b.budget_amount, b.start_date, b.end_date, b.created_at
        FROM budget b
        WHERE LOWER(b.budget_type) = 'regular'
          AND b.is_active = true
          AND today_ist > b.end_date::date
    LOOP
        SELECT COALESCE(SUM(e.amount), 0) INTO v_spent
        FROM expense e
        WHERE e.user_id = rec.user_id
          AND e.income_id = rec.income_id
          AND e.transaction_date BETWEEN rec.start_date AND rec.end_date
          AND e.created_at >= rec.created_at
          AND NOT EXISTS (
              SELECT 1 FROM fixed_expense fe 
              WHERE fe.user_id = rec.user_id
                AND fe.budget_id = rec.id 
                AND fe.category_id = e.category_id
          );

        v_leftover := rec.budget_amount - v_spent;

        IF v_leftover > 0 THEN
            SELECT balance INTO v_income_bal
            FROM income
            WHERE id = rec.income_id AND (user_id = rec.user_id OR user_id IS NULL)
            FOR UPDATE;

            IF FOUND THEN
                v_actual_credit := LEAST(v_leftover, GREATEST(COALESCE(v_income_bal, 0), 0));

                IF v_actual_credit > 0 THEN
                    UPDATE income
                    SET balance = balance - v_actual_credit,
                        updated_at = NOW()
                    WHERE id = rec.income_id AND (user_id = rec.user_id OR user_id IS NULL);

                    IF v_actual_credit < v_leftover THEN
                        v_desc := 'Regular Budget Leftover Credit (Partial: ₹' || v_actual_credit || ' of ₹' || v_leftover || ' available)';
                    ELSE
                        v_desc := 'Regular Budget Leftover Credit';
                    END IF;

                    INSERT INTO savings_history (
                        id, user_id, budget_id, saved_amount, credited_on, description, transaction_type, created_at
                    ) VALUES (
                        gen_random_uuid(), rec.user_id, rec.id, v_actual_credit, NOW(), v_desc, 'REGULAR_CREDIT', NOW()
                    );
                END IF;
            END IF;
        END IF;

        UPDATE budget
        SET is_savings_credited = true,
            is_active = false
        WHERE id = rec.id;
    END LOOP;

    UPDATE budget
    SET is_active = false
    WHERE LOWER(budget_type) = 'savings'
      AND is_active = true
      AND today_ist > end_date::date;
END;
$$ LANGUAGE plpgsql;


-- D. ADD SAVINGS GOAL CONTRIBUTION RPC FUNCTION
CREATE OR REPLACE FUNCTION add_savings_goal_contribution(
    p_user_id UUID,
    p_budget_id UUID,
    p_amount NUMERIC,
    p_credited_date TIMESTAMPTZ,
    p_description TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    saved_amount NUMERIC,
    remaining_goal NUMERIC,
    new_income_balance NUMERIC
) AS $$
DECLARE
    v_budget RECORD;
    v_total_saved NUMERIC;
    v_remaining_target NUMERIC;
    v_income_balance NUMERIC;
    v_income_id UUID;
    v_actual_date TIMESTAMPTZ;
    v_credited_date_ist DATE;
    today_ist DATE;
BEGIN
    today_ist := (now() AT TIME ZONE 'Asia/Kolkata')::date;
    v_actual_date := COALESCE(p_credited_date, NOW());
    v_credited_date_ist := (v_actual_date AT TIME ZONE 'Asia/Kolkata')::date;

    SELECT b.id, b.user_id, b.income_id, b.budget_type, b.is_active, b.target_amount, b.start_date::date AS start_date, b.end_date::date AS end_date
    INTO v_budget
    FROM budget b
    WHERE b.id = p_budget_id AND b.user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Budget not found or unauthorized.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF LOWER(v_budget.budget_type) <> 'savings' THEN
        RETURN QUERY SELECT false, 'Selected budget is not a savings goal.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF NOT v_budget.is_active THEN
        RETURN QUERY SELECT false, 'Savings goal is no longer active.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF today_ist > v_budget.end_date THEN
        RETURN QUERY SELECT false, 'Savings goal is Past Due and cannot accept new contributions.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF v_credited_date_ist < v_budget.start_date THEN
        RETURN QUERY SELECT false, 'Contribution date cannot be earlier than savings goal start date.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF v_credited_date_ist > v_budget.end_date THEN
        RETURN QUERY SELECT false, 'Contribution date cannot be later than savings goal end date.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF v_credited_date_ist > today_ist THEN
        RETURN QUERY SELECT false, 'Future-dated savings contributions are not allowed.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RETURN QUERY SELECT false, 'Contribution amount must be greater than zero.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    SELECT COALESCE(SUM(sh.saved_amount), 0) INTO v_total_saved
    FROM savings_history sh
    WHERE sh.user_id = p_user_id AND sh.budget_id = p_budget_id;

    v_remaining_target := GREATEST(v_budget.target_amount - v_total_saved, 0);

    IF p_amount > v_remaining_target THEN
        RETURN QUERY SELECT false, ('Contribution amount (₹' || p_amount || ') exceeds remaining goal target (₹' || v_remaining_target || ').')::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    v_income_id := v_budget.income_id;
    SELECT balance INTO v_income_balance
    FROM income
    WHERE id = v_income_id AND (user_id = p_user_id OR user_id IS NULL)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Linked income source account not found or unauthorized.'::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF COALESCE(v_income_balance, 0) < p_amount THEN
        RETURN QUERY SELECT false, ('Insufficient available balance in income account (Available: ₹' || COALESCE(v_income_balance, 0) || ', Required: ₹' || p_amount || ').')::TEXT, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    UPDATE income
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE id = v_income_id AND (user_id = p_user_id OR user_id IS NULL);

    INSERT INTO savings_history (
        id, user_id, budget_id, saved_amount, credited_on, description, transaction_type, created_at
    ) VALUES (
        gen_random_uuid(), p_user_id, p_budget_id, p_amount, v_actual_date, COALESCE(p_description, 'Fresh Contribution'), 'GOAL_CONTRIBUTION', NOW()
    );

    IF (v_total_saved + p_amount) >= v_budget.target_amount THEN
        UPDATE budget
        SET is_active = false
        WHERE id = p_budget_id;
    END IF;

    RETURN QUERY SELECT 
        true, 
        'Savings contribution added successfully.'::TEXT, 
        p_amount, 
        GREATEST(v_remaining_target - p_amount, 0), 
        (v_income_balance - p_amount);
END;
$$ LANGUAGE plpgsql;


-- E. SET SAVINGS_HISTORY.TRANSACTION_TYPE NOT NULL AFTER UPDATING ALL FUNCTIONS
ALTER TABLE savings_history
ALTER COLUMN transaction_type SET NOT NULL;


-- F. GET UNALLOCATED SAVINGS RPC FUNCTION
CREATE OR REPLACE FUNCTION get_unallocated_savings(
    p_user_id UUID
)
RETURNS TABLE (unallocated_savings NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT COALESCE(SUM(sh.saved_amount), 0) AS unallocated_savings
    FROM savings_history sh
    WHERE sh.user_id = p_user_id 
      AND sh.transaction_type IN ('REGULAR_CREDIT', 'UNALLOCATED_WITHDRAWAL');
END;
$$ LANGUAGE plpgsql;


-- G. CREATE SAVINGS FUNDED EXPENSE RPC FUNCTION
CREATE OR REPLACE FUNCTION create_savings_funded_expense(
    p_user_id UUID,
    p_income_id UUID,
    p_category_id UUID,
    p_title VARCHAR,
    p_description TEXT,
    p_amount NUMERIC,
    p_payment_method VARCHAR,
    p_priority VARCHAR,
    p_transaction_date TIMESTAMPTZ
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    expense_id UUID,
    new_income_balance NUMERIC,
    new_unallocated_savings NUMERIC
) AS $$
DECLARE
    v_income_balance NUMERIC;
    v_unallocated_savings NUMERIC;
    v_shortfall NUMERIC;
    v_liquid_deduction NUMERIC;
    v_new_expense_id UUID;
BEGIN
    SELECT balance INTO v_income_balance
    FROM income
    WHERE id = p_income_id AND (user_id = p_user_id OR user_id IS NULL)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Income account not found or unauthorized.'::TEXT, NULL::UUID, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    IF COALESCE(v_income_balance, 0) >= p_amount THEN
        RETURN QUERY SELECT false, 'Liquid balance is sufficient for this expense. Please use standard expense creation.'::TEXT, NULL::UUID, v_income_balance, 0::NUMERIC;
        RETURN;
    END IF;

    v_liquid_deduction := GREATEST(COALESCE(v_income_balance, 0), 0);
    v_shortfall := p_amount - v_liquid_deduction;

    SELECT COALESCE(SUM(sh.saved_amount), 0) INTO v_unallocated_savings
    FROM savings_history sh
    WHERE sh.user_id = p_user_id 
      AND sh.transaction_type IN ('REGULAR_CREDIT', 'UNALLOCATED_WITHDRAWAL');

    IF v_shortfall > v_unallocated_savings THEN
        RETURN QUERY SELECT false, ('Insufficient unallocated savings to cover shortfall (Available: ₹' || v_unallocated_savings || ', Shortfall: ₹' || v_shortfall || ').')::TEXT, NULL::UUID, v_income_balance, v_unallocated_savings;
        RETURN;
    END IF;

    v_new_expense_id := gen_random_uuid();
    INSERT INTO expense (
        id, user_id, income_id, category_id, title, description, amount, payment_method, priority, transaction_date, created_at
    ) VALUES (
        v_new_expense_id, p_user_id, p_income_id, p_category_id, p_title, p_description, p_amount, COALESCE(p_payment_method, 'Savings Vault'), COALESCE(p_priority, 'Medium'), COALESCE(p_transaction_date, NOW()), NOW()
    );

    IF v_liquid_deduction > 0 THEN
        UPDATE income
        SET balance = balance - v_liquid_deduction, updated_at = NOW()
        WHERE id = p_income_id AND (user_id = p_user_id OR user_id IS NULL);
    END IF;

    INSERT INTO savings_history (
        id, user_id, budget_id, saved_amount, credited_on, description, transaction_type, related_expense_id, created_at
    ) VALUES (
        gen_random_uuid(), p_user_id, NULL, -v_shortfall, NOW(), 'Savings withdrawal for shortfall: ' || p_title, 'UNALLOCATED_WITHDRAWAL', v_new_expense_id, NOW()
    );

    RETURN QUERY SELECT 
        true, 
        'Savings-funded expense created successfully.'::TEXT, 
        v_new_expense_id,
        0::NUMERIC, 
        (v_unallocated_savings - v_shortfall);
END;
$$ LANGUAGE plpgsql;


-- H. ATOMIC DEADLOCK-SAFE ACCOUNT TRANSFER RPC FUNCTION
CREATE OR REPLACE FUNCTION transfer_between_accounts(
    p_user_id UUID,
    p_from_income_id UUID,
    p_to_income_id UUID,
    p_amount NUMERIC,
    p_description TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    transfer_id UUID,
    from_account_new_balance NUMERIC,
    to_account_new_balance NUMERIC
) AS $$
DECLARE
    v_from_account RECORD;
    v_to_account RECORD;
    v_transfer_id UUID;
    v_account_count INT;
BEGIN
    -- 1. Basic amount validation
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RETURN QUERY SELECT false, 'Transfer amount must be greater than zero.'::TEXT, NULL::UUID, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    -- 2. Basic source != destination validation
    IF p_from_income_id = p_to_income_id THEN
        RETURN QUERY SELECT false, 'Source and destination accounts must be different.'::TEXT, NULL::UUID, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    -- 3. Deterministic locking of BOTH accounts ordered by ID to prevent deadlocks
    PERFORM id, source, balance, user_id
    FROM income
    WHERE id IN (p_from_income_id, p_to_income_id)
      AND (user_id = p_user_id OR user_id IS NULL)
    ORDER BY id
    FOR UPDATE;

    -- 4. Verify exactly two account rows exist for this transaction
    SELECT COUNT(*) INTO v_account_count
    FROM income
    WHERE id IN (p_from_income_id, p_to_income_id)
      AND (user_id = p_user_id OR user_id IS NULL);

    IF v_account_count < 2 THEN
        RETURN QUERY SELECT false, 'Source or destination account not found or unauthorized.'::TEXT, NULL::UUID, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    -- 5. Resolve source and destination accounts
    SELECT id, source, balance INTO v_from_account
    FROM income
    WHERE id = p_from_income_id AND (user_id = p_user_id OR user_id IS NULL);

    SELECT id, source, balance INTO v_to_account
    FROM income
    WHERE id = p_to_income_id AND (user_id = p_user_id OR user_id IS NULL);

    -- 6. Validate source balance >= transfer amount
    IF COALESCE(v_from_account.balance, 0) < p_amount THEN
        RETURN QUERY SELECT false, ('Insufficient balance in source account ' || v_from_account.source || ' (Available: ₹' || COALESCE(v_from_account.balance, 0) || ', Required: ₹' || p_amount || ').')::TEXT, NULL::UUID, v_from_account.balance, v_to_account.balance;
        RETURN;
    END IF;

    -- 7. Perform atomic balance updates
    UPDATE income
    SET balance = balance - p_amount, updated_at = NOW()
    WHERE id = p_from_income_id AND (user_id = p_user_id OR user_id IS NULL);

    UPDATE income
    SET balance = balance + p_amount, updated_at = NOW()
    WHERE id = p_to_income_id AND (user_id = p_user_id OR user_id IS NULL);

    -- 8. Record transfer history entry
    v_transfer_id := gen_random_uuid();
    INSERT INTO account_transfer (
        id, user_id, from_income_id, to_income_id, amount, description, transferred_on, created_at
    ) VALUES (
        v_transfer_id, p_user_id, p_from_income_id, p_to_income_id, p_amount, COALESCE(p_description, 'Account Transfer'), NOW(), NOW()
    );

    RETURN QUERY SELECT 
        true, 
        'Transfer completed successfully.'::TEXT, 
        v_transfer_id,
        (v_from_account.balance - p_amount),
        (v_to_account.balance + p_amount);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. USER FEEDBACK SYSTEM TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    feedback_type VARCHAR(30) NOT NULL
        CHECK (
            feedback_type IN (
                'BUG',
                'FEATURE_REQUEST',
                'IMPROVEMENT',
                'OTHER'
            )
        ),

    subject VARCHAR(150),

    message TEXT NOT NULL
        CHECK (
            char_length(trim(message)) > 0
            AND char_length(message) <= 2000
        ),

    rating SMALLINT
        CHECK (
            rating IS NULL
            OR rating BETWEEN 1 AND 5
        ),

    status VARCHAR(20) NOT NULL DEFAULT 'NEW'
        CHECK (
            status IN (
                'NEW',
                'REVIEWED',
                'PLANNED',
                'IN_PROGRESS',
                'DONE',
                'REJECTED'
            )
        ),

    admin_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access on feedback" ON public.feedback;
CREATE POLICY "Allow service_role full access on feedback" ON public.feedback FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;

