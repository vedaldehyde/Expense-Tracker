EXPENSE TRACKER — BUSINESS RULES / SOURCE OF TRUTH

1. REGULAR BUDGET
- One active overlapping regular budget per income account.
- Regular budget tracks variable spending.
- Expense must match user_id + income_id + budget period.
- Expenses created before the budget was created must NOT be retroactively counted.
- Fixed expenses configured for that budget are excluded from variable spent.
- Regular budget can become Active, Upcoming, Completed or Overspent.

2. SAVINGS BUDGET
- Can coexist with a regular budget on the same income account.
- Multiple savings goals may exist.
- target_amount = total goal.
- budget_amount = contribution required per selected frequency.
- frequency = daily / weekly / monthly.
- Savings progress comes from savings_history.
- Normal expenses must NOT directly increase/decrease savings progress.
- Savings budget never becomes Overspent.

3. FIXED EXPENSES
- Stored in fixed_expense.
- Linked to the appropriate budget through budget_id.
- Fixed expense categories are excluded from regular variable spending.
- Do not redesign this relationship without approval.

4. EXPENSES
- Expenses can exist without any budget.
- Having a budget is OPTIONAL.
- Expenses made while no budget exists remain normal expense-history records.
- Creating a budget later must NOT retroactively claim old expenses.

5. SAVINGS HISTORY
- Source of truth for actual savings progress.
- Dashboard calculates savings progress from SUM(saved_amount).
- Do not calculate savings progress from normal expenses.

6. IMPORTANT ARCHITECTURAL RULE
Do not modify previously validated business logic while implementing an
unrelated feature.

Before changing existing SQL/backend logic, explain:
- what is being changed
- why
- which existing rule requires the change
- whether it affects previously tested behavior