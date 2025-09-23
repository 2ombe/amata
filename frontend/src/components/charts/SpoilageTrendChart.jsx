import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './SpoilageTrendChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SpoilageTrendChart = ({ data }) => {
  // Default data if none provided
  const chartData = {
    labels: data?.labels || ['Icyumweru 1', 'Icyumweru 2', 'Icyumweru 3', 'Icyumweru 4'],
    datasets: [
      {
        label: 'Ijanisha Ryayangiritse (%)',
        data: data?.values || [5.2, 4.8, 3.9, 3.2],
        borderColor: 'rgba(231, 76, 60, 0.8)',
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Amata yangiritse icyi cyumweru',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Ijanisha (%)',
        },
      },
    },
  };

  return (
    <div className="spoilage-trend-chart">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SpoilageTrendChart;