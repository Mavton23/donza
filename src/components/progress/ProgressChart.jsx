import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressChart({ data, type }) {
  let chartData, options;

  if (type === 'course') {
    chartData = {
      labels: data.map(item => item.title),
      datasets: [{
        label: 'Progress (%)',
        data: data.map(item => item.progress),
        backgroundColor: 'rgba(79, 70, 229, 0.7)'
      }]
    };
    options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    };
  } else if (type === 'institution') {
    chartData = {
      labels: data.map(item => item.name),
      datasets: [{
        label: 'Count',
        data: data.map(item => item.value),
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ]
      }]
    };
  }

  return <Bar data={chartData} options={options} />;
}