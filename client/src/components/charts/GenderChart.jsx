import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563EB', '#0D9488', '#D97706', '#DC2626'];

const GenderChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie data={data} cx="50%" cy="45%" outerRadius={80} paddingAngle={3} dataKey="value">
        {data.map((entry, i) => (
          <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
      <Legend
        iconType="circle"
        iconSize={8}
        formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
      />
    </PieChart>
  </ResponsiveContainer>
);

export default GenderChart;
