import React from 'react'
import Categories from './Categories'
import ActiveBudgets from '../Budgets/ActiveBudgets'
import SavingsTracker from './SavingsTracker'
import SpendingTrends from './SpendingTrends'
import RecentTransactions from './RecentTransactions'
import TransferHistoryList from './TransferHistoryList'

const Dashboard = () => {
  return (
    <>
      {/* Left Column (Spending Analytics, Recent Expenditures & Transfers on Desktop) */}
      <div className="dashboard-col-left">
        <div className="dashboard-item-categories">
          <Categories style={{ flex: '1 1 0%', margin: 0 }} />
        </div>
        <div className="dashboard-item-recent">
          <RecentTransactions style={{ flex: '1 1 0%', margin: 0 }} />
          <TransferHistoryList />
        </div>
      </div>

      {/* Right Column (Budget Tracker on Desktop) */}
      <div className="dashboard-col-right">
        <ActiveBudgets style={{ flex: '1 1 0%', margin: 0, width: '100%' }} />
      </div>

      {/* Full-Width Trackers (Savings Progress & Spending Trends on Desktop) */}
      <div className="dashboard-col-full dashboard-item-savings">
        <SavingsTracker />
      </div>
      <div className="dashboard-col-full dashboard-item-trends">
        <SpendingTrends />
      </div>
    </>
  )
}

export default Dashboard