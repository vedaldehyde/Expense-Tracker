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

const SavingsTracker = () => {
  const { budgets } = useContext(AppContext);
  const [chartType, setChartType] = useState("line"); // "line" or "bar"

  // Process budget cycle data (sort chronologically)
  const realCycles = budgets
    ? [...budgets]
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .map((b) => ({
          name: b.budget_name ? b.budget_name.charAt(0).toUpperCase() + b.budget_name.slice(1) : "Cycle",
          saved: b.saved_amount || 0,
          spent: b.spent_amount || 0,
          limit: b.budget_amount || 0
        }))
    : [];

  const cycles = realCycles;

  const labels = cycles.map((c) => c.name);
  const savingsData = cycles.map((c) => c.saved);
  const limitsData = cycles.map((c) => c.limit);

  // Cumulative savings for the line chart (growth tracking)
  let cumulative = 0;
  const cumulativeSavingsData = savingsData.map((val) => {
    cumulative += val;
    return cumulative;
  });

  const CHART_COLORS = {
    Text: "#94a3b8",
    GridLine: "rgba(255, 255, 255, 0.05)",
    Primary: "#6366f1",
    Success: "#10b981",
    Orange: "#f59e0b"
  };

  const commonOptions = {
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

  // Line Chart Data (Cumulative Savings growth)
  const lineData = {
    labels,
    datasets: [
      {
        label: "Total Savings Growth",
        data: cumulativeSavingsData,
        borderColor: CHART_COLORS.Success,
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.Success,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Bar Chart Data (Comparison of limit vs saved amount in each cycle)
  const barData = {
    labels,
    datasets: [
      {
        label: "Budget Limit",
        data: limitsData,
        backgroundColor: "rgba(99, 102, 241, 0.35)",
        borderRadius: 6
      },
      {
        label: "Amount Saved",
        data: savingsData,
        backgroundColor: CHART_COLORS.Success,
        borderRadius: 6
      }
    ]
  };

  return (
    <section className="dashboard-card card-savings-tracker" id="section-savings-tracker">
      <div className="card-header-wrapper">
        <span className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Savings Progress
        </span>

        <div className="chart-header-actions">
          <button
            className={`chart-tab ${chartType === "line" ? "active" : ""}`}
            onClick={() => setChartType("line")}
          >
            Line Graph
          </button>
          <button
            className={`chart-tab ${chartType === "bar" ? "active" : ""}`}
            onClick={() => setChartType("bar")}
          >
            Bar Graph
          </button>
        </div>
      </div>

      <div className="chart-container-wrapper" style={{ minHeight: "260px" }}>
        {cycles.length === 0 ? (
          <div className="empty-chart-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No budget or savings cycles recorded yet.</p>
            <span style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.3rem' }}>Create a budget or savings goal to track your savings progress.</span>
          </div>
        ) : chartType === "line" ? (
          <Line data={lineData} options={commonOptions} />
        ) : (
          <Bar data={barData} options={commonOptions} />
        )}
      </div>
    </section>
  );
};

export default SavingsTracker;
