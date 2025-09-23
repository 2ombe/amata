import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './MilkVolumeChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MilkVolumeChart = ({ data }) => {
  // Default data if none provided
  const chartData = {
    labels: data?.labels || ['Kuwa 1', 'Kuwa 2', 'Kuwa 3', 'Kuwa 4', 'Kuwa 5', 'Kuwa 6', 'Kucyumweru'],
    datasets: [
      {
        label: 'Amata Yakusanyijwe (L)',
        data: data?.values || [1200, 1900, 1500, 2000, 1800, 2100, 1700],
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
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
        text: 'Ingano Ikusanywa Buri Munsi',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Litiro',
        },
      },
    },
  };

  return (
    <div className="milk-volume-chart">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MilkVolumeChart;