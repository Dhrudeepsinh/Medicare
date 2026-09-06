import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('security');
  const [notifPrefs, setNotifPrefs] = useState(user?.notificationPreferences || {
    appointmentReminders: true,
    followUpReminders: true,
    systemNotifications: true,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handlePasswordChange = async (data) => {
    try {
      await api.put('/doctors/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully.');
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    try {
      await api.put('/doctors/profile', { notificationPreferences: notifPrefs });
      updateUser({ notificationPreferences: notifPrefs });
      toast.success('Notification preferences saved.');
    } catch (err) {
      toast.error('Failed to save preferences.');
    } finally {
      setSavingNotifs(false);
    }
  };

  const sections = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage account security and preferences</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar */}
        <div className="sm:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`sidebar-link w-full ${activeSection === id ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-xl">
          {activeSection === 'security' && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Lock size={18} className="text-blue-600" /> Change Password
              </h2>
              <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input {...register('currentPassword')} type="password" placeholder="Enter current password" className={`input-field ${errors.currentPassword ? 'input-error' : ''}`} />
                  {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input {...register('newPassword')} type="password" placeholder="Min. 6 characters" className={`input-field ${errors.newPassword ? 'input-error' : ''}`} />
                  {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input {...register('confirmPassword')} type="password" placeholder="Re-enter new password" className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`} />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Bell size={18} className="text-blue-600" /> Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Get notified about upcoming appointments' },
                  { key: 'followUpReminders', label: 'Follow-up Reminders', desc: "Reminders for patients' follow-up dates" },
                  { key: 'systemNotifications', label: 'System Notifications', desc: 'Portal updates and system messages' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={notifPrefs[key] ?? true}
                        onChange={(e) => setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}

                <button onClick={handleSaveNotifications} disabled={savingNotifs} className="btn-primary mt-2">
                  {savingNotifs ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
