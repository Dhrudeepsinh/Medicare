import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SPECIALIZATIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  licenseNumber: z.string().min(3, 'License number is required'),
  specialization: z.string().min(1, 'Please select a specialization'),
  clinicName: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Register() {
  const { register: registerDoctor } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      await registerDoctor(payload);
      toast.success('Registration successful! Welcome to MediCare.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Stethoscope size={22} className="text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-white leading-none">MediCare Portal</p>
          <p className="text-xs text-blue-100 leading-none mt-1">Doctor Registration</p>
        </div>
      </div>

      <div className="p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Create Doctor Account</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in your professional details to register</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="label">Full Name *</label>
              <input {...register('name')} type="text" placeholder="Dr. John Smith" className={`input-field ${errors.name ? 'input-error' : ''}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address *</label>
              <input {...register('email')} type="email" placeholder="doctor@example.com" className={`input-field ${errors.email ? 'input-error' : ''}`} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone Number</label>
              <input {...register('phone')} type="tel" placeholder="+91-9800000000" className="input-field" />
            </div>

            {/* License Number */}
            <div>
              <label className="label">Medical License Number *</label>
              <input {...register('licenseNumber')} type="text" placeholder="MCI-12345" className={`input-field ${errors.licenseNumber ? 'input-error' : ''}`} />
              {errors.licenseNumber && <p className="text-xs text-red-500 mt-1">{errors.licenseNumber.message}</p>}
            </div>

            {/* Specialization */}
            <div>
              <label className="label">Specialization *</label>
              <select {...register('specialization')} className={`input-field ${errors.specialization ? 'input-error' : ''}`}>
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization.message}</p>}
            </div>

            {/* Clinic */}
            <div className="md:col-span-2">
              <label className="label">Hospital / Clinic Name</label>
              <input {...register('clinicName')} type="text" placeholder="City Medical Center" className="input-field" />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password *</label>
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

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password *</label>
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800">
            By registering, you confirm that you are a licensed medical professional and agree to use this system for legitimate clinical record management purposes only.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary justify-center py-2.5 mt-5"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Registering...</>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
