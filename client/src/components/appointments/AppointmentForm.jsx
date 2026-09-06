import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from '../../utils/constants';
import { toInputDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AppointmentForm({ appointment, onSuccess, onCancel }) {
  const isEdit = !!appointment;
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get('/patients?limit=100&status=Active').then(({ data }) => {
      if (data.success) setPatients(data.data);
    }).catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({
    defaultValues: appointment ? {
      patientId: appointment.patientId?._id || appointment.patientId,
      appointmentDate: toInputDate(appointment.appointmentDate),
      appointmentTime: appointment.appointmentTime || '',
      type: appointment.type || 'Regular',
      reason: appointment.reason || '',
      status: appointment.status || 'Scheduled',
      duration: appointment.duration || 30,
      notes: appointment.notes || '',
    } : {
      appointmentDate: toInputDate(new Date()),
      type: 'Regular',
      status: 'Scheduled',
      duration: 30,
    },
  });

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await api.put(`/appointments/${appointment._id}`, data);
        toast.success('Appointment updated.');
      } else {
        await api.post('/appointments', data);
        toast.success('Appointment created.');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save appointment.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Patient *</label>
        <select {...register('patientId', { required: true })} className={`input-field ${errors.patientId ? 'input-error' : ''}`}>
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>
          ))}
        </select>
        {errors.patientId && <p className="text-xs text-red-500 mt-1">Patient is required</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date *</label>
          <input {...register('appointmentDate', { required: true })} type="date" className="input-field" />
        </div>
        <div>
          <label className="label">Time *</label>
          <input {...register('appointmentTime', { required: true })} type="text" placeholder="e.g. 10:30 AM" className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <select {...register('type')} className="input-field">
            {APPOINTMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Duration (min)</label>
          <input {...register('duration')} type="number" min="10" max="180" className="input-field" />
        </div>
      </div>

      {isEdit && (
        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input-field">
            {APPOINTMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="label">Reason</label>
        <input {...register('reason')} placeholder="Reason for appointment" className="input-field" />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea {...register('notes')} rows={3} placeholder="Additional notes..." className="input-field resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
          ) : (isEdit ? 'Update' : 'Create Appointment')}
        </button>
      </div>
    </form>
  );
}
