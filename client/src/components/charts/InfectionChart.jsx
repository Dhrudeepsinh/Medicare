import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = { Yes: '#DC2626', No: '#16A34A', Unknown: '#94a3b8' };

const InfectionChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip formatter={(val, name) => [val, `${name}: ${total ? Math.round((val / total) * 100) : 0}%`]} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default InfectionChart;
