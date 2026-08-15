import { ensureGuid } from "../utils/utils";

const API_BASE_URL = 'http://localhost:5039/api';

const authorizedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, {
        ...options,
        headers
    });
};

const extractErrorMessage = async (res, defaultMsg) => {
    try {
        const text = await res.text();
        if (!text) return defaultMsg;
        if (text.includes('System.') || text.includes('Exception:') || text.includes('<!DOCTYPE html>') || text.includes('HEADERS ======')) {
            return defaultMsg;
        }
        try {
            const json = JSON.parse(text);
            return json.message || json.title || defaultMsg;
        } catch {
            return text.length < 100 ? text : defaultMsg;
        }
    } catch {
        return defaultMsg;
    }
};

const loginUser = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/Auth/Login`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to sign in. Please check your credentials.');
        throw new Error(errorMsg);
    }
    return await res.json();
};

const registerUser = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/Auth/Register`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to sign up. Please try again.');
        throw new Error(errorMsg);
    }
    return await res.json();
};

const getExpenseCategories = async () => {
    try {
        const res = await authorizedFetch(`${API_BASE_URL}/Categories/GetCategories`, { method: 'POST' });
        if (!res.ok) {
            throw new Error('Failed to fetch categories');
        }
        return await res.json();
    } catch (error) {
        console.error('getExpenseCategories error:', error);
        return [];
    }
};

const submitExpenseForm = async (formData) => {
    let parsedIncomeId = null;
    if (formData.income_source && formData.income_source !== "" && formData.income_source !== "none") {
        parsedIncomeId = formData.income_source;
    }
    const request = {
        category_id: formData.expense_category,
        title: formData.expense_title,
        amount: Number(formData.expense_amount),
        category: formData.expense_category,
        description: formData.expense_notes || "",
        payment_method: formData.payment_method || "UPI",
        priority: formData.priority_type || "normal",
        income_id: parsedIncomeId,
        date: formData.expense_date ? new Date(formData.expense_date).toISOString() : new Date().toISOString()
    };
    
    const res = await authorizedFetch(`${API_BASE_URL}/Expense/CreateExpense`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
    });
    
    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to add expense');
        throw new Error(errorMsg);
    }
    
    return await res.json();
};

const submitSavingsFundedExpense = async (formData) => {
    let parsedIncomeId = null;
    if (formData.income_source && formData.income_source !== "" && formData.income_source !== "none") {
        parsedIncomeId = formData.income_source;
    }
    const request = {
        category_id: formData.expense_category,
        title: formData.expense_title,
        amount: Number(formData.expense_amount),
        category: formData.expense_category,
        description: formData.expense_notes || "",
        payment_method: "Savings Vault",
        priority: formData.priority_type || "normal",
        income_id: parsedIncomeId,
        date: formData.expense_date ? new Date(formData.expense_date).toISOString() : new Date().toISOString()
    };

    const res = await authorizedFetch(`${API_BASE_URL}/Expense/AddSavingsFundedExpense`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
    });

    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to process savings-funded expense');
        throw new Error(errorMsg);
    }

    return await res.json();
};

const getExpenses = async () => {
    try {
        const res = await authorizedFetch(`${API_BASE_URL}/Expense/GetExpenses`, { method: 'POST' });
        if (!res.ok) {
            throw new Error('Failed to fetch expenses');
        }
        return await res.json();
    } catch (error) {
        console.error('getExpenses error:', error);
        return [];
    }
};

const createCategory = async (categoryData) => {
    const res = await authorizedFetch(`${API_BASE_URL}/Categories/CreateCategory`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return await res.json();
};

const submitBudgetForm = async (formData) => {
    const rawCategory = formData.budget_category || formData.budget_type || 'regular';
    let categoryText = typeof rawCategory === 'string' ? rawCategory.trim() : 'regular';

    let parsedTargetAmount = 0;
    let parsedBudgetAmount = 0;
    let parsedVariableExpense = 0;

    if (categoryText.toLowerCase() === 'savings') {
        const targetVal = Number(formData.target_amount || formData.saving_target_amount);
        if (!isNaN(targetVal) && targetVal > 0) {
            parsedTargetAmount = targetVal;
        }

        const bVal = Number(formData.budget_amount || formData.budget_limit);
        if (!isNaN(bVal) && bVal > 0) {
            parsedBudgetAmount = bVal;
        }
    } else {
        const budgetVal = Number(formData.budget_amount || formData.budget_limit);
        if (!isNaN(budgetVal) && budgetVal > 0) {
            parsedBudgetAmount = budgetVal;
        }
        const varVal = Number(formData.variable_amount || formData.variable_expense);
        if (!isNaN(varVal) && varVal >= 0) {
            parsedVariableExpense = varVal;
        }
    }

    const payload = {
        budget_name: formData.budget_name || (categoryText.toLowerCase() === 'regular' ? 'Regular Budget' : 'Savings Goal'),
        budget_type: categoryText,
        budget_frequency: formData.budget_frequency || formData.frequency || formData.budget_period || 'monthly',
        start_date: formData.start_date,
        end_date: formData.end_date,
        target_amount: parsedTargetAmount,
        income_id: formData.income_source || formData.income_id,
        variableExpenses: parsedVariableExpense,
        budget_amount: parsedBudgetAmount,
        fixedExpenses: formData.fixed_expenses || []
    };

    const res = await authorizedFetch(`${API_BASE_URL}/Budget/CreateBudget`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to create budget');
        throw new Error(errorMsg);
    }
    
    return await res.json();
};

const getBudgets = async () => {
    try {
        const res = await authorizedFetch(`${API_BASE_URL}/Budget/GetBudgets`, { method: 'POST' });
        if (!res.ok) {
            throw new Error('Failed to fetch budgets');
        }
        return await res.json();
    } catch (error) {
        console.error('getBudgets error:', error);
        return [];
    }
};

const submitIncomeForm = async (formData) => {
    const res = await authorizedFetch(`${API_BASE_URL}/Income/CreateIncome`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            source: formData.source,
            balance: Number(formData.balance),
            isSalary: formData.is_salary === 'true' || formData.is_salary === true
        })
    });
    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to create income account');
        throw new Error(errorMsg);
    }
    return await res.json();
};

const getIncomes = async () => {
    try {
        const res = await authorizedFetch(`${API_BASE_URL}/Income/GetIncomes`, { method: 'POST' });
        if (!res.ok) {
            throw new Error('Failed to fetch income accounts');
        }
        return await res.json();
    } catch (error) {
        console.error('getIncomes error:', error);
        return { incomesList: [], total_balance: 0 };
    }
};

const updateIncomeForm = async (formData) => {
    const res = await authorizedFetch(`${API_BASE_URL}/Income/UpdateIncome`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: formData.account_id,
            balance: Number(formData.balance)
        })
    });
    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to update income account');
        throw new Error(errorMsg);
    }
    return await res.json();
};

const getCategoryWiseExpenses = async (monthOrFilter, yearParam) => {
    try {
        let m, y;
        if (typeof monthOrFilter === 'object' && monthOrFilter !== null) {
            m = Number(monthOrFilter.month);
            y = Number(monthOrFilter.year);
        } else {
            m = Number(monthOrFilter);
            y = Number(yearParam);
        }

        const res = await authorizedFetch(`${API_BASE_URL}/Expense/GetExpenseByCategories`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month: m, year: y })
        });
        if (!res.ok) throw new Error('Failed to fetch category expenses');
        return await res.json();
    } catch (error) {
        console.error('getCategoryWiseExpenses error:', error);
        return [];
    }
};

