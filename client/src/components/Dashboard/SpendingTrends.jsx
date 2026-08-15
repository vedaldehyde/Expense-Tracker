import React, { useContext, useState } from "react";
import AppContext from "../../context/AppContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register ChartJS Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SpendingTrends = () => {
  const { expenses } = useContext(AppContext);
  const [trendType, setTrendType] = useState("monthly"); // "monthly" or "daily"

  const now = new Date();

  // 1. Calculate Monthly Spending (Last 6 Months)
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      total: 0
    });
  }

  if (expenses && expenses.length > 0) {
    expenses.forEach((e) => {
      if (!e.transaction_date || !e.amount) return;
      const d = new Date(e.transaction_date);
      const ey = d.getFullYear();
      const em = d.getMonth();
      const match = last6Months.find((m) => m.year === ey && m.month === em);
      if (match) {
        match.total += e.amount;
      }
    });
  }

  const monthlyLabels = last6Months.map((m) => m.label);
  const monthlyData = last6Months.map((m) => m.total);

  // 2. Calculate Daily Spending (Last 14 Days)
  const last14Days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    last14Days.push({
      label: d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      date: d.getDate(),
      total: 0
    });
  }

  if (expenses && expenses.length > 0) {
    expenses.forEach((e) => {
      if (!e.transaction_date || !e.amount) return;
      const d = new Date(e.transaction_date);
      const match = last14Days.find(
        (m) =>
          m.year === d.getFullYear() &&
          m.month === d.getMonth() &&
          m.date === d.getDate()
      );
      if (match) {
        match.total += e.amount;
      }
    });
  }

  const dailyLabels = last14Days.map((d) => d.label);
  const dailyData = last14Days.map((d) => d.total);

  const CHART_COLORS = {
    Text: "#94a3b8",
    GridLine: "rgba(255, 255, 255, 0.05)",
    Primary: "#6366f1",
    Danger: "#ef4444"
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: CHART_COLORS.Text,
          font: { family: "Outfit", size: 11 }
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { family: "Outfit", weight: "bold" },
        bodyFont: { family: "Outfit" },
        callbacks: {
          label: function (context) {
            return ` ${context.dataset.label}: ₹${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: CHART_COLORS.GridLine },
        ticks: { color: CHART_COLORS.Text, font: { family: "Outfit" } }
      },
      y: {
        grid: { color: CHART_COLORS.GridLine },
        ticks: { color: CHART_COLORS.Text, font: { family: "Outfit" } }
      }
    }
  };

  // Line/Area Chart Data for Monthly Trends
  const lineData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Monthly Expenditure",
        data: monthlyData,
        borderColor: CHART_COLORS.Primary,
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.Primary,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Bar Chart Data for Daily Trends
  const barData = {
    labels: dailyLabels,
    datasets: [
      {
        label: "Daily Expenditure",
        data: dailyData,
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        hoverBackgroundColor: CHART_COLORS.Danger,
        borderRadius: 4
      }
    ]
  };

  return (
    <section className="dashboard-card card-savings-tracker" id="section-spending-trends">
      <div className="card-header-wrapper">
        <span className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Spending Analytics
        </span>

        <div className="chart-header-actions">
          <button
            className={`chart-tab ${trendType === "monthly" ? "active" : ""}`}
            onClick={() => setTrendType("monthly")}
          >
            Monthly Trend
          </button>
          <button
            className={`chart-tab ${trendType === "daily" ? "active" : ""}`}
            onClick={() => setTrendType("daily")}
          >
            Daily Trend
          </button>
        </div>
      </div>

      <div className="chart-container-wrapper" style={{ minHeight: "260px" }}>
        {trendType === "monthly" ? (
          <Line data={lineData} options={options} />
        ) : (
          <Bar data={barData} options={options} />
        )}
      </div>
    </section>
  );
};

export default SpendingTrends;
