import { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../services/api';
import { CHART_COLORS, DATE_FILTER_OPTIONS } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Reports() {
  const [diagnosisData, setDiagnosisData] = useState([]);
  const [infectionData, setInfectionData] = useState([]);
  const [visitsData, setVisitsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30d');
  const [stats, setStats] = useState(null);

  const getDays = () => {
    const opt = DATE_FILTER_OPTIONS.find((o) => o.value === dateFilter);
    return opt?.days || 30;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const days = getDays();
      const [diagRes, infRes, visitsRes, statsRes] = await Promise.all([
        api.get(`/dashboard/diagnosis-chart?days=${days}`),
        api.get(`/dashboard/infection-chart?days=${days}`),
        api.get('/dashboard/visits-chart'),
        api.get('/dashboard/stats'),
      ]);

      if (diagRes.data.success) setDiagnosisData(diagRes.data.data.chartData);
      if (infRes.data.success) setInfectionData(infRes.data.data.chartData);
      if (visitsRes.data.success) setVisitsData(visitsRes.data.data.chartData);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (err) {
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Clinical statistics and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Period:</label>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-field w-40">
            {DATE_FILTER_OPTIONS.filter((o) => o.value !== 'custom').map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner text="Loading reports..." /> : (
        <>
          {/* Summary Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Patients', value: stats.totalPatients, color: 'text-blue-700 bg-blue-50' },
                { label: 'New This Month', value: stats.newPatientsThisMonth, color: 'text-teal-700 bg-teal-50' },
                { label: 'Active Treatments', value: stats.activeRecords, color: 'text-purple-700 bg-purple-50' },
                { label: "Today's Follow-ups", value: stats.todayFollowUps, color: 'text-orange-700 bg-orange-50' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`card p-5 ${color}`}>
                  <p className="text-xs font-medium uppercase tracking-wide mb-1 opacity-70">{label}</p>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diagnosis bar chart */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Common Diagnoses</h2>
              <p className="text-xs text-gray-500 mb-4">Top diagnoses in selected period</p>
              {diagnosisData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={diagnosisData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {diagnosisData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data in period</div>}
            </div>

            {/* Infection pie chart */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Infection Cases</h2>
              <p className="text-xs text-gray-500 mb-4">Distribution by infection status</p>
              {infectionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={infectionData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {infectionData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data in period</div>}
            </div>

            {/* Visits line chart */}
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Patient Visits Over Time</h2>
                  <p className="text-xs text-gray-500">Last 6 months trend</p>
                </div>
                <TrendingUp size={18} className="text-blue-500" />
              </div>
              {visitsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={visitsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 5, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-48 flex items-center justify-center text-sm text-gray-400">No visit data</div>}
            </div>
          </div>

          <div className="card p-4 text-xs text-gray-500 text-center">
            ⚠ All data shown is based on demo records. This system is for demonstration purposes only.
          </div>
        </>
      )}
    </div>
  );
}
