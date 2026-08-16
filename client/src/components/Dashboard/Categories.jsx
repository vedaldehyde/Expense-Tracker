import React, { useContext, useState, useEffect, useMemo } from "react";
import AppContext from "../../context/AppContext";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register ChartJS Components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const PREDEFINED_COLORS = {
  food: '#f59e0b',
  utilities: '#3b82f6',
  entertainment: '#ec4899',
  transport: '#10b981',
  health: '#ef4444',
  medicals: '#ef4444',
  others: '#9ca3af'
};

const getCategoryColor = (categoryName) => {
  if (!categoryName) return '#9ca3af';
  const lower = categoryName.toLowerCase().trim();
  if (PREDEFINED_COLORS[lower]) {
    return PREDEFINED_COLORS[lower];
  }
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
};

const Categories = ({ style }) => {
  const { expenses, categoryExpenses, setCategoryFilter, categoryFilter } = useContext(AppContext);
  const [activeChart] = useState("categories");
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentYear = new Date().getFullYear();
  const dynamicYears = Array.from({ length: 12 }, (_, index) => currentYear - index);
  const dynamicMonths = Array.from({ length: 12 }, (_, index) => index + 1);

  // Compute category breakdown from backend categoryExpenses or fallback directly to expenses list
  const computedCategoryData = useMemo(() => {
    if (categoryExpenses && Array.isArray(categoryExpenses) && categoryExpenses.length > 0) {
      return categoryExpenses;
    }

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) return [];

    const selectedMonth = Number(categoryFilter.month || (new Date().getMonth() + 1));
    const selectedYear = Number(categoryFilter.year || new Date().getFullYear());

    const filteredExpenses = expenses.filter(e => {
      if (!e.transaction_date || e.amount === undefined || e.amount === null) return false;
      const d = new Date(e.transaction_date);
      return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
    });

    const categoryTotals = {};
    filteredExpenses.forEach(e => {
      const catName = e.category_type || e.category || 'Others';
      const amount = Number(e.amount || 0);
      if (amount > 0) {
        categoryTotals[catName] = (categoryTotals[catName] || 0) + amount;
      }
    });

    return Object.entries(categoryTotals).map(([catName, total]) => ({
      category_type: catName,
      amount: total
    }));
  }, [categoryExpenses, expenses, categoryFilter]);

  // Pie Chart Data
  const pieData = {
    labels: computedCategoryData.map(category => category.category_type),
    datasets: [
      {
        data: computedCategoryData.map(category => category.amount),
        backgroundColor: computedCategoryData.map(category => getCategoryColor(category.category_type)),
        borderWidth: 0
      }
    ]
  };

  const CHART_COLORS = {
    Food: '#f59e0b',
    Utilities: '#3b82f6',
    Entertainment: '#ec4899',
    Transport: '#10b981',
    Health: '#ef4444',
    Medicals: '#ef4444',
    Others: '#9ca3af',
    GridLine: 'rgba(255, 255, 255, 0.05)',
    Text: '#94a3b8',
    Primary: '#6366f1'
  };

  // Calculate dynamic bar graph data for last 6 months
  const now = new Date();
  const last6MonthsBar = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6MonthsBar.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      total: 0
    });
  }

  if (expenses && expenses.length > 0) {
    expenses.forEach((e) => {
      if (!e.transaction_date || !e.amount) return;
      const d = new Date(e.transaction_date);
      const match = last6MonthsBar.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
      if (match) {
        match.total += e.amount;
      }
    });
  }

  // Bar Graph Data
  const barData = {
    labels: last6MonthsBar.map((m) => m.label),
    datasets: [
      {
        label: "Expenses",
        data: last6MonthsBar.map((m) => m.total),
        backgroundColor: "#6366f1",
        borderRadius: 8
      }
    ]
  };

  // Shared Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          color: CHART_COLORS.Text,
          font: { family: 'Outfit', size: 11 },
          boxWidth: 12,
          padding: 10
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.label}: ₹${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    cutout: '65%'
  };

  return (
    <section
      className="dashboard-card card-chart"
      id="section-charts-card"
      style={style}
    >
      <div className="card-header-wrapper">
        <span className="card-title">
          <svg viewBox="0 0 24 24">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          Spending Analytics
        </span>

        <div className="chart-header-actions">
          <select className="chart-tab active" name="month_select" id="month-select" value={categoryFilter.month} onChange={(e) => setCategoryFilter(prev => ({ ...prev, month: Number(e.target.value) }))}>
            <option value="">-- Select Month --</option>
            {dynamicMonths.map(month => <option key={month} value={month}>{month}</option>)}
          </select>

          <select className="chart-tab active" name="year_select" id="year-select" value={categoryFilter.year} onChange={(e) => setCategoryFilter(prev => ({ ...prev, year: Number(e.target.value) }))}>
            <option value="">-- Select Year --</option>
            {dynamicYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      <div className="chart-container-wrapper" style={{ height: isMobile ? '320px' : '280px', width: '100%', position: 'relative', overflow: 'hidden' }}>
        {computedCategoryData.length === 0 ? (
          <div className="ai-empty-state">
            <svg viewBox="0 0 24 24">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
            <p className="ai-suggestion-text">No expenses recorded for this period.</p>
          </div>
        ) : activeChart === "categories" ? (
          <Pie data={pieData} options={options} />
        ) : (
          <Bar data={barData} options={options} />
        )}
      </div>
    </section>
  );
};

export default Categories;