import React from 'react'
import Categories from './Categories'
import ActiveBudgets from '../Budgets/ActiveBudgets'
import Expenses from './Expenses'
import AICoach from '../AI/AICoach'

const Dashboard = () => {
  return (
    <>
        <Categories />
        <ActiveBudgets />
        <Expenses />
        <AICoach />
    </>
  )
}

export default Dashboard