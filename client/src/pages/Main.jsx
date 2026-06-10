import React from 'react'
import '../css/index.css'
import SideNav from '../components/SideNav'
import DashboardHeader from '../components/Dashboard/DashboardHeader'
import ExpenseStatus from '../components/Dashboard/ExpenseStatus'
import Dashboard from '../components/Dashboard/Dashboard'
import { Route, Routes } from 'react-router-dom'
import Expenses from '../components/Dashboard/Expenses'
import AICoach from '../components/AI/AICoach'
import BudgetForm from '../components/Budgets/BudgetForm'
import ExpenseForm from '../components/Expenses/ExpenseForm'
import BudgetList from '../components/Budgets/BudgetList'

const Main = () => {
  return (
    <div id="app-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
        <SideNav />
      <main className="main-content">
        <DashboardHeader />
        <ExpenseStatus />
        <Routes>
          <Route path="/" element={<div className="dashboard-grid"><Dashboard /></div>} />
          <Route path="/expenses" element={<Expenses />}/>
          <Route path="/budgets" element={<BudgetList />}/>
          <Route path="/aicoach" element={<AICoach />}/>
        </Routes>
      </main>
      <BudgetForm />
      <ExpenseForm />
    </div>
  )
}

export default Main