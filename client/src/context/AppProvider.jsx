import React, { useEffect, useState } from 'react'
import AppContext from './AppContext'
import { getExpenseCategories, getExpenses } from '../APIs/api'

const AppProvider = ({children}) => {
    const [budgetModal, setBudgetModal] = useState(false)
    const [expenseModal, setExpenseModal] = useState(false)
    const [expenseCategories, setExpenseCategories] = useState([])
    const [expenses, setExpenses] = useState([])

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
            setExpenseCategories(categories)
            setExpenses(expensesData)
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
                toggleExpenseModal
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export default AppProvider