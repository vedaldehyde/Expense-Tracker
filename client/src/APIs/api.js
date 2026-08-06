import { ensureGuid } from "../utils/utils";

const getExpenseCategories = async () => {
    try {
        const res = await fetch('http://localhost:5039/api/Categories/GetCategories', {method: 'POST'})
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        const json = await res.json()
        return json
    } catch (error) {
        console.log(error)
        return []
    }
}

const submitExpenseForm = async (formData) => {
    const request = {
        category_id : formData.expense_category,
        title: formData.expense_title,
        amount: formData.expense_amount,
        category: formData.expense_category,
        description: formData.expense_notes,
        payment_method: "UPI",
        priority: formData.priority_type,
        income_id: formData.income_source
    }
    console.log('api data ',JSON.stringify(request));
    
    try {
        const res = await fetch('http://localhost:5039/api/Expense/CreateExpense', {method:'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify(request)})
        if (!res.ok) {
            throw new Error('CreateExpense network response was not ok');
        }
        const json = await res.json()
        return json
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getExpenses = async (formData) => {
    try {
        const res = await fetch('http://localhost:5039/api/Expense/GetExpenses', {method: 'POST'})
        if (!res.ok) {
            throw new Error('GetExpenses network response was not ok');
        }
        const json = await res.json()
        return json
    } catch (error) {
        console.log(error)
        return []
    }
}

const submitBudgetForm = async (formData) => {
    const isSavings = formData.budget_type === "savings";
    const request = {
        income_id: formData.income_source,
        budget_name: formData.budget_name || formData.budget_type,
        budget_type: formData.budget_type,
        budget_frequency: formData.budget_frequency || "monthly",
        start_date: formData.start_date || new Date().toISOString().split('T')[0],
        end_date: formData.end_date,
        target_amount: isSavings ? Number(formData.target_amount) : Number(formData.budget_amount),
        budget_amount: Number(formData.budget_amount),
        fixedExpenses: formData.fixed_expenses,
        variableExpenses: Number(formData.variable_amount || 0)
    };


    console.log("budget request", request);


    const res = await fetch('http://localhost:5039/api/Budget/CreateBudget',{method: 'POST',headers: {"Content-Type": "application/json"},body: JSON.stringify(request)});
    if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
    }

    return await res.json();
};

const getBudgets = async (formData) => {
    try {
        const res = await fetch('http://localhost:5039/api/Budget/GetBudgets', {method: 'POST'})
        if (!res.ok) {
            throw new Error('GetExpenses network response was not ok');
        }
        const json = await res.json()
        console.log('GetBudgets ', json);
        
        return json
    } catch (error) {
        console.log(error)
        return []
    }
}

const submitIncomeForm = async (formData) => {
    const request = {
        source: formData.source,
        balance: formData.balance,
        isSalary: Boolean(formData.is_salary)
    }
    try {
        const res = await fetch('http://localhost:5039/api/Income/CreateIncome', {method:'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify(request)})
        if (!res.ok) {
            throw new Error('CreateIncome network response was not ok');
        }
        const json = await res.json()
        return json
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getIncomes = async (formData) => {
    try {
        const res = await fetch('http://localhost:5039/api/Income/GetIncomes', {method: 'POST'})
        if (!res.ok) {
            throw new Error('GetIncomes network response was not ok');
        }
        const json = await res.json()
        return json
    } catch (error) {
        console.log(error)
        return []
    }
}

const updateIncomeForm = async (formData) => {
    console.log('income id ', formData);
    

    const request = {
        id: ensureGuid(formData.account_id),
        source: formData.source,
        balance: formData.balance,
    }
    try {
        const res = await fetch('http://localhost:5039/api/Income/UpdateIncome', {method:'PUT', headers: {"Content-Type": "application/json"}, body: JSON.stringify(request)})
        if (!res.ok) {
            throw new Error('UpdateIncome network response was not ok');
        }
        const json = await res.json()
        return json
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export { getExpenseCategories, submitExpenseForm, getExpenses, submitBudgetForm, getBudgets, submitIncomeForm, getIncomes, updateIncomeForm }