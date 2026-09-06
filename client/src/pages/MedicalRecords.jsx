import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatDate } from '../utils/formatters';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function MedicalRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/patients?limit=50&status=Active');
        if (data.success) setPatients(data.data);
      } catch {
        toast.error('Failed to load patients.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage medical records by patient</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading..." />
      ) : patients.length === 0 ? (
        <EmptyState title="No patients found" description="Add patients to start managing medical records." icon={FileText} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Link
              key={patient._id}
              to={`/patients/${patient._id}?tab=timeline`}
              className="card p-5 card-hover hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-700">
                    {patient.firstName?.[0]}{patient.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{patient.patientId}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={patient.status} />
                    {patient.lastVisit && (
                      <span className="text-xs text-gray-400">
                        Last: {formatDate(patient.lastVisit)}
                      </span>
                    )}
                  </div>
                </div>
                <Eye size={16} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
