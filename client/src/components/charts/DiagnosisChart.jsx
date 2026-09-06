import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DiagnosisChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
      <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
      <YAxis type="category" dataKey="diagnosis" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={120} />
      <Tooltip
        formatter={(val) => [val, 'Cases']}
        contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '12px' }}
      />
      <Bar dataKey="count" fill="#0D9488" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export default DiagnosisChart;
