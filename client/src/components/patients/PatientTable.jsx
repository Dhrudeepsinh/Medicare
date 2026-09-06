import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import { formatDate, calculateAge } from '../../utils/helpers';
import { Users } from 'lucide-react';

const PatientTable = ({ patients = [], isLoading, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await onDelete(deleteTarget._id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {['Patient ID', 'Name', 'Age', 'Gender', 'Blood Group', 'Phone', 'Status', 'Actions'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {[...Array(8)].map((_, j) => (
                  <td key={j}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!patients.length) {
    return <EmptyState icon={Users} title="No patients found" description="Add your first patient or adjust your search filters." />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood Group</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient._id}
                className="cursor-pointer"
                onClick={() => navigate(`/patients/${patient._id}`)}
              >
                <td>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    {patient.patientId}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 text-xs font-semibold">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                      <p className="text-xs text-gray-400">{patient.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-gray-600">
                  {patient.age ?? calculateAge(patient.dateOfBirth)} yrs
                </td>
                <td className="text-gray-600">{patient.gender}</td>
                <td>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700">
                    {patient.bloodGroup || 'Unknown'}
                  </span>
                </td>
                <td className="text-gray-600 text-sm">{patient.phone}</td>
                <td><StatusBadge status={patient.status} /></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/patients/${patient._id}`)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(patient)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(patient)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Archive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleting}
        title="Archive Patient"
        message={`Are you sure you want to archive ${deleteTarget?.firstName} ${deleteTarget?.lastName}? The patient record will be hidden but not permanently deleted.`}
        confirmText="Archive"
        confirmVariant="danger"
      />
    </>
  );
};

export default PatientTable;
