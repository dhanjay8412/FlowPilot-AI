import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CompletionTrendChartProps {
  data: Array<{ date: string; created: number; completed: number }>;
}

export const CompletionTrendChart: React.FC<CompletionTrendChartProps> = ({ data }) => {
  const labels = data.length > 0 ? data.map((d) => d.date) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completedValues = data.length > 0 ? data.map((d) => d.completed) : [3, 5, 2, 8, 6, 4, 7];
  const createdValues = data.length > 0 ? data.map((d) => d.created) : [4, 6, 3, 7, 5, 2, 4];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Completed Tasks',
        data: completedValues,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Created Tasks',
        data: createdValues,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94A3B8' },
      },
      tooltip: {
        backgroundColor: '#121722',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: '#2A3447',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748B' },
        grid: { color: '#1E293B' },
      },
      y: {
        ticks: { color: '#64748B', precision: 0 },
        grid: { color: '#1E293B' },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};
