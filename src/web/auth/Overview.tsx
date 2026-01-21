import React from 'react';
import { 
  Clock, CheckCircle, AlertCircle, TrendingUp, 
  Users, Activity, FileText, ArrowUpRight, 
  ArrowDownRight, Calendar
} from 'lucide-react';

const Overview = () => {
  // Sample Data for the Dashboard
  const stats = [
    { label: 'Pending Requests', value: '28', change: '+12%', trendingUp: true, icon: <Clock />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Approved Today', value: '142', change: '+18%', trendingUp: true, icon: <CheckCircle />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Urgent Cases', value: '05', change: '-2%', trendingUp: false, icon: <AlertCircle />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Total Revenue', value: '₱12,450', change: '+5%', trendingUp: true, icon: <TrendingUp />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const recentRequests = [
    { id: 'REQ-001', name: 'Juan Dela Cruz', document: 'Medical Certificate', date: '10:45 AM', status: 'Pending' },
    { id: 'REQ-002', name: 'Maria Santos', document: 'Birth Certificate', date: '09:30 AM', status: 'Processing' },
    { id: 'REQ-003', name: 'Robert Fox', document: 'Clinical Clearance', date: '08:15 AM', status: 'Urgent' },
    { id: 'REQ-004', name: 'Sarah Jenkins', document: 'Medical Certificate', date: 'Yesterday', status: 'Completed' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Hospital Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, Dr. Alex. Here is what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <Calendar size={18} className="text-emerald-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">October 24, 2023</span>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${stat.trendingUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change} {stat.trendingUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Requests Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              Incoming Requests
            </h3>
            <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">View Registry</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Patient & Document</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRequests.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">{row.name}</p>
                      <p className="text-xs text-slate-400">{row.document}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        row.status === 'Urgent' ? 'bg-rose-500/10 text-rose-500' : 
                        row.status === 'Processing' ? 'bg-indigo-500/10 text-indigo-500' : 
                        row.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right text-xs font-bold text-slate-400 italic">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health / Activity Feed */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <Activity className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-125 transition-transform duration-700" size={160} />
            <div className="relative z-10">
              <h4 className="font-black uppercase tracking-widest text-xs text-indigo-200 mb-2">System Status</h4>
              <p className="text-2xl font-bold mb-4">All services are operational</p>
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-100 bg-white/10 w-fit px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Live Server Latency: 24ms
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h4 className="font-black uppercase tracking-widest text-xs text-slate-400 mb-6">Staff Performance</h4>
            <div className="space-y-6">
              {[
                { name: 'Dr. Rivera', task: 'Approvals', score: 92 },
                { name: 'Sarah J.', task: 'Billing', score: 78 },
              ].map((staff, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{staff.name}</span>
                    <span className="font-mono text-emerald-500">{staff.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${staff.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Overview;