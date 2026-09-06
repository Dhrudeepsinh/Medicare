import { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Filter, Search } from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../utils/formatters';
import { APPOINTMENT_STATUSES } from '../utils/constants';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import AppointmentForm from '../components/appointments/AppointmentForm';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
      const { data } = await api.get(`/appointments?${params}`);
      if (data.success) {
        setAppointments(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { setPage(1); }, [filters]);
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Marked as ${status}.`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/appointments/${deleteTarget._id}`);
      toast.success('Appointment deleted.');
      setDeleteTarget(null);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500">{pagination.total} total appointments</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={16} /> New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="label">Status</label>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="input-field w-40">
              <option value="">All</option>
              {APPOINTMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">From Date</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} className="input-field w-40" />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} className="input-field w-40" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({ status: '', dateFrom: '', dateTo: '' })} className="text-xs text-blue-600 hover:underline">Reset</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading appointments..." />
        ) : appointments.length === 0 ? (
          <EmptyState title="No appointments found" icon={Calendar} action={
            <button onClick={() => setShowAddModal(true)} className="btn-primary"><Plus size={16} /> New Appointment</button>
          } />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-header">Patient</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Time</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Reason</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appt.patientId?.firstName} {appt.patientId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{appt.patientId?.patientId}</p>
                        </div>
                      </td>
                      <td className="table-cell text-sm text-gray-700">{formatDate(appt.appointmentDate)}</td>
                      <td className="table-cell text-sm text-gray-700">{appt.appointmentTime}</td>
                      <td className="table-cell"><span className="badge bg-gray-100 text-gray-600">{appt.type}</span></td>
                      <td className="table-cell text-sm text-gray-600 max-w-48 truncate">{appt.reason || '—'}</td>
                      <td className="table-cell"><StatusBadge status={appt.status} /></td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-2">
                          {appt.status === 'Scheduled' && (
                            <>
                              <button onClick={() => handleStatusUpdate(appt._id, 'Completed')} className="text-xs text-green-600 hover:underline">Complete</button>
                              <button onClick={() => handleStatusUpdate(appt._id, 'Cancelled')} className="text-xs text-red-600 hover:underline">Cancel</button>
                            </>
                          )}
                          <button onClick={() => setEditAppt(appt)} className="text-xs text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => setDeleteTarget(appt)} className="text-xs text-red-500 hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-4">
              <Pagination page={pagination.page || page} pages={pagination.pages} total={pagination.total} limit={10} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Appointment" size="lg">
        <AppointmentForm onSuccess={() => { setShowAddModal(false); fetchAppointments(); }} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal isOpen={!!editAppt} onClose={() => setEditAppt(null)} title="Edit Appointment" size="lg">
        <AppointmentForm appointment={editAppt} onSuccess={() => { setEditAppt(null); fetchAppointments(); }} onCancel={() => setEditAppt(null)} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Appointment" message="Are you sure you want to delete this appointment?" confirmText="Delete" />
    </div>
  );
}
