import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTempToken = useAuthStore((s) => s.setTempToken);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const data = response.data;

      if (data.mfa_required) {
        setTempToken(data.access_token);
        navigate('/verify-2fa');
      } else {
        setAuth(data.user, data.access_token);
        
        if (false && data.user.role === 'admin' && (data.user.is_demo_creds || data.is_demo_creds)) {
          // Temporarily disabled for testing
          navigate('/update-credentials');
        } else if (false && data.user.must_change_password) {
          // Temporarily disabled for testing
          navigate('/change-password');
        } else {
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dm/dashboard');
          }
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Sign in failed. Please check your credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCreds = () => {
    setEmail('admin@demo.com');
    setPassword('AdminDemo123!');
    setError(null);
  };

  const handleClearForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[440px] bg-white rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-[#E2E8F0] overflow-hidden">
        
        {/* Header Strip */}
        <div className="bg-white px-8 pt-10 pb-6 text-center space-y-5">
          <img src="/logo.png" alt="Computer LAB Logo" className="mx-auto h-14 object-contain" />
          <div className="space-y-1.5">
            <h1 className="text-[18px] font-bold text-[#0F1729]">EOD Operations Portal</h1>
            <p className="text-[#9CA3AF] text-[13px]">
              Sign in to access your dashboard and operations data
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 pb-10 space-y-6">
          
          {/* Error Callout */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start space-x-3 text-red-800 text-[13px]">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Sign In Problem</p>
                <p className="text-red-700 text-[12px] mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#4B5563]">
                Email address or DM ID
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com or ClabDM01"
                autoComplete="username"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-[8px] text-[#0F1729] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2952C4] focus:border-transparent text-[13px] transition"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#4B5563]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full px-3.5 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-[8px] text-[#0F1729] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2952C4] focus:border-transparent text-[13px] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#4B5563]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A3A8F] hover:bg-[#2952C4] text-white font-semibold py-2.5 px-4 rounded-[8px] transition flex items-center justify-center space-x-2 text-[14px] disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 flex flex-col items-center space-y-4">
            <button
              type="button"
              onClick={handleFillDemoCreds}
              className="text-[12px] font-semibold text-[#1A3A8F] hover:underline"
            >
              Use demo credentials
            </button>
            <p className="text-[11px] text-[#9CA3AF]">
              Access is restricted to authorised personnel only.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
