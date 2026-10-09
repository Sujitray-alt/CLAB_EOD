import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/monthly')) return 'Monthly Summaries';
    if (path.includes('/daily')) return 'Daily Operational Logs';
    if (path.includes('/dms')) return 'District Managers';
    if (path.includes('/reports')) return 'Reports & Exports';
    if (path.includes('/settings')) return 'Settings & Security';
    return 'Executive Overview';
  };

  return (
    <header className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between z-10 sticky top-0">
      
      {/* Title / Context */}
      <div>
        <h1 className="text-[18px] font-bold tracking-tight text-[#0F1729]">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center space-x-5">
        
        {/* 2FA Security Badge */}
        {user?.role === 'admin' && (
          user.is_2fa_enabled ? (
            <div className="flex items-center space-x-1.5 text-[#16A34A] text-[13px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              <span>2FA Active</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/setup-2fa')}
              className="flex items-center space-x-1.5 text-[#D97706] hover:text-[#B45309] text-[13px] font-semibold transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Configure 2FA</span>
            </button>
          )
        )}

        {/* User Info Badge */}
        <div className="flex items-center space-x-2 text-[13px]">
          <span className="font-semibold text-[#0F1729]">{user?.name}</span>
          <span className="text-[#9CA3AF] font-mono text-[11px] uppercase border border-[#E2E8F0] bg-[#F5F7FA] px-1.5 py-0.5 rounded">
            {user?.role}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center space-x-1.5 text-[#4B5563] hover:text-[#DC2626] text-[13px] font-semibold transition"
          title="Sign out of dashboard session"
        >
          <span>Sign Out</span>
        </button>

      </div>

    </header>
  );
}
