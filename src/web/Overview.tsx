import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, CheckCircle, TrendingUp, 
  FileText, ArrowUpRight, Calendar, AlertCircle
} from 'lucide-react';

// --- Types ---
interface CertificateDetail {
  name: string;
  fee: number;
}

interface CertificateRequest {
  details: CertificateDetail;
}

interface DashboardItem {
  id: number;
  name: string;
  time: string;
  mode: string;
  certificate_requests: CertificateRequest[];
}

interface DashboardData {
  payment_count: number;
  paid_count: number;
  total_paid: string | number;
  pending: DashboardItem[];
  request: DashboardItem[];
  release: DashboardItem[];
}

const Overview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserData = () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return null;
      return JSON.parse(userString);
    } catch (e) {
      return null;
    }
  };

  const user = getUserData();
  const userRole = user?.role?.toLowerCase() || '';

  const isAdministrator = userRole === 'administrator' || userRole === 'admin';
  const isMedicalStaff = userRole === 'medical staff';
  const isTreasurer = userRole === 'treasurer';

  const showStats = isAdministrator || isTreasurer;
  const showTables = isAdministrator || isMedicalStaff;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://127.0.0.1:8000/api/dashboard', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (error: any) {
        setError(error.message || "Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getDocumentLabel = (requests: CertificateRequest[]) => {
    if (!requests || requests.length === 0) return 'General Request';
    const firstDoc = requests[0]?.details?.name;
    return requests.length > 1 ? `${firstDoc} (+${requests.length - 1})` : firstDoc;
  };

  // --- Sub-Components ---
  // Added showViewAll prop with a default of true
  const TableCard = ({ title, items, showViewAll = true }: { title: string, items: DashboardItem[], showViewAll?: boolean }) => (
    <div className="bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
          <FileText size={16} className="text-indigo-500" />
          {title}
        </h3>
        {/* Conditional rendering for the View All button */}
        {showViewAll && (
          <button 
            onClick={() => navigate('/hospital/certificate')}
            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items && items.length > 0 ? (
              items.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div className="truncate mr-2">
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors truncate uppercase">{row.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{getDocumentLabel(row.certificate_requests)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 whitespace-nowrap">
                          {row.time ? row.time.split(':').slice(0, 2).join(':') : '--:--'}
                        </span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                          {row.mode}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="px-6 py-10 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">No Records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center animate-pulse font-bold text-slate-400">Loading Dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Hospital Analytics</h2>
          <p className="text-slate-500 text-sm font-medium">Logged in as: <span className="capitalize font-bold text-indigo-600">{userRole || 'User'}</span></p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <Calendar size={18} className="text-emerald-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="For Payment" value={data?.payment_count} color="text-amber-500" bg="bg-amber-500/10" icon={<Clock />} />
          <StatCard label="Paid" value={data?.paid_count} color="text-emerald-500" bg="bg-emerald-500/10" icon={<CheckCircle />} />
          <StatCard label="Total Revenue" value={`₱${parseFloat(data?.total_paid as string || '0').toLocaleString()}`} color="text-indigo-500" bg="bg-indigo-500/10" icon={<TrendingUp />} />
        </div>
      )}

      {showTables && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Incoming Requests now has showViewAll set to false */}
          <TableCard title="Incoming Requests" items={data?.pending || []} showViewAll={false} />
          <TableCard title="Pending Requests" items={data?.request || []} />
          <TableCard title="Release Requests" items={data?.release || []} />
        </div>
      )}

      {!showStats && !showTables && (
        <div className="p-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
          <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Access Restricted</p>
          <p className="text-slate-400 text-sm mt-1">Your role does not have permission to view this section.</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, bg, icon }: any) => (
  <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>{icon}</div>
      <div className="text-emerald-500 font-black text-xs flex items-center gap-1">+12% <ArrowUpRight size={14}/></div>
    </div>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{value || 0}</p>
  </div>
);

export default Overview;