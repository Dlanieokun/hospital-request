import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';

// --- Types & Interfaces ---
interface SubQuestion {
  id: number;
  answer: string;
  details: { question: string; };
}

interface SubOption {
  details: { name: string; };
}

interface CertificateRequestItem {
  id: number;
  copies: number;
  details: { name: string; fee: number; days: number; syn_cert: string, url: string};
  sub_options: SubOption[];
  sub_questions: SubQuestion[];
  sync_data: any;
}

interface HospitalRequest {
  id: number;
  reference: string;
  case_id: string;
  name: string;
  receiver_name?: string; 
  status: string; 
  status_request: string;
  request_date: string | null;
  date: string;
  time: string;
  release_date: string | null;
  updated_at: string;
  certificate_requests: CertificateRequestItem[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_WEB = import.meta.env.VITE_API_WEB;

const CertificateRequest = () => {
  const [data, setData] = useState<HospitalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HospitalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releaseTarget, setReleaseTarget] = useState<HospitalRequest | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showPending, setShowPending] = useState(true);
  const [showPreparing, setShowPreparing] = useState(true);
  const [showPrepared, setShowPrepared] = useState(true);
  const [showReleased, setShowReleased] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const getHeaders = useCallback(() => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }), []);

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString; 
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const fetchRequests = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await fetch(`${API_BASE_URL}/certificates`, { headers: getHeaders() });
      if (response.ok) {
        const result = await response.json();
        setData(Array.isArray(result) ? result : result.data || []);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchRequests();
    const intervalId = setInterval(() => fetchRequests(true), 30000);
    return () => clearInterval(intervalId);
  }, [fetchRequests]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      setProcessingId(id);
      const response = await fetch(`${API_BASE_URL}/receipts/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setData(prev => prev.map(req => req.id === id ? { ...req, status_request: newStatus } : req));
        if (selectedRequest?.id === id) {
          setSelectedRequest(prev => prev ? { ...prev, status_request: newStatus } : null);
        }
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRelease = async () => {
    if (!releaseTarget) return;
    try {
      setProcessingId(releaseTarget.id);
      const response = await fetch(`${API_BASE_URL}/receipts/${releaseTarget.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'release', receiver_name: receiverName }),
      });
      if (response.ok) {
        const now = new Date().toISOString();
        setData(prev => prev.map(req =>
          req.id === releaseTarget.id ? { ...req, status_request: 'release', release_date: now, receiver_name: receiverName } : req
        ));
        setIsReleaseModalOpen(false);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrintCertificate = async (cert: CertificateRequestItem, request: HospitalRequest) => {
    let apiData: any = {};
    try {
      const url = `${API_WEB}/${cert?.details?.url}/${request?.case_id}`;
      const response = await fetch(url);
      const result = await response.json();
      apiData = result.data || {};
    } catch (e) {}

    const mapped = Object.fromEntries(
      cert.sync_data.map((item: any) => {
        const syncKey = item.key_sync;
        let value = (request as any)[syncKey] || "";
        if (!value) {
          const allApiFields: any = Object.values(apiData).reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {});
          value = allApiFields[syncKey] || cert.sub_questions.find((sq: any) => sq.details.question === syncKey)?.answer || "";
        }
        return [item.key, value];
      })
    );
    navigate(cert?.details?.syn_cert ? `/${cert.details.syn_cert}` : "/medical-certificate", { state: { mappedData: mapped } });
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(query) || item.reference.toLowerCase().includes(query);
      const s = item.status_request;
      const matchesStatus = (s === 'request' && showPending) || (s === 'preparing' && showPreparing) || (s === 'prepared' && showPrepared) || (s === 'release' && showReleased);
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, showPending, showPreparing, showPrepared, showReleased]);

  const paginatedData = useMemo(() => {
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const renderActionButton = (req: HospitalRequest) => {
    const isProcessing = processingId === req.id;
    if (req.status_request === 'release') return (
      <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Released
      </div>
    );

    const steps: Record<string, { label: string, color: string, next: string }> = {
      'request': { label: 'Preparing', color: 'bg-blue-600 hover:bg-blue-700', next: 'preparing' },
      'preparing': { label: 'Prepared', color: 'bg-amber-500 hover:bg-amber-600', next: 'prepared' },
      'prepared': { label: 'Release', color: 'bg-indigo-600 hover:bg-indigo-700', next: 'release' }
    };
    const config = steps[req.status_request];
    if (!config) return null;

    return (
      <button 
        disabled={isProcessing} 
        onClick={() => config.next === 'release' ? (setReleaseTarget(req), setReceiverName(req.name), setIsReleaseModalOpen(true)) : updateStatus(req.id, config.next)} 
        className={`${config.color} text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50`}
      >
        {isProcessing ? '...' : config.label}
      </button>
    );
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-lg text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </span>
              Hospital Certificate System
            </h1>
            <p className="text-slate-500 font-medium mt-1 ml-11">Document Issuance & Request Tracker</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Requests</p>
            <p className="text-xl font-black text-blue-600">{filteredData.length} Found</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <input 
              type="text"
              placeholder="Search by name or reference..."
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            {[
              { state: showPending, setter: setShowPending, label: 'Pending', color: 'text-blue-600' },
              { state: showPreparing, setter: setShowPreparing, label: 'Preparing', color: 'text-amber-500' },
              { state: showPrepared, setter: setShowPrepared, label: 'Prepared', color: 'text-indigo-600' },
              { state: showReleased, setter: setShowReleased, label: 'Released', color: 'text-emerald-600' }
            ].map((f, i) => (
              <label key={i} className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors border-r border-slate-100 last:border-0">
                <input type="checkbox" checked={f.state} onChange={() => {f.setter(!f.state); setCurrentPage(1);}} className={`w-4 h-4 ${f.color} rounded border-slate-300`} />
                <span className="text-sm font-bold text-slate-600">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Requestor Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Requested Certificates</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Visit Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Request Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Prepare / Release Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name of Receiver</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">Updating records...</td></tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((req) => (
                    <tr key={req.id} className="hover:bg-blue-50/30 transition-all">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 uppercase font-bold text-xs">{req.name.substring(0, 2)}</div>
                          <div>
                            <p className="font-bold text-slate-800 uppercase text-sm">{req.name}</p>
                            <p className="text-[10px] font-mono text-blue-500 tracking-tighter">{req.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {req.certificate_requests?.map((cert) => (
                            <span key={cert.id} className="px-2 py-0.5 bg-white border border-blue-100 text-blue-700 text-[10px] font-bold rounded shadow-sm">
                              {cert.details.name} {cert.copies > 1 && <span className="text-slate-400 ml-1">×{cert.copies}</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{req.date}</span>
                          <span className="text-[10px] text-slate-400">{req.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-semibold text-slate-600">{formatDateTime(req.request_date)}</td>
                      <td className="px-6 py-5">
                        {req.release_date ? <span className="text-sm font-bold text-emerald-600">{formatDateTime(req.release_date)}</span> : <span className="text-xs italic text-slate-300">Not Released</span>}
                      </td>
                      <td className="px-6 py-5">
                        {req.status_request === 'release' ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 uppercase">{req.receiver_name || req.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">Authorized Receiver</span>
                          </div>
                        ) : <span className="text-xs italic text-slate-300">Pending...</span>}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button onClick={() => setSelectedRequest(req)} className="text-slate-500 hover:text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">View Info</button>
                          {renderActionButton(req)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* ORIGINAL PAGINATION DESIGN PRESERVED */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-500">Page <span className="text-blue-600">{currentPage}</span> of {totalPages || 1}</p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30">«</button>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30">‹</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30">›</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30">»</button>
            </div>
          </div>
        </div>
      </div>

      {/* Release Confirmation Modal */}
      {isReleaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirm Release</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest font-mono">Reference: {releaseTarget?.reference}</p>
            </div>
            <div className="p-8 bg-slate-50/50">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Who is receiving the document?</label>
              <input autoFocus type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Enter receiver's name..." className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm font-bold text-slate-700 uppercase" />
            </div>
            <div className="px-8 py-6 border-t border-slate-100 bg-white flex gap-3">
              <button onClick={() => setIsReleaseModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
              <button disabled={!receiverName.trim() || processingId !== null} onClick={handleRelease} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black shadow-lg hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal - WITH SUB-DETAILS */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                <div><h3 className="text-xl font-black text-slate-800 tracking-tight">Request Details</h3><p className="text-xs font-bold text-blue-500 font-mono tracking-tighter uppercase">{selectedRequest.reference}</p></div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-8 overflow-y-auto">
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="col-span-2 border-b border-slate-200 pb-4 mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient Name</label>
                  <p className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedRequest.name}</p>
                </div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Visit Date</label><p className="text-sm font-bold text-slate-700">{selectedRequest.date}</p></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Status</label><span className={`font-black text-[10px] uppercase italic ${selectedRequest.status_request === 'release' ? 'text-emerald-600' : 'text-amber-500'}`}>{selectedRequest.status_request}</span></div>
              </div>

              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Documents Requested</h4>
              <div className="space-y-4">
                {selectedRequest.certificate_requests?.map((cert) => (
                  <div key={cert.id} className="group border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3"><div className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg">x{cert.copies}</div><span className="text-sm font-black text-slate-800">{cert.details.name}</span></div>
                      <button onClick={() => handlePrintCertificate(cert, selectedRequest)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
                    </div>
                    {/* SUB-DETAILS SHOWING HERE */}
                    <div className="bg-slate-50/50 p-5">
                      {cert.sub_questions && cert.sub_questions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {cert.sub_questions.map((q) => (
                            <div key={q.id} className="relative pl-4 border-l-2 border-blue-200">
                              <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">{q.details.question}</p>
                              <p className="text-sm font-bold text-slate-700">{q.answer}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold uppercase text-center opacity-40">No additional details</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-8 py-6 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button onClick={() => setSelectedRequest(null)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">Go Back</button>
              {selectedRequest.status_request !== 'release' && renderActionButton(selectedRequest)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateRequest;