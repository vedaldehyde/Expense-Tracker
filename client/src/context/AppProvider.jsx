import React, { useEffect, useState } from 'react'
import AppContext from './AppContext'
import { checkIsAdmin, getAccountTransfers, getBudgets, getCategoryWiseExpenses, getExpenseCategories, getExpenses, getIncomes, getTotalSavings, getUnallocatedSavings } from '../APIs/api'

const AppProvider = ({children}) => {
    const today = new Date();
    const [budgetModal, setBudgetModal] = useState(false)
    const [expenseModal, setExpenseModal] = useState(false)
    const [savingsModal, setSavingsModal] = useState(false)
    const [transferModal, setTransferModal] = useState(false)
    const [feedbackModal, setFeedbackModal] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [selectedSavingsBudget, setSelectedSavingsBudget] = useState(null)
    const [expenseCategories, setExpenseCategories] = useState([])
    const [expenses, setExpenses] = useState([])
    const [budgets, setBudgets] = useState([])
    const [incomes, setIncomes] = useState({incomesList: [], total_balance: 0})
    const [addBalance, setAddBalance] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState('')
    const [categoryExpenses, setCategoryExpenses] = useState(null)
    const [categoryFilter, setCategoryFilter] = useState({month: today.getMonth() + 1, year: today.getFullYear()});
    const [accumulatedSavings, setAccumulatedSavings] = useState(0);
    const [unallocatedSavings, setUnallocatedSavings] = useState(0);
    const [accountTransfers, setAccountTransfers] = useState([]);

    const toggleBalanceModal = () => {
        setAddBalance(prev => !prev)
    }

    const toggleBudgetModal = () => {
        setBudgetModal(prev => !prev)
    }

    const toggleExpenseModal = () => {
        setExpenseModal(prev => !prev)
    }

    const toggleTransferModal = () => {
        setTransferModal(prev => !prev)
    }

    const toggleFeedbackModal = () => {
        setFeedbackModal(prev => !prev)
    }

    const toggleSavingsModal = (budget = null) => {
        if (budget) {
            setSelectedSavingsBudget(budget);
            setSavingsModal(true);
        } else {
            setSavingsModal(false);
            setSelectedSavingsBudget(null);
        }
    }

    const fetchTotalSavings = async () => {
        try {
            const [total, unalloc] = await Promise.all([
                getTotalSavings(),
                getUnallocatedSavings()
            ]);
            setAccumulatedSavings(total);
            setUnallocatedSavings(unalloc);
        } catch (error) {
            console.error("Failed to fetch savings:", error);
        }
    };

    const fetchAccountTransfers = async () => {
        try {
            const transfers = await getAccountTransfers();
            setAccountTransfers(transfers);
        } catch (error) {
            console.error("Failed to fetch account transfers:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const categories = await getExpenseCategories();
            const expensesData = await getExpenses();
            const budgetData = await getBudgets();
            const incomesData = await getIncomes();
            const transfers = await getAccountTransfers();
            const adminFlag = await checkIsAdmin();
            setExpenseCategories(categories);
            setExpenses(expensesData);
            setBudgets(budgetData);
            setIncomes(incomesData);
            setAccountTransfers(transfers);
            setIsAdmin(adminFlag);
            await fetchTotalSavings();
        }

        fetchData()
    }, [])

    useEffect(() => {
        const fetchCategoryExpenses = async () => {
            const data = await getCategoryWiseExpenses(categoryFilter);
            setCategoryExpenses(data);
        };
        fetchCategoryExpenses();

    }, [categoryFilter]);

    return (
        <AppContext.Provider
            value={{
                budgetModal,
                expenseModal,
                savingsModal,
                transferModal,
                toggleTransferModal,
                feedbackModal,
                toggleFeedbackModal,
                isAdmin,
                selectedSavingsBudget,
                setSelectedSavingsBudget,
                toggleSavingsModal,
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
                categoryExpenses,
                setCategoryFilter,
                categoryFilter,
                accumulatedSavings,
                setAccumulatedSavings,
                unallocatedSavings,
                setUnallocatedSavings,
                fetchTotalSavings,
                accountTransfers,
                setAccountTransfers,
                fetchAccountTransfers
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export default AppProvider