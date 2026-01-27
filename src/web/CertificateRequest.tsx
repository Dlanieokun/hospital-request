import React, { useState, useEffect, useMemo } from 'react';

const API_BASE_URL = "http://127.0.0.1:8000/api";

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
  details: { name: string; fee: number; days: number; };
  sub_options: SubOption[];
  sub_questions: SubQuestion[];
}

interface HospitalRequest {
  id: number;
  reference: string;
  name: string;
  status: string; 
  status_request: string;
  request_date: string | null;
  date: string;
  time: string;
  release_date: string | null;
  updated_at: string;
  certificate_requests: CertificateRequestItem[];
}

const CertificateRequest = () => {
  const [data, setData] = useState<HospitalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HospitalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Search, Filter & Pagination State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showPending, setShowPending] = useState(true);
  const [showReleased, setShowReleased] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Helper for Authorization Headers
  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  // Fetch Logic
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/certificates`, { 
        headers: getHeaders() 
      });
      if (response.ok) {
        const result = await response.json();
        setData(Array.isArray(result) ? result : result.data || []);
      } else {
        setError("Failed to load certificates. Please check your connection.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Update Status to "release"
  const handleRelease = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      const response = await fetch(`${API_BASE_URL}/receipts/${requestId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'release' }),
      });

      if (response.ok) {
        const now = new Date().toLocaleString();
        const updatedData = data.map(req =>
            req.id === requestId ? { ...req, status_request: 'release', release_date:  now} : req
        );
        setData(updatedData);
        
        if (selectedRequest?.id === requestId) {
            setSelectedRequest(prev => prev ? { ...prev, status_request: 'release', release_date: now} : null);
        }
      } else {
          alert("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Reset pagination to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showPending, showReleased]);

  // --- Filtering & Pagination Logic ---
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isReleased = item.status_request === 'release';
      const matchesStatus = (isReleased && showReleased) || (!isReleased && showPending);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, showPending, showReleased]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-lg text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
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

        {/* Controls: Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <input 
              type="text"
              placeholder="Search by name or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
            <div className="absolute right-3 top-3.5 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <label className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors">
              <input 
                type="checkbox" 
                checked={showPending} 
                onChange={() => setShowPending(!showPending)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-slate-600">Pending</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors">
              <input 
                type="checkbox" 
                checked={showReleased} 
                onChange={() => setShowReleased(!showReleased)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-sm font-bold text-slate-600">Released</span>
            </label>
          </div>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                {error}
            </div>
        )}

        {/* Request Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Requestor Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Certificates Requested</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Certificate Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Request Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Release Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">Updating records...</td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((req) => (
                  <tr key={req.id} className="hover:bg-blue-50/30 transition-all">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 uppercase font-bold text-xs">
                          {req.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 uppercase text-sm">{req.name}</p>
                          <p className="text-[10px] font-mono text-blue-500 tracking-tighter">{req.reference}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        {req.certificate_requests?.map((cert) => (
                          <div key={cert.id} className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-white border border-blue-100 text-blue-700 text-[10px] font-bold rounded shadow-sm">
                              {cert.details.name} {cert.copies > 1 && <span className="text-slate-400 ml-1">×{cert.copies}</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{req.date}</span>
                        <span className="text-[10px] text-slate-400">{req.time}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="text-xs font-semibold text-slate-600">
                        {formatDateTime(req.request_date)}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {req.release_date ? (
                        <span className="text-sm font-bold text-emerald-600">{req.release_date}</span>
                      ) : (
                        <span className="text-xs italic text-slate-300">Not Released</span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="text-slate-500 hover:text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          View Info
                        </button>

                        {req.status_request === 'release' ? (
                          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-wider">
                            Released
                          </div>
                        ) : (
                          <button 
                            disabled={processingId === req.id}
                            onClick={() => handleRelease(req.id)}
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 ${processingId === req.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {processingId === req.id ? 'Processing...' : 'Release'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">No records found matching your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-500">
              Showing page <span className="text-blue-600">{currentPage}</span> of {totalPages || 1}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === idx + 1 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'hover:bg-white text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Detail Review Modal --- */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden border border-slate-200 flex flex-col">
            
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Review Request</h3>
                <p className="text-slate-400 text-xs font-mono">{selectedRequest.reference}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-white">
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient Name</label>
                  <p className="text-xl font-bold text-slate-800 uppercase">{selectedRequest.name}</p>
                </div>
                {selectedRequest.status_request === 'release' && (
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black">
                    RELEASED ON {selectedRequest.release_date}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {selectedRequest.certificate_requests?.map((cert) => (
                  <div key={cert.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between">
                      <span className="text-sm font-bold text-blue-700">{cert.details.name} (x{cert.copies})</span>
                      <span className="text-[10px] font-bold text-slate-400">₱{cert.details.fee}</span>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {cert.sub_questions && cert.sub_questions.length > 0 ? (
                        cert.sub_questions.map((q) => (
                          <div key={q.id}>
                            <p className="text-[11px] font-bold text-slate-400 mb-1">{q.details.question}</p>
                            <p className="text-sm font-semibold text-slate-700 bg-blue-50/30 p-2 rounded-lg">
                              {q.answer}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-2">No additional assessment data.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200"
              >
                Close
              </button>
              {selectedRequest.status_request !== 'release' && (
                <button 
                  disabled={processingId === selectedRequest.id}
                  onClick={() => handleRelease(selectedRequest.id)}
                  className={`bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all ${processingId === selectedRequest.id ? 'opacity-50' : ''}`}
                >
                  {processingId === selectedRequest.id ? 'Updating...' : 'Approve & Release'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateRequest;