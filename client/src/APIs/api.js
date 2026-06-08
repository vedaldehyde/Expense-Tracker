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
    }
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


export { getExpenseCategories, submitExpenseForm, getExpenses }