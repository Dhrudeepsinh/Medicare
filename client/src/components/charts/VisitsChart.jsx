import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-primary-600">{payload[0].value} visits</p>
      </div>
    );
  }
  return null;
};

const VisitsChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey="visits" stroke="#2563EB" strokeWidth={2} fill="url(#visitsGrad)" dot={false} activeDot={{ r: 4 }} />
    </AreaChart>
  </ResponsiveContainer>
);

export default VisitsChart;
