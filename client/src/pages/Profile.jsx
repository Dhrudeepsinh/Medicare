import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCircle, Pencil, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SPECIALIZATIONS } from '../utils/constants';
import { getInitials } from '../utils/formatters';
import api from '../services/api';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  specialization: z.string().min(1, 'Specialization is required'),
  clinicName: z.string().optional(),
});

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      specialization: user?.specialization || '',
      clinicName: user?.clinicName || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.put('/doctors/profile', data);
      if (res.data.success) {
        updateUser(res.data.data.doctor);
        toast.success('Profile updated.');
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your doctor profile information</p>
      </div>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{getInitials(user?.name)}</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.specialization}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input {...register('name')} className={`input-field ${errors.name ? 'input-error' : ''}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...register('phone')} type="tel" className="input-field" />
              </div>
              <div>
                <label className="label">Specialization</label>
                <select {...register('specialization')} className="input-field">
                  {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Hospital / Clinic</label>
                <input {...register('clinicName')} className="input-field" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Full Name" value={user?.name} />
              <InfoField label="Email" value={user?.email} />
              <InfoField label="Phone" value={user?.phone} />
              <InfoField label="Specialization" value={user?.specialization} />
              <InfoField label="Clinic / Hospital" value={user?.clinicName} />
              <InfoField label="License Number" value={user?.licenseNumber} />
            </div>
            <div className="pt-4">
              <button onClick={() => setEditing(true)} className="btn-primary">
                <Pencil size={16} /> Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value || '—'}</p>
    </div>
  );
}
