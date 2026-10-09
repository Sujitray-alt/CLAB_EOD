import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Users,
  TrendingUp,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { useFilterStore } from '../store/filterStore';
import { useAuthStore } from '../store/authStore';

interface MonthlyRow {
  summary_id: number;
  enroll_month: number;
  station_id: string;
  station_name?: string;
  operator_code: string;
  operator_name?: string;
  district_id?: number;
  district_name?: string;
  dm_id?: string;
  dm_name?: string;
  total_enrollment: number;
  total_amount: number;
  bmu_100: number;
  dmu_50: number;
  mbu_0: number;
  mbu_100: number;
  new_0: number;
  bmu_125: number;
  dmu_75: number;
  mbu_125: number;
}

export function MonthlyAnalysis() {
  const currentUser = useAuthStore((s) => s.user);
  const globalFilters = useFilterStore();

  const [records, setRecords] = useState<MonthlyRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Local search filter
  const [stationSearch, setStationSearch] = useState<string>('');

  useEffect(() => {
    fetchMonthlyRecords();
  }, [page, pageSize, globalFilters.month, globalFilters.districtId, globalFilters.dmId]);

  const fetchMonthlyRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        page_size: pageSize,
      };
      if (globalFilters.month) params.month = globalFilters.month;
      if (globalFilters.districtId) params.district_id = globalFilters.districtId;
      if (globalFilters.dmId) params.dm_id = globalFilters.dmId;
      if (stationSearch.trim()) params.station_id = stationSearch.trim();

      const endpoint = currentUser?.role === 'admin' ? '/api/monthly/' : '/api/dm/monthly';
      const res = await api.get(endpoint, { params });
      setRecords(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to load monthly station records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMonthlyRecords();
  };

  const handleResetSearch = () => {
    setStationSearch('');
    setPage(1);
    fetchMonthlyRecords();
  };

  const formatMonthLabel = (m: number) => {
    const s = m.toString();
    if (s.length === 6) {
      const yr = s.substring(0, 4);
      const mo = parseInt(s.substring(4, 6), 10);
      const dateObj = new Date(parseInt(yr, 10), mo - 1, 1);
      return dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }
    return s;
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  // Calculate local page aggregates for high-level insight
  const pageEnrollments = records.reduce((sum, r) => sum + r.total_enrollment, 0);
  const pageAmount = records.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Page Header */}
      <div className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-[22px] font-bold text-[#0F1729]">
          Monthly Station Summaries
        </h1>
        <p className="text-[13px] text-[#4B5563] mt-1">
          Detailed monthly production records, fee category breakdowns, and revenue statistics.
        </p>
      </div>

      {/* Summary KPI Strip for Current View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-[8px] border border-[#E2E8F0] flex flex-col justify-between relative">
          <Building2 className="w-4 h-4 text-[#9CA3AF] absolute top-5 right-5" />
          <span className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wide">Total Monthly Records</span>
          <div className="mt-3 text-[28px] font-extrabold text-[#0F1729]">
            {total.toLocaleString()} <span className="text-[14px] font-medium text-[#4B5563]">records</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[8px] border border-[#E2E8F0] flex flex-col justify-between relative">
          <TrendingUp className="w-4 h-4 text-[#9CA3AF] absolute top-5 right-5" />
          <span className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wide">Page Volume</span>
          <div className="mt-3 text-[28px] font-extrabold text-[#0F1729]">
            {pageEnrollments.toLocaleString()} <span className="text-[14px] font-medium text-[#4B5563]">enrollments</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[8px] border border-[#E2E8F0] flex flex-col justify-between relative">
          <DollarSign className="w-4 h-4 text-[#9CA3AF] absolute top-5 right-5" />
          <span className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wide">Page Revenue Output</span>
          <div className="mt-3 text-[28px] font-extrabold text-[#0F1729] font-mono">
            ₹{pageAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-[8px] border border-[#E2E8F0]">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search by Station ID (e.g. STN001)..."
              value={stationSearch}
              onChange={(e) => setStationSearch(e.target.value)}
              className="w-full px-3.5 py-2 h-9 bg-white border border-[#CBD5E1] rounded-[8px] text-[13px] text-[#0F1729] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2952C4]"
            />
          </div>

          <button
            type="submit"
            className="px-5 h-9 bg-[#1A3A8F] text-white font-semibold rounded-[8px] text-[13px] hover:bg-[#2952C4] transition"
          >
            Search Station
          </button>

          {stationSearch && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="px-4 h-9 text-[#1A3A8F] hover:underline text-[13px] font-semibold transition"
            >
              Reset Search
            </button>
          )}
        </form>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[8px] p-4 flex items-start space-x-3 text-red-800 text-[13px]">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="font-medium">{error}</div>
        </div>
      )}

      {/* Monthly Summary Data Table */}
      <div className="bg-white rounded-[8px] border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#4B5563]">
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Station ID & Name</th>
                <th className="py-3 px-4">Operator Code</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">District Manager</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">BMU @ 100</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">BMU @ 125</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">DMU @ 50</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">DMU @ 75</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">MBU @ 0</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">MBU @ 100</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">MBU @ 125</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">NEW @ 0</th>
                <th className="py-3 px-4 text-right">Enrollments</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan={15} className="text-center py-12 text-[#9CA3AF]">
                    <div className="flex items-center justify-center space-x-2 font-medium">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1A3A8F]" />
                      <span>Loading Monthly Records...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.summary_id} className="hover:bg-[#F8FAFC] transition h-[48px]">
                    
                    {/* Month */}
                    <td className="py-2 px-4 font-semibold text-[#0F1729]">
                      {formatMonthLabel(r.enroll_month)}
                    </td>

                    {/* Station */}
                    <td className="py-2 px-4">
                      <div className="font-semibold text-[#0F1729]">{r.station_name || `Station ${r.station_id}`}</div>
                      <div className="text-[11px] text-[#9CA3AF] font-mono">{r.station_id}</div>
                    </td>

                    {/* Operator */}
                    <td className="py-2 px-4 font-mono font-medium text-[#4B5563]">
                      {r.operator_code}
                    </td>

                    {/* District */}
                    <td className="py-2 px-4 text-[#4B5563]">
                      {r.district_name || 'Unassigned'}
                    </td>

                    {/* DM */}
                    <td className="py-2 px-4">
                      {r.dm_name ? (
                        <>
                          <div className="font-medium text-[#0F1729]">{r.dm_name}</div>
                          <div className="text-[11px] font-mono text-[#9CA3AF]">{r.dm_id}</div>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#9CA3AF] italic">Unassigned</span>
                      )}
                    </td>

                    {/* Fee Category Breakdowns */}
                    <td className="py-2 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      {r.bmu_100 > 0 ? <span className="text-[#0F1729] font-medium">{r.bmu_100} <span className="text-[#9CA3AF]">(₹{(r.bmu_100 * 100).toLocaleString()})</span></span> : <span className="text-[#D1D5DB]">0</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      {r.bmu_125 > 0 ? <span className="text-[#0F1729] font-medium">{r.bmu_125} <span className="text-[#9CA3AF]">(₹{(r.bmu_125 * 125).toLocaleString()})</span></span> : <span className="text-[#D1D5DB]">0</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      {r.dmu_50 > 0 ? <span className="text-[#0F1729] font-medium">{r.dmu_50} <span className="text-[#9CA3AF]">(₹{(r.dmu_50 * 50).toLocaleString()})</span></span> : <span className="text-[#D1D5DB]">0</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      {r.dmu_75 > 0 ? <span className="text-[#0F1729] font-medium">{r.dmu_75} <span className="text-[#9CA3AF]">(₹{(r.dmu_75 * 75).toLocaleString()})</span></span> : <span className="text-[#D1D5DB]">0</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      {r.mbu_0 > 0 ? <span className="text-[#0F1729] font-medium">{r.mbu_0} <span className="text-[#9CA3AF]">(₹0)</span></span> : <span className="text-[#D1D5DB]">0</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      {r.mbu_100 > 0 ? <span className="text-[#0F1729] font-medium">{r.mbu_100} <span className="text-[#9CA3AF]">(₹{(r.mbu_100 * 100).toLocaleString()})</span></span> : <span className="text-[#D1D5DB]">0</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      {r.mbu_125 > 0 ? <span className="text-[#0F1729] font-medium">{r.mbu_125} <span className="text-[#9CA3AF]">(₹{(r.mbu_125 * 125).toLocaleString()})</span></span> : <span className="text-[#D1D5DB]">0</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      {r.new_0 > 0 ? <span className="text-[#0F1729] font-medium">{r.new_0} <span className="text-[#9CA3AF]">(₹0)</span></span> : <span className="text-[#D1D5DB]">0</span>}
                    </td>

                    {/* Total Enrollments */}
                    <td className="py-2 px-4 text-right font-bold text-[#0F1729]">
                      {r.total_enrollment.toLocaleString()}
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-4 text-right font-mono font-medium text-[#4B5563]">
                      ₹{Number(r.total_amount || 0).toLocaleString()}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="text-center py-12 text-[#9CA3AF] text-[13px] italic">
                    No records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-[12px] text-[#4B5563]">
          <div>
            Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, total)} of {total.toLocaleString()} records
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white border border-[#CBD5E1] rounded-[6px] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#1A3A8F]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">Page {page} of {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default MonthlyAnalysis;
