export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        boxWidth: 12,
        color: '#475569',
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif',
        },
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#ffffff',
      bodyColor: '#e2e8f0',
      padding: 10,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#e2e8f0',
      },
      ticks: {
        color: '#64748b',
      },
    },
  },
};
