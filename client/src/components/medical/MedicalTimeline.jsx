import { Plus, Pencil, FileText, TestTube, Calendar, Activity } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import StatusBadge from '../ui/StatusBadge';

const getRecordIcon = (type) => {
  const icons = {
    Visit: Activity,
    'Lab Test': TestTube,
    'Follow-up': Calendar,
    Emergency: Activity,
    Consultation: FileText,
  };
  return icons[type] || FileText;
};

const getRecordColor = (type) => {
  const colors = {
    Visit: 'bg-blue-100 text-blue-600',
    'Lab Test': 'bg-teal-100 text-teal-600',
    'Follow-up': 'bg-purple-100 text-purple-600',
    Emergency: 'bg-red-100 text-red-600',
    Consultation: 'bg-orange-100 text-orange-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
};

export default function MedicalTimeline({ records, onAddRecord, onEditRecord }) {
  if (records.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileText size={24} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">No medical records yet</p>
        <p className="text-xs text-gray-400 mb-4">Add the first medical record for this patient.</p>
        <button onClick={onAddRecord} className="btn-primary">
          <Plus size={16} /> Add Medical Record
        </button>
      </div>
    );
  }

  // Group by year
  const grouped = {};
  records.forEach((r) => {
    const year = new Date(r.visitDate).getFullYear();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(r);
  });

  const years = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      <div className="flex justify-end no-print">
        <button onClick={onAddRecord} className="btn-primary">
          <Plus size={16} /> Add Record
        </button>
      </div>

      {years.map((year) => (
        <div key={year}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg font-bold text-gray-900">{year}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-100" />

            <div className="space-y-4">
              {grouped[year].map((record) => {
                const Icon = getRecordIcon(record.recordType);
                const iconColor = getRecordColor(record.recordType);

                return (
                  <div key={record._id} className="flex gap-4 group">
                    {/* Timeline dot */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${iconColor}`}>
                      <Icon size={18} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 card p-4 card-hover mb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{record.recordType}</span>
                            <span className="text-xs text-gray-400">{formatDate(record.visitDate)}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mt-1">
                            {record.disease || record.diagnosis || record.chiefComplaint || 'Visit'}
                          </h4>
                          {record.diagnosis && record.disease && record.disease !== record.diagnosis && (
                            <p className="text-sm text-gray-600 mt-0.5">{record.diagnosis}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                          <StatusBadge status={record.diseaseStatus} />
                          <StatusBadge status={record.infectionStatus} />
                          <button
                            onClick={() => onEditRecord(record)}
                            className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity no-print"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Symptoms */}
                      {record.symptoms?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {record.symptoms.map((s) => (
                            <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>
                          ))}
                        </div>
                      )}

                      {/* Medications count */}
                      {record.medications?.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Activity size={12} /> {record.medications.length} medication(s)
                          </span>
                          {record.tests?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <TestTube size={12} /> {record.tests.length} test(s)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Doctor notes preview */}
                      {record.doctorNotes && (
                        <p className="mt-3 text-xs text-gray-500 italic bg-gray-50 rounded p-2 line-clamp-2">
                          📝 {record.doctorNotes}
                        </p>
                      )}

                      {/* Follow-up */}
                      {record.followUpDate && (
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <Calendar size={12} className="text-blue-500" />
                          <span className="text-gray-600">Follow-up: {formatDate(record.followUpDate)}</span>
                          <StatusBadge status={record.followUpStatus} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
