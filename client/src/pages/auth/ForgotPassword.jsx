import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/forgot-password', data);
      if (res.data.success) {
        setSent(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto p-8">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
        <Mail size={24} className="text-blue-600" />
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your registered email and we'll send you a reset link.
      </p>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          ✅ If that email is registered, a reset link has been sent. Please check your inbox.
          <div className="mt-3">
            <Link to="/login" className="text-blue-600 hover:underline">Return to Login</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="doctor@example.com"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center py-2.5">
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
            ) : 'Send Reset Link'}
          </button>
        </form>
      )}
    </div>
  );
}
