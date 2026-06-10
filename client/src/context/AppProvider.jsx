import React, { useEffect, useState } from 'react'
import AppContext from './AppContext'
import { getBudgets, getExpenseCategories, getExpenses } from '../APIs/api'

const AppProvider = ({children}) => {
    const [budgetModal, setBudgetModal] = useState(false)
    const [expenseModal, setExpenseModal] = useState(false)
    const [expenseCategories, setExpenseCategories] = useState([])
    const [expenses, setExpenses] = useState([])
    const [budgets, setBudgets] = useState([])

    const toggleBudgetModal = () => {
        setBudgetModal(prev => !prev)
    }

    const toggleExpenseModal = () => {
        setExpenseModal(prev => !prev)
    }

    useEffect(() => {
        const fetchData = async () => {
            const categories = await getExpenseCategories();
            const expensesData = await getExpenses();
            const budgetData = await getBudgets()
            setExpenseCategories(categories)
            setExpenses(expensesData)
            setBudgets(budgetData)
        }

        fetchData()
    }, [])

    return (
        <AppContext.Provider
            value={{
                budgetModal,
                expenseModal,
                expenseCategories,
                expenses,
                setExpenses,
                toggleBudgetModal,
                toggleExpenseModal,
                budgets,
                setBudgets
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export default AppProvider