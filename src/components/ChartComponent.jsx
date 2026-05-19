import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export const LineChart = ({ data, options }) => <Line data={data} options={options} />;
export const BarChart = ({ data, options }) => <Bar data={data} options={options} />;
export const DoughnutChart = ({ data, options }) => <Doughnut data={data} options={options} />;

