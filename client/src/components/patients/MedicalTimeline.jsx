import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Stethoscope, FlaskConical, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatDate } from '../../utils/helpers';

const TimelineEntry = ({ record }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-200 last:hidden" />

      {/* Dot */}
      <div className="absolute left-0 top-1.5 w-6 h-6 bg-primary-100 border-2 border-primary-400 rounded-full flex items-center justify-center">
        <Stethoscope className="w-3 h-3 text-primary-600" />
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-card">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(record.visitDate)}
            </div>
            <h4 className="text-sm font-semibold text-gray-900">{record.diagnosis}</h4>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={record.infectionStatus} />
            {record.disease && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                {record.disease}
              </span>
            )}
          </div>
        </div>

        {/* Chief complaint */}
        {record.chiefComplaint && (
          <p className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Chief complaint:</span> {record.chiefComplaint}
          </p>
        )}

        {/* Symptoms */}
        {record.symptoms?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {record.symptoms.slice(0, 3).map((s) => (
              <span key={s} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">{s}</span>
            ))}
            {record.symptoms.length > 3 && (
              <span className="text-xs text-gray-400">+{record.symptoms.length - 3} more</span>
            )}
          </div>
        )}

        {/* Quick info */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {record.medications?.length > 0 && (
            <span className="flex items-center gap-1">
              💊 {record.medications.length} medication{record.medications.length > 1 ? 's' : ''}
            </span>
          )}
          {record.tests?.length > 0 && (
            <span className="flex items-center gap-1">
              <FlaskConical className="w-3 h-3" /> {record.tests.length} test{record.tests.length > 1 ? 's' : ''}
            </span>
          )}
          {record.followUpDate && (
            <span>Follow-up: {formatDate(record.followUpDate)}</span>
          )}
        </div>

        {/* Expand / view */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Show less' : 'Show details'}
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 space-y-3">
            {record.doctorNotes && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">Doctor Notes</p>
                <p className="text-xs text-amber-700 whitespace-pre-wrap">{record.doctorNotes}</p>
              </div>
            )}

            {record.medications?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                  Medications (Doctor-Entered Clinical Record)
                </p>
                <div className="space-y-1">
                  {record.medications.map((med, i) => (
                    <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-2">
                      <span className="font-medium">{med.name}</span>
                      {med.dose && ` — ${med.dose}`}
                      {med.route && ` | ${med.route}`}
                      {med.frequency && ` | ${med.frequency}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {record.tests?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">Lab Tests</p>
                <div className="space-y-1">
                  {record.tests.map((t, i) => (
                    <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-2 flex justify-between">
                      <span className="font-medium">{t.testName}</span>
                      <span>{t.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MedicalTimeline = ({ records = [] }) => {
  if (!records.length) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No medical records yet.
      </div>
    );
  }

  // Group by year
  const grouped = records.reduce((acc, record) => {
    const year = new Date(record.visitDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(record);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg font-bold text-gray-900">{year}</span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{grouped[year].length} record{grouped[year].length > 1 ? 's' : ''}</span>
          </div>
          <div>
            {grouped[year].map((record) => (
              <TimelineEntry key={record._id} record={record} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MedicalTimeline;
