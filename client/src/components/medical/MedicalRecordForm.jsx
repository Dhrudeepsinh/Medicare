import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import api from '../../services/api';
import {
  INFECTION_STATUSES, DISEASE_STATUSES, RECORD_TYPES, MEDICATION_ROUTES, TEST_STATUSES,
} from '../../utils/constants';
import { toInputDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function MedicalRecordForm({ patientId, record, onSuccess, onCancel }) {
  const isEdit = !!record;

  const defaultMed = { name: '', dose: '', route: 'Oral', frequency: '', duration: '', startDate: '', endDate: '', notes: '' };
  const defaultTest = { testName: '', result: '', unit: '', referenceRange: '', testDate: '', status: 'Pending', notes: '' };

  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm({
    defaultValues: record ? {
      visitDate: toInputDate(record.visitDate),
      chiefComplaint: record.chiefComplaint || '',
      symptoms: record.symptoms?.join(', ') || '',
      diagnosis: record.diagnosis || '',
      disease: record.disease || '',
      hospitalName: record.hospitalName || '',
      diseaseStatus: record.diseaseStatus || 'Active',
      infectionStatus: record.infectionStatus || 'Unknown',
      infectionType: record.infectionType || '',
      doctorNotes: record.doctorNotes || '',
      followUpDate: toInputDate(record.followUpDate),
      followUpNotes: record.followUpNotes || '',
      followUpStatus: record.followUpStatus || 'Pending',
      recordType: record.recordType || 'Visit',
      medications: record.medications?.length ? record.medications.map((m) => ({
        ...m, startDate: toInputDate(m.startDate), endDate: toInputDate(m.endDate),
      })) : [defaultMed],
      tests: record.tests?.length ? record.tests.map((t) => ({
        ...t, testDate: toInputDate(t.testDate),
      })) : [],
    } : {
      visitDate: toInputDate(new Date()),
      diseaseStatus: 'Active',
      infectionStatus: 'Unknown',
      recordType: 'Visit',
      followUpStatus: 'Pending',
      medications: [defaultMed],
      tests: [],
    },
  });

  const medsField = useFieldArray({ control, name: 'medications' });
  const testsField = useFieldArray({ control, name: 'tests' });

  const onSubmit = async (raw) => {
    try {
      const payload = {
        patientId,
        visitDate: raw.visitDate,
        chiefComplaint: raw.chiefComplaint,
        symptoms: raw.symptoms ? raw.symptoms.split(',').map((s) => s.trim()).filter(Boolean) : [],
        diagnosis: raw.diagnosis,
        disease: raw.disease,
        hospitalName: raw.hospitalName || undefined,
        diseaseStatus: raw.diseaseStatus,
        infectionStatus: raw.infectionStatus,
        infectionType: raw.infectionType,
        doctorNotes: raw.doctorNotes,
        followUpDate: raw.followUpDate || undefined,
        followUpNotes: raw.followUpNotes,
        followUpStatus: raw.followUpStatus,
        recordType: raw.recordType,
        medications: (raw.medications || []).filter((m) => m.name),
        tests: (raw.tests || []).filter((t) => t.testName),
      };

      if (isEdit) {
        await api.put(`/medical-records/${record._id}`, payload);
        toast.success('Medical record updated.');
      } else {
        await api.post('/medical-records', payload);
        toast.success('Medical record added.');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save record.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800">
        ⚠ This form is for doctor-entered clinical records only. It does not constitute medical advice or prescriptions.
      </div>

      {/* Basic Info */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Visit Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Visit Date *</label>
            <input {...register('visitDate', { required: true })} type="date" className="input-field" />
          </div>
          <div>
            <label className="label">Record Type</label>
            <select {...register('recordType')} className="input-field">
              {RECORD_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Chief Complaint</label>
            <input {...register('chiefComplaint')} placeholder="Patient's primary complaint..." className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Symptoms (comma-separated)</label>
            <input {...register('symptoms')} placeholder="e.g. Fever, Headache, Cough" className="input-field" />
          </div>
          <div>
            <label className="label">Diagnosis</label>
            <input {...register('diagnosis')} placeholder="Doctor's clinical diagnosis" className="input-field" />
          </div>
          <div>
            <label className="label">Disease</label>
            <input {...register('disease')} placeholder="Disease name" className="input-field" />
          </div>
          <div>
            <label className="label">Disease Status</label>
            <select {...register('diseaseStatus')} className="input-field">
              {DISEASE_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">
              Diagnosed / Detected At (Hospital / Clinic Name)
            </label>
            <input
              {...register('hospitalName')}
              placeholder="e.g. City Medical Center, Apollo Hospital..."
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">
              Name of the hospital or clinic where this disease was diagnosed or detected.
            </p>
          </div>
        </div>
      </section>

      {/* Infection Info */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Infection Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Infection Detected</label>
            <select {...register('infectionStatus')} className="input-field">
              {INFECTION_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Infection Type (if applicable)</label>
            <input {...register('infectionType')} placeholder="e.g. Bacterial, Viral" className="input-field" />
          </div>
        </div>
      </section>

      {/* Medications */}
      <section>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Medications (Doctor-Entered Records)</h3>
          <button type="button" onClick={() => medsField.append(defaultMed)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <Plus size={12} /> Add Medication
          </button>
        </div>
        {medsField.fields.map((field, i) => (
          <div key={field.id} className="p-4 bg-blue-50 rounded-lg mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-blue-700">Medication #{i + 1}</span>
              <button type="button" onClick={() => medsField.remove(i)} className="p-1 text-red-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Medication Name</label>
                <input {...register(`medications.${i}.name`)} placeholder="Medication name" className="input-field" />
              </div>
              <div>
                <label className="label">Dose</label>
                <input {...register(`medications.${i}.dose`)} placeholder="e.g. 50 mg" className="input-field" />
              </div>
              <div>
                <label className="label">Route</label>
                <select {...register(`medications.${i}.route`)} className="input-field">
                  {MEDICATION_ROUTES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Frequency</label>
                <input {...register(`medications.${i}.frequency`)} placeholder="e.g. Every 6 hours" className="input-field" />
              </div>
              <div>
                <label className="label">Duration</label>
                <input {...register(`medications.${i}.duration`)} placeholder="e.g. 7 days" className="input-field" />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input {...register(`medications.${i}.startDate`)} type="date" className="input-field" />
              </div>
              <div>
                <label className="label">End Date</label>
                <input {...register(`medications.${i}.endDate`)} type="date" className="input-field" />
              </div>
              <div>
                <label className="label">Notes</label>
                <input {...register(`medications.${i}.notes`)} placeholder="Additional notes" className="input-field" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Tests */}
      <section>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Lab / Investigation Results</h3>
          <button type="button" onClick={() => testsField.append(defaultTest)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <Plus size={12} /> Add Test
          </button>
        </div>
        {testsField.fields.map((field, i) => (
          <div key={field.id} className="p-4 bg-teal-50 rounded-lg mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-teal-700">Test #{i + 1}</span>
              <button type="button" onClick={() => testsField.remove(i)} className="p-1 text-red-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Test Name</label>
                <input {...register(`tests.${i}.testName`)} placeholder="Test name" className="input-field" />
              </div>
              <div>
                <label className="label">Result</label>
                <input {...register(`tests.${i}.result`)} placeholder="Result value" className="input-field" />
              </div>
              <div>
                <label className="label">Unit</label>
                <input {...register(`tests.${i}.unit`)} placeholder="e.g. mg/dL" className="input-field" />
              </div>
              <div>
                <label className="label">Reference Range</label>
                <input {...register(`tests.${i}.referenceRange`)} placeholder="e.g. 70-100 mg/dL" className="input-field" />
              </div>
              <div>
                <label className="label">Test Date</label>
                <input {...register(`tests.${i}.testDate`)} type="date" className="input-field" />
              </div>
              <div>
                <label className="label">Status</label>
                <select {...register(`tests.${i}.status`)} className="input-field">
                  {TEST_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Notes</label>
                <input {...register(`tests.${i}.notes`)} placeholder="Notes" className="input-field" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Doctor Notes */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Doctor Notes & Follow-up</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Doctor Notes</label>
            <textarea {...register('doctorNotes')} rows={4} placeholder="Clinical observations and instructions..." className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Follow-up Date</label>
              <input {...register('followUpDate')} type="date" className="input-field" />
            </div>
            <div>
              <label className="label">Follow-up Status</label>
              <select {...register('followUpStatus')} className="input-field">
                <option>Pending</option>
                <option>Completed</option>
                <option>Missed</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div>
              <label className="label">Follow-up Notes</label>
              <input {...register('followUpNotes')} placeholder="Reason for follow-up" className="input-field" />
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
          ) : (isEdit ? 'Update Record' : 'Add Record')}
        </button>
      </div>
    </form>
  );
}
