import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Stethoscope, Shield, Users, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! Redirecting...');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[580px] flex">
      {/* Left panel — branding */}
      <div className="hidden md:flex flex-col w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Stethoscope size={22} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">MediCare</p>
            <p className="text-xs text-blue-200 leading-none mt-1">Doctor Portal</p>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-3 leading-tight">
            Secure Medical Record Management
          </h2>
          <p className="text-sm text-blue-200 mb-8 leading-relaxed">
            Access and manage your patients' clinical records securely. Built for healthcare professionals.
          </p>

          <div className="space-y-4">
            {[
              { icon: Shield, label: 'HIPAA-aware security practices' },
              { icon: Users, label: 'Complete patient management' },
              { icon: Activity, label: 'Clinical records & timelines' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <p className="text-sm text-blue-100">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-blue-200 leading-relaxed">
              <span className="font-semibold text-white">⚠ Demo System</span> — This is a demonstration portal.
              All patient data shown is completely fictional.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-12">
        <div className="max-w-sm w-full mx-auto">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">MediCare Portal</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your doctor account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="dr.demo@medicare-portal.dev"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Remember me for 7 days</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary justify-center py-2.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-blue-800 mb-1">🔑 Demo Credentials</p>
              <p className="text-xs text-blue-700 font-mono">dr.demo@medicare-portal.dev</p>
              <p className="text-xs text-blue-700 font-mono">Demo@1234</p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Register as Doctor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