const getAIRecommendations = async () => {
    try {
        const res = await authorizedFetch(`${API_BASE_URL}/AI/GetRecommendations`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to fetch AI recommendations');
        return await res.json();
    } catch (error) {
        console.error('getAIRecommendations error:', error);
        return null;
    }
};

const getTotalSavings = async () => {
    const res = await authorizedFetch(`${API_BASE_URL}/SavingsHistory/GetTotalSavings`, {
        method: 'GET'
    });

    if (!res.ok) {
        throw new Error('Failed to fetch total savings');
    }

    const data = await res.json();
    return Number(data.totalSavings ?? data.total_savings ?? 0);
};

const getUnallocatedSavings = async () => {
    const res = await authorizedFetch(`${API_BASE_URL}/SavingsHistory/GetUnallocatedSavings`, {
        method: 'GET'
    });

    if (!res.ok) {
        throw new Error('Failed to fetch unallocated savings');
    }

    const data = await res.json();
    return Number(data.unallocatedSavings ?? data.unallocated_savings ?? 0);
};

const addSavingsContribution = async (data) => {
    const res = await authorizedFetch(`${API_BASE_URL}/SavingsHistory/AddContribution`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            budget_id: data.budget_id,
            amount: Number(data.amount),
            credited_on: data.credited_on || new Date().toISOString(),
            description: data.description || 'Fresh Contribution'
        })
    });

    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to add savings contribution');
        throw new Error(errorMsg);
    }

    return await res.json();
};

const transferBetweenAccounts = async (data) => {
    const res = await authorizedFetch(`${API_BASE_URL}/AccountTransfer/Transfer`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            from_income_id: data.from_income_id,
            to_income_id: data.to_income_id,
            amount: Number(data.amount),
            description: data.description || 'Account Transfer'
        })
    });

    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to complete account transfer');
        throw new Error(errorMsg);
    }

    return await res.json();
};

const getAccountTransfers = async () => {
    try {
        const res = await authorizedFetch(`${API_BASE_URL}/AccountTransfer/GetTransfers`, {
            method: 'GET'
        });

        if (!res.ok) {
            throw new Error('Failed to fetch account transfers');
        }

        return await res.json();
    } catch (error) {
        console.error('getAccountTransfers error:', error);
        return [];
    }
};

const askAICoach = async (message, history = []) => {
    const res = await authorizedFetch(`${API_BASE_URL}/AI/Chat`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error('AI Coach response error');
    return await res.json();
};

const submitFeedback = async (feedbackData) => {
    const res = await authorizedFetch(`${API_BASE_URL}/Feedback/Create`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            feedback_type: feedbackData.feedback_type,
            subject: feedbackData.subject,
            message: feedbackData.message,
            rating: feedbackData.rating ? Number(feedbackData.rating) : null
        })
    });

    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to submit feedback');
        throw new Error(errorMsg);
    }

    return await res.json();
};

const checkIsAdmin = async () => {
    try {
        const res = await authorizedFetch(`${API_BASE_URL}/Feedback/CheckAdmin`, {
            method: 'GET'
        });
        if (!res.ok) return false;
        const data = await res.json();
        return !!data.isAdmin;
    } catch (error) {
        console.error("checkIsAdmin error:", error);
        return false;
    }
};

const getAllFeedbackAdmin = async () => {
    const res = await authorizedFetch(`${API_BASE_URL}/Feedback/GetAll`, {
        method: 'GET'
    });

    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to fetch admin feedback');
        throw new Error(errorMsg);
    }

    return await res.json();
};

const updateFeedbackStatusAdmin = async (updateData) => {
    const res = await authorizedFetch(`${API_BASE_URL}/Feedback/UpdateStatus`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            feedback_id: updateData.feedback_id,
            status: updateData.status,
            admin_notes: updateData.admin_notes
        })
    });

    if (!res.ok) {
        const errorMsg = await extractErrorMessage(res, 'Failed to update feedback status');
        throw new Error(errorMsg);
    }

    return await res.json();
};

export {
    loginUser,
    registerUser,
    getExpenseCategories,
    createCategory,
    submitExpenseForm,
    submitSavingsFundedExpense,
    getExpenses,
    submitBudgetForm,
    getBudgets,
    submitIncomeForm,
    getIncomes,
    updateIncomeForm,
    getCategoryWiseExpenses,
    getAIRecommendations,
    getTotalSavings,
    getUnallocatedSavings,
    addSavingsContribution,
    transferBetweenAccounts,
    getAccountTransfers,
    askAICoach,
    submitFeedback,
    checkIsAdmin,
    getAllFeedbackAdmin,
    updateFeedbackStatusAdmin
};