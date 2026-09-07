import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Printer, Phone, Mail, MapPin,
  AlertTriangle, Heart, Activity, Calendar, FileText, TestTube, Pill, User
} from 'lucide-react';
import api from '../services/api';
import { formatDate, formatAge } from '../utils/formatters';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Modal from '../components/ui/Modal';
import PatientForm from '../components/patients/PatientForm';
import MedicalRecordForm from '../components/medical/MedicalRecordForm';
import MedicalTimeline from '../components/medical/MedicalTimeline';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/patients/${id}`);
      if (data.success) {
        setPatient(data.data.patient);
        setRecords(data.data.medicalRecords || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load patient.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => window.print();

  if (loading) return <LoadingSpinner text="Loading patient..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!patient) return null;

  const latestRecord = records[0];
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Medical Timeline' },
    { id: 'medications', label: 'Medications' },
    { id: 'tests', label: 'Lab Results' },
    { id: 'notes', label: 'Doctor Notes' },
  ];

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Patients
      </button>

      {/* Patient Header Card */}
      <div className="card p-6 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-blue-700">
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
                <StatusBadge status={patient.status} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{patient.patientId}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <User size={14} className="text-gray-400" />
                  {formatAge(patient.dateOfBirth)} yrs · {patient.gender}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Heart size={14} className="text-red-400" />
                  {patient.bloodGroup}
                </span>
                {patient.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Mail size={14} className="text-gray-400" />
                    {patient.email}
                  </span>
                )}
                {patient.lastVisit && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    Last visit: {formatDate(patient.lastVisit)}
                  </span>
                )}
              </div>

              {/* Allergies */}
              {patient.allergies?.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <AlertTriangle size={14} className="text-orange-500" />
                  <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Allergies:</span>
                  {patient.allergies.map((a) => (
                    <span key={a} className="badge bg-orange-100 text-orange-700">{a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 no-print">
            <button onClick={() => setShowAddRecord(true)} className="btn-primary">
              <Plus size={16} /> Add Record
            </button>
            <button onClick={() => setShowEditModal(true)} className="btn-secondary">
              <Pencil size={16} /> Edit Patient
            </button>
            <button onClick={handlePrint} className="btn-secondary">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Quick infection status from latest record */}
        {latestRecord && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Current Diagnosis</p>
              <p className="text-sm font-medium text-gray-900">{latestRecord.diagnosis || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Disease Status</p>
              <StatusBadge status={latestRecord.diseaseStatus} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Infection</p>
              <StatusBadge status={latestRecord.infectionStatus} />
            </div>
            {latestRecord.infectionType && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Type</p>
                <p className="text-sm text-gray-700">{latestRecord.infectionType}</p>
              </div>
            )}
            {latestRecord.hospitalName && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Diagnosed At</p>
                <p className="text-sm font-medium text-blue-700 flex items-center gap-1">
                  📍 {latestRecord.hospitalName}
                </p>
              </div>
            )}
            {latestRecord.followUpDate && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Follow-up</p>
                <p className="text-sm font-medium text-blue-700">{formatDate(latestRecord.followUpDate)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="no-print">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab patient={patient} latestRecord={latestRecord} />}
        {activeTab === 'timeline' && <MedicalTimeline records={records} onAddRecord={() => setShowAddRecord(true)} onEditRecord={setEditRecord} />}
        {activeTab === 'medications' && <MedicationsTab records={records} />}
        {activeTab === 'tests' && <TestsTab records={records} />}
        {activeTab === 'notes' && <NotesTab records={records} />}
      </div>

      {/* Modals */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Patient" size="xl">
        <PatientForm patient={patient} onSuccess={() => { setShowEditModal(false); fetchData(); }} onCancel={() => setShowEditModal(false)} />
      </Modal>

      <Modal isOpen={showAddRecord || !!editRecord} onClose={() => { setShowAddRecord(false); setEditRecord(null); }} title={editRecord ? 'Edit Medical Record' : 'Add Medical Record'} size="xl">
        <MedicalRecordForm
          patientId={patient._id}
          record={editRecord}
          onSuccess={() => { setShowAddRecord(false); setEditRecord(null); fetchData(); }}
          onCancel={() => { setShowAddRecord(false); setEditRecord(null); }}
        />
      </Modal>
    </div>
  );
}

// ─── Sub-tabs ────────────────────────────────────────────────────────────────

function OverviewTab({ patient, latestRecord }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Info */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={16} className="text-blue-500" /> Personal Information
        </h3>
        <dl className="space-y-3">
          <InfoRow label="Full Name" value={`${patient.firstName} ${patient.lastName}`} />
          <InfoRow label="Date of Birth" value={formatDate(patient.dateOfBirth)} />
          <InfoRow label="Age" value={`${formatAge(patient.dateOfBirth)} years`} />
          <InfoRow label="Gender" value={patient.gender} />
          <InfoRow label="Blood Group" value={patient.bloodGroup} />
          <InfoRow label="Phone" value={patient.phone} />
          <InfoRow label="Email" value={patient.email} />
          {patient.address?.city && (
            <InfoRow
              label="Address"
              value={[patient.address.street, patient.address.city, patient.address.state, patient.address.postalCode].filter(Boolean).join(', ')}
            />
          )}
        </dl>
      </div>

      {/* Medical summary */}
      <div className="space-y-4">
        {/* Allergies */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" /> Allergies
          </h3>
          {patient.allergies?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((a) => (
                <span key={a} className="badge bg-orange-100 text-orange-700">{a}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No known allergies</p>
          )}
        </div>

        {/* Existing Conditions */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity size={16} className="text-purple-500" /> Existing Conditions
          </h3>
          {patient.existingConditions?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.existingConditions.map((c) => (
                <span key={c} className="badge bg-purple-100 text-purple-700">{c}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No existing conditions recorded</p>
          )}
        </div>

        {/* Emergency Contact */}
        {patient.emergencyContact?.name && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Phone size={16} className="text-green-500" /> Emergency Contact
            </h3>
            <dl className="space-y-2">
              <InfoRow label="Name" value={patient.emergencyContact.name} />
              <InfoRow label="Relationship" value={patient.emergencyContact.relationship} />
              <InfoRow label="Phone" value={patient.emergencyContact.phone} />
            </dl>
          </div>
        )}

        {/* Latest symptoms */}
        {latestRecord?.symptoms?.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" /> Latest Symptoms
            </h3>
            <div className="flex flex-wrap gap-2">
              {latestRecord.symptoms.map((s) => (
                <span key={s} className="badge bg-blue-50 text-blue-700">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MedicationsTab({ records }) {
  const allMeds = records.flatMap((r) =>
    (r.medications || []).map((m) => ({ ...m, visitDate: r.visitDate, recordId: r._id }))
  );

  if (allMeds.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Pill size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No medication records found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        ⚠ <strong>DEMO DATA NOTICE:</strong> All medication entries below are fictional demonstration records entered by a doctor. They are NOT real prescriptions or medical recommendations.
      </div>
      {allMeds.map((med, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">{med.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5">From visit on {formatDate(med.visitDate)}</p>
            </div>
            <span className="badge bg-blue-100 text-blue-700">{med.route || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <InfoRow label="Dose" value={med.dose} />
            <InfoRow label="Frequency" value={med.frequency} />
            <InfoRow label="Duration" value={med.duration} />
            <InfoRow label="Start Date" value={formatDate(med.startDate)} />
            <InfoRow label="End Date" value={formatDate(med.endDate)} />
            <InfoRow label="Prescribed By" value={med.prescribedBy} />
          </div>
          {med.notes && (
            <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded p-2 italic">{med.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function TestsTab({ records }) {
  const allTests = records.flatMap((r) =>
    (r.tests || []).map((t) => ({ ...t, visitDate: r.visitDate }))
  );

  if (allTests.length === 0) {
    return (
      <div className="card p-8 text-center">
        <TestTube size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No lab results found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        ⚠ <strong>DEMO DATA NOTICE:</strong> All test results below are completely fictional demonstration data.
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">Test Name</th>
                <th className="table-header">Result</th>
                <th className="table-header">Unit</th>
                <th className="table-header">Reference Range</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allTests.map((test, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{test.testName}</td>
                  <td className="table-cell font-mono text-sm">{test.result || '—'}</td>
                  <td className="table-cell text-gray-500">{test.unit || '—'}</td>
                  <td className="table-cell text-gray-500">{test.referenceRange || '—'}</td>
                  <td className="table-cell"><StatusBadge status={test.status} /></td>
                  <td className="table-cell text-gray-500">{formatDate(test.testDate || test.visitDate)}</td>
                  <td className="table-cell text-gray-500 text-xs max-w-32 truncate">{test.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NotesTab({ records }) {
  const notesRecords = records.filter((r) => r.doctorNotes);
  if (notesRecords.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FileText size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No doctor notes found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notesRecords.map((r) => (
        <div key={r._id} className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{r.disease || r.diagnosis || 'Visit'}</h4>
              <p className="text-xs text-gray-500">{formatDate(r.visitDate)}</p>
              {r.hospitalName && (
                <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                  📍 Diagnosed at <span className="font-medium">{r.hospitalName}</span>
                </p>
              )}
            </div>
            <StatusBadge status={r.diseaseStatus} />
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-4">{r.doctorNotes}</p>
          {r.followUpDate && (
            <div className="mt-3 flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-xs text-gray-600">Follow-up: {formatDate(r.followUpDate)}</span>
              <StatusBadge status={r.followUpStatus} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-xs font-medium text-gray-500 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 text-right">{value || '—'}</dd>
    </div>
  );
}
