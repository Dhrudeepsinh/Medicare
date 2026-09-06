import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    try {
      const res = await api.post('/auth/reset-password', { token, password: data.password });
      if (res.data.success) {
        toast.success('Password reset successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto p-8 text-center">
        <p className="text-red-600 text-sm">Invalid reset link. Please request a new one.</p>
        <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm mt-3 block">Request New Link</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto p-8">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
        <Lock size={24} className="text-blue-600" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h1>
      <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label">Confirm New Password</label>
          <input
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter new password"
            className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center py-2.5">
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting...</>
          ) : 'Reset Password'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
