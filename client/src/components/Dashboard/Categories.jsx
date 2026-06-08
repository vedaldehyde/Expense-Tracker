import React, { useContext, useState } from "react";
import AppContext from "../../context/AppContext";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

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

const Categories = () => {
  const [activeChart, setActiveChart] = useState("categories");
  const {expenseCategories} = useContext(AppContext)
  console.log(expenseCategories);
  
  // const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

  // Pie Chart Data
  const pieData = {
    labels: expenseCategories.map(category => category.category_type),
    datasets: [
      {
        data: [400, 300, 250, 200],
        backgroundColor: [
          "#6366f1",
          "#10b981",
          "#f59e0b",
          "#ef4444",
        ],
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

  // Bar Graph Data
  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Expenses",
        data: [4000, 3200, 5000, 2800, 4500, 4000],
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
                        position: 'right',
                        labels: {
                            color: CHART_COLORS.Text,
                            font: { family: 'Outfit', size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ₹${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }

  return (
    <section
      className="dashboard-card card-chart"
      id="section-charts-card"
    >
      <div className="card-header-wrapper">
        <span className="card-title">
          <svg viewBox="0 0 24 24">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />
          </svg>

          Spending Analytics
        </span>

        <div className="chart-header-actions">
          <button
            className={`chart-tab ${
              activeChart === "categories" ? "active" : ""
            }`}
            onClick={() => setActiveChart("categories")}
          >
            Categories
          </button>

          <button
            className={`chart-tab ${
              activeChart === "monthly" ? "active" : ""
            }`}
            onClick={() => setActiveChart("monthly")}
          >
            Monthly Trends
          </button>
        </div>
      </div>

      <div className="chart-container-wrapper">
        {activeChart === "categories" ? (
          <Pie data={pieData} options={options} />
        ) : (
          <Bar data={barData} options={options} />
        )}
      </div>
    </section>
  );
};

export default Categories;