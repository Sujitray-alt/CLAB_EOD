import React from 'react';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, CalendarCheck, FileText, ChevronRight, Activity, TrendingUp, AlertCircle, Loader2, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useFilterStore } from '../store/filterStore';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label
} from 'recharts';

interface DailyTrendPoint {
  enroll_date: string;
  label: string;
  total_enrollment: number;
  total_revenue: number;
}

interface TopStationData {
  station_id: string;
  station_name: string;
  district_name: string;
  active_days: number;
  total_enrollment: number;
  total_revenue: number;
}

interface CategoryMixItem {
  category: string;
  count: number;
}

interface DMOverviewResponse {
  total_enrollment: number;
  total_revenue: number;
  active_days_count: number;
  daily_trend: DailyTrendPoint[];
  top_stations: TopStationData[];
  category_mix: CategoryMixItem[];
}

const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

export function DMOverview() {
  const user = useAuthStore((s) => s.user);
  const { month, districtId, startDate, endDate } = useFilterStore();

  const { data, isLoading, error } = useQuery<DMOverviewResponse>({
    queryKey: ['dm_overview', month, districtId, startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (month) params.month = month;
      if (districtId) params.district_id = districtId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/api/dm/overview', { params });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name || 'District Manager'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            District ID: <span className="font-mono text-slate-700 font-semibold">{user?.dmid || 'N/A'}</span> &bull; Here is your district's summary.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-semibold text-sm">District Status: Operational</span>
        </div>
      </div>

      {isLoading && (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-900 animate-spin" />
          <p className="text-slate-500 font-medium">Loading district summary...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">Failed to load overview data</h3>
            <p className="text-red-700 text-sm mt-1">
              There was a problem communicating with the server. Please try again later.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Enrollment</span>
                <Activity className="w-5 h-5 text-blue-900" />
              </div>
              <div className="mt-4 text-3xl font-black text-slate-900">
                {(data.total_enrollment || 0).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-4 text-3xl font-black text-slate-900">
                ₹{(data.total_revenue || 0).toLocaleString()}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Days Recorded</span>
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="mt-4 text-3xl font-black text-indigo-700">
                {data.active_days_count} Days
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
              <div className="mb-4">
                <h3 className="font-bold text-slate-900">Daily Enrollment Trend</h3>
                <p className="text-xs text-slate-500">Historical enrollment volume trajectory</p>
              </div>
              <div className="h-64">
                {data.daily_trend && data.daily_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.daily_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} minTickGap={30} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="total_enrollment" name="Enrollments" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollment)" activeDot={{ r: 6, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No trend data available for this period.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Category Mix */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/dm/dashboard/upload" className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50 text-indigo-900 hover:bg-indigo-100 transition border border-indigo-100">
                    <div className="flex items-center space-x-3">
                      <UploadCloud className="w-5 h-5" />
                      <span className="font-semibold text-sm">Upload EOD Data</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to="/dm/dashboard/daily" className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 transition border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5" />
                      <span className="font-semibold text-sm">View Daily Logs</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">Category Breakdown</h3>
                <div className="h-48 w-full flex items-center justify-center">
                  {data.category_mix && data.category_mix.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.category_mix}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          label={(props) => {
                            if (!props.value) return null;
                            const { cx, cy, midAngle, outerRadius } = props;
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 15;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={x} y={y} fill="#475569" fontSize={11} fontWeight={600} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                {props.value.toLocaleString()}
                              </text>
                            );
                          }}
                        >
                          {data.category_mix.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-400">No fee category data.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top Stations Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Top Performing Stations</h3>
                <p className="text-xs text-slate-500">Highest enrollment contributing stations</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Station ID</th>
                    <th className="py-3 px-4 text-right">Enrollments</th>
                    <th className="py-3 px-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.top_stations && data.top_stations.length > 0 ? (
                    data.top_stations.map((station, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-slate-800">{station.station_id}</td>
                        <td className="py-3 px-4 text-right font-bold text-blue-900">{(station.total_enrollment || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-slate-700 font-mono">₹{(station.total_revenue || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-sm text-slate-400">
                        No station data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
