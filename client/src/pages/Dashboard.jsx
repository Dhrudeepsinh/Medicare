import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserPlus, Activity, CalendarCheck, ArrowRight, TrendingUp,
  Pill, TestTube, AlertCircle, Clock
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatAge, formatRelative } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [visitsChart, setVisitsChart] = useState([]);
  const [diagnosisChart, setDiagnosisChart] = useState([]);
  const [infectionChart, setInfectionChart] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, patientsRes, apptRes, visitsRes, diagRes, infRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-patients?limit=5'),
        api.get('/dashboard/upcoming-appointments?limit=5'),
        api.get('/dashboard/visits-chart'),
        api.get('/dashboard/diagnosis-chart'),
        api.get('/dashboard/infection-chart'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (patientsRes.data.success) setRecentPatients(patientsRes.data.data.patients);
      if (apptRes.data.success) setUpcomingAppointments(apptRes.data.data.appointments);
      if (visitsRes.data.success) setVisitsChart(visitsRes.data.data.chartData);
      if (diagRes.data.success) setDiagnosisChart(diagRes.data.data.chartData);
      if (infRes.data.success) setInfectionChart(infRes.data.data.chartData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients ?? 0,
      icon: Users,
      color: 'blue',
      sub: 'Active patients',
    },
    {
      title: 'New This Month',
      value: stats?.newPatientsThisMonth ?? 0,
      icon: UserPlus,
      color: 'teal',
      sub: 'Registered patients',
    },
    {
      title: 'Active Treatments',
      value: stats?.activeRecords ?? 0,
      icon: Activity,
      color: 'purple',
      sub: 'Ongoing cases',
    },
    {
      title: "Today's Follow-ups",
      value: stats?.todayFollowUps ?? 0,
      icon: CalendarCheck,
      color: 'orange',
      sub: 'Pending review',
    },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', text: 'text-teal-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-700' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', text: 'text-orange-700' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name}. Here's your clinical overview.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-xs font-semibold text-yellow-700">⚠ DEMO MODE</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, sub }) => {
          const c = colorMap[color];
          return (
            <div key={title} className={`card p-5 ${c.bg}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                  <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.icon}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits over time */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Patient Visits</h2>
              <p className="text-xs text-gray-500">Last 6 months</p>
            </div>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          {visitsChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={visitsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No visit data available yet
            </div>
          )}
        </div>

        {/* Common diagnoses */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Common Diagnoses</h2>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
            <Pill size={18} className="text-purple-500" />
          </div>
          {diagnosisChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={diagnosisChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No diagnosis data available yet
            </div>
          )}
        </div>
      </div>

      {/* Infection chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Infection Cases</h2>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
            <TestTube size={18} className="text-teal-500" />
          </div>
          {infectionChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={infectionChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {infectionChart.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm text-gray-400">No data</div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8">No upcoming appointments</div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appt) => (
                <div key={appt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {appt.patientId?.firstName} {appt.patientId?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(appt.appointmentDate)} · {appt.appointmentTime}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Patients */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Patients</h2>
          <Link to="/patients" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {recentPatients.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-8">No patients yet. Add your first patient.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header pl-0">Patient</th>
                  <th className="table-header">Age / Gender</th>
                  <th className="table-header">Blood Group</th>
                  <th className="table-header">Registered</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="table-cell pl-0">
                      <Link to={`/patients/${patient._id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-blue-700">
                            {patient.firstName?.[0]}{patient.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{patient.patientId}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="table-cell text-gray-600">
                      {formatAge(patient.dateOfBirth)} · {patient.gender}
                    </td>
                    <td className="table-cell">
                      <span className="badge bg-gray-100 text-gray-700">{patient.bloodGroup}</span>
                    </td>
                    <td className="table-cell text-gray-500 text-xs">{formatRelative(patient.createdAt)}</td>
                    <td className="table-cell"><StatusBadge status={patient.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
