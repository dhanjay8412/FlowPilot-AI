import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusDistributionChartProps {
  distribution?: { todo: number; inProgress: number; blocked: number; done: number };
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ distribution }) => {
  const values = distribution
    ? [distribution.todo, distribution.inProgress, distribution.blocked, distribution.done]
    : [4, 6, 2, 8];

  const data = {
    labels: ['Todo', 'In Progress', 'Blocked', 'Done'],
    datasets: [
      {
        data: values,
        backgroundColor: ['#64748B', '#3B82F6', '#F59E0B', '#10B981'],
        borderColor: '#121722',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94A3B8', padding: 16 },
      },
      tooltip: {
        backgroundColor: '#121722',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: '#2A3447',
        borderWidth: 1,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};
