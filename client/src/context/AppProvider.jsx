import React, { useEffect, useState } from 'react'
import AppContext from './AppContext'
import { getBudgets, getExpenseCategories, getExpenses, getIncomes } from '../APIs/api'

const AppProvider = ({children}) => {
    const [budgetModal, setBudgetModal] = useState(false)
    const [expenseModal, setExpenseModal] = useState(false)
    const [expenseCategories, setExpenseCategories] = useState([])
    const [expenses, setExpenses] = useState([])
    const [budgets, setBudgets] = useState([])
    const [incomes, setIncomes] = useState({incomesList: [], total_balance: 0})
    const [addBalance, setAddBalance] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState('')

    const toggleBalanceModal = () => {
        setAddBalance(prev => !prev)
    }

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
            const incomesData = await getIncomes()
            setExpenseCategories(categories)
            setExpenses(expensesData)
            setBudgets(budgetData)
            setIncomes(incomesData)
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
                setBudgets,
                toggleBalanceModal,
                addBalance,
                setIncomes,
                getIncomes,
                incomes,
                selectedAccount, 
                setSelectedAccount,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export default AppProvider