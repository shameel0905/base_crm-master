
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const salesData = [
  { name: 'Jan', value: 60 },
  { name: 'Feb', value: 80 },
  { name: 'Mar', value: 55 },
  { name: 'Apr', value: 78 },
  { name: 'May', value: 58 },
  { name: 'Jun', value: 82 },
  { name: 'Jul', value: 75 },
  { name: 'Aug', value: 60 },
  { name: 'Sep', value: 85 },
];
const revenueData = [
  { name: 'Jan', value: 120 },
  { name: 'Feb', value: 140 },
  { name: 'Mar', value: 110 },
  { name: 'Apr', value: 150 },
  { name: 'May', value: 130 },
  { name: 'Jun', value: 160 },
  { name: 'Jul', value: 155 },
  { name: 'Aug', value: 140 },
  { name: 'Sep', value: 170 },
];
const ordersData = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 40 },
  { name: 'Mar', value: 35 },
  { name: 'Apr', value: 38 },
  { name: 'May', value: 32 },
  { name: 'Jun', value: 45 },
  { name: 'Jul', value: 41 },
  { name: 'Aug', value: 39 },
  { name: 'Sep', value: 50 },
];


export const SalesChart = ({ chartType = 'sales' }) => {  
  let chartData, chartLabel;
  if (chartType === 'sales') {
    chartData = salesData;
    chartLabel = 'Total Sales';
  } else if (chartType === 'revenue') {
    chartData = revenueData;
    chartLabel = 'Revenue';
  } else {
    chartData = ordersData;
    chartLabel = 'Orders';
  }

  const percentChange = ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100;
  const percentChangeDisplay = percentChange >= 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`;
  const percentChangeColor = percentChange >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';

  const handleExport = () => {
    alert('Exporting chart data... (demo only)');
  };

  return (
    <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            {chartLabel}
            <span className={`ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${percentChangeColor}`}>
              {percentChangeDisplay}
            </span>
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Jan - Sep, 2025</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Export
          </button>
          <div className="relative">
            <select className="appearance-none w-full bg-gray-100 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#005660] pr-6">
              <option>Sort By Date</option>
              <option>Sort By Value</option>
            </select>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <path d="M6 9L10 5L14 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-60 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#005660" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#005660" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickFormatter={(value) => `$${value}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [`$${value}k`, chartLabel]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#005660" 
              strokeWidth={2.5}
              dot={{ fill: '#fff', stroke: '#005660', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#005660', stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
