import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Pencil, Trash2, Users } from 'lucide-react';
import api from '../services/api';
import { formatDate, formatAge } from '../utils/formatters';
import { GENDERS, BLOOD_GROUPS } from '../utils/constants';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import PatientForm from '../components/patients/PatientForm';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ gender: '', bloodGroup: '', status: 'Active' });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search: debouncedSearch,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      const { data } = await api.get(`/patients?${params}`);
      if (data.success) {
        setPatients(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/patients/${deleteTarget._id}`);
      toast.success('Patient archived.');
      setDeleteTarget(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.message || 'Failed to archive patient.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = () => {
    setShowAddModal(false);
    setEditPatient(null);
    fetchPatients();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500">{pagination.total} total patients</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={16} /> Add Patient
        </button>
      </div>

      {/* Search + Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-secondary gap-2 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="label">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
                className="input-field w-40"
              >
                <option value="">All</option>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}
                className="input-field w-32"
              >
                <option value="">All</option>
                {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="input-field w-36"
              >
                <option value="">All</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ gender: '', bloodGroup: '', status: 'Active' })}
                className="text-xs text-blue-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading patients..." />
        ) : patients.length === 0 ? (
          <EmptyState
            title="No patients found"
            description={search ? 'Try a different search term.' : 'Add your first patient to get started.'}
            icon={Users}
            action={
              !search && (
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                  <Plus size={16} /> Add Patient
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-header">Patient</th>
                    <th className="table-header">Age / Gender</th>
                    <th className="table-header">Blood Group</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">Last Visit</th>
                    <th className="table-header">Last Disease</th>
                    <th className="table-header">Infection</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
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
                      <td className="table-cell text-gray-600 text-sm">
                        {formatAge(patient.dateOfBirth)} · {patient.gender?.[0]}
                      </td>
                      <td className="table-cell">
                        <span className="badge bg-gray-100 text-gray-700">{patient.bloodGroup}</span>
                      </td>
                      <td className="table-cell text-gray-600 text-sm">{patient.phone || '—'}</td>
                      <td className="table-cell text-gray-500 text-sm">
                        {patient.lastVisit ? formatDate(patient.lastVisit) : '—'}
                      </td>
                      <td className="table-cell text-gray-600 text-sm">
                        {patient.lastRecord?.disease || '—'}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={patient.lastRecord?.infectionStatus || 'Unknown'} />
                      </td>
                      <td className="table-cell"><StatusBadge status={patient.status} /></td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/patients/${patient._id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => setEditPatient(patient)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(patient)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Archive"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-4">
              <Pagination
                page={pagination.page || page}
                pages={pagination.pages}
                total={pagination.total}
                limit={10}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Patient"
        size="xl"
      >
        <PatientForm onSuccess={handleSaved} onCancel={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={!!editPatient}
        onClose={() => setEditPatient(null)}
        title="Edit Patient"
        size="xl"
      >
        <PatientForm patient={editPatient} onSuccess={handleSaved} onCancel={() => setEditPatient(null)} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Archive Patient"
        message={`Are you sure you want to archive ${deleteTarget?.firstName} ${deleteTarget?.lastName}? Their records will be preserved.`}
        confirmText="Archive"
      />
    </div>
  );
}
