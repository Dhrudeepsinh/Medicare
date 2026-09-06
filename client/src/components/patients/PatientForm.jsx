import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import api from '../../services/api';
import { BLOOD_GROUPS, GENDERS } from '../../utils/constants';
import { toInputDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  bloodGroup: z.string().optional(),
  'address.street': z.string().optional(),
  'address.city': z.string().optional(),
  'address.state': z.string().optional(),
  'address.postalCode': z.string().optional(),
  allergies: z.array(z.object({ value: z.string() })).optional(),
  existingConditions: z.array(z.object({ value: z.string() })).optional(),
  'emergencyContact.name': z.string().optional(),
  'emergencyContact.relationship': z.string().optional(),
  'emergencyContact.phone': z.string().optional(),
  profileNotes: z.string().optional(),
});

export default function PatientForm({ patient, onSuccess, onCancel }) {
  const isEdit = !!patient;

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: patient ? {
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      dateOfBirth: toInputDate(patient.dateOfBirth),
      gender: patient.gender || '',
      phone: patient.phone || '',
      email: patient.email || '',
      bloodGroup: patient.bloodGroup || '',
      'address.street': patient.address?.street || '',
      'address.city': patient.address?.city || '',
      'address.state': patient.address?.state || '',
      'address.postalCode': patient.address?.postalCode || '',
      allergies: (patient.allergies || []).map((v) => ({ value: v })),
      existingConditions: (patient.existingConditions || []).map((v) => ({ value: v })),
      'emergencyContact.name': patient.emergencyContact?.name || '',
      'emergencyContact.relationship': patient.emergencyContact?.relationship || '',
      'emergencyContact.phone': patient.emergencyContact?.phone || '',
      profileNotes: patient.profileNotes || '',
    } : {
      allergies: [],
      existingConditions: [],
    },
  });

  const allergiesField = useFieldArray({ control, name: 'allergies' });
  const conditionsField = useFieldArray({ control, name: 'existingConditions' });

  const onSubmit = async (raw) => {
    try {
      // Flatten address and emergency contact
      const payload = {
        firstName: raw.firstName,
        lastName: raw.lastName,
        dateOfBirth: raw.dateOfBirth,
        gender: raw.gender,
        phone: raw.phone,
        email: raw.email,
        bloodGroup: raw.bloodGroup,
        address: {
          street: raw['address.street'],
          city: raw['address.city'],
          state: raw['address.state'],
          postalCode: raw['address.postalCode'],
        },
        allergies: (raw.allergies || []).map((a) => a.value).filter(Boolean),
        existingConditions: (raw.existingConditions || []).map((c) => c.value).filter(Boolean),
        emergencyContact: {
          name: raw['emergencyContact.name'],
          relationship: raw['emergencyContact.relationship'],
          phone: raw['emergencyContact.phone'],
        },
        profileNotes: raw.profileNotes,
      };

      if (isEdit) {
        await api.put(`/patients/${patient._id}`, payload);
        toast.success('Patient updated successfully.');
      } else {
        await api.post('/patients', payload);
        toast.success('Patient added successfully.');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save patient.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Info */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">First Name *</label>
            <input {...register('firstName')} placeholder="First name" className={`input-field ${errors.firstName ? 'input-error' : ''}`} />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input {...register('lastName')} placeholder="Last name" className={`input-field ${errors.lastName ? 'input-error' : ''}`} />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <label className="label">Date of Birth *</label>
            <input {...register('dateOfBirth')} type="date" className={`input-field ${errors.dateOfBirth ? 'input-error' : ''}`} />
            {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <label className="label">Gender *</label>
            <select {...register('gender')} className={`input-field ${errors.gender ? 'input-error' : ''}`}>
              <option value="">Select gender</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
            {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender.message}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...register('phone')} type="tel" placeholder="+91-9800000000" className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" placeholder="patient@example.com" className={`input-field ${errors.email ? 'input-error' : ''}`} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Blood Group</label>
            <select {...register('bloodGroup')} className="input-field">
              {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Street</label>
            <input {...register('address.street')} placeholder="Street address" className="input-field" />
          </div>
          <div>
            <label className="label">City</label>
            <input {...register('address.city')} placeholder="City" className="input-field" />
          </div>
          <div>
            <label className="label">State</label>
            <input {...register('address.state')} placeholder="State" className="input-field" />
          </div>
          <div>
            <label className="label">Postal Code</label>
            <input {...register('address.postalCode')} placeholder="PIN code" className="input-field" />
          </div>
        </div>
      </section>

      {/* Medical Info */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Medical Information</h3>
        {/* Allergies */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Allergies</label>
            <button type="button" onClick={() => allergiesField.append({ value: '' })} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          </div>
          <div className="space-y-2">
            {allergiesField.fields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <input {...register(`allergies.${i}.value`)} placeholder="e.g. Penicillin" className="input-field flex-1" />
                <button type="button" onClick={() => allergiesField.remove(i)} className="p-2 text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Conditions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Existing Conditions</label>
            <button type="button" onClick={() => conditionsField.append({ value: '' })} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          </div>
          <div className="space-y-2">
            {conditionsField.fields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <input {...register(`existingConditions.${i}.value`)} placeholder="e.g. Hypertension" className="input-field flex-1" />
                <button type="button" onClick={() => conditionsField.remove(i)} className="p-2 text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Emergency Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Contact Name</label>
            <input {...register('emergencyContact.name')} placeholder="Contact name" className="input-field" />
          </div>
          <div>
            <label className="label">Relationship</label>
            <input {...register('emergencyContact.relationship')} placeholder="e.g. Spouse" className="input-field" />
          </div>
          <div>
            <label className="label">Contact Phone</label>
            <input {...register('emergencyContact.phone')} type="tel" placeholder="+91-9800000000" className="input-field" />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <label className="label">Profile Notes</label>
        <textarea {...register('profileNotes')} rows={3} placeholder="Any additional notes about this patient..." className="input-field resize-none" />
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
          ) : (isEdit ? 'Update Patient' : 'Add Patient')}
        </button>
      </div>
    </form>
  );
}
