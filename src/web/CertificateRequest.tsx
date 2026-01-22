import React, { useState, useEffect } from 'react';

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
  details: { name: string; fee: number; };
  sub_options: SubOption[];
  sub_questions: SubQuestion[];
}

interface HospitalRequest {
  id: number;
  reference: string;
  name: string;
  status: string;
  date: string;
  time: string;
  certificate_requests: CertificateRequestItem[];
}

const CertificateRequest = () => {
  const [data, setData] = useState<HospitalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HospitalRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper for Authorization Headers derived from Treasurer.tsx
  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  // Fetch Logic to replace static data with live API data
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/receipts', { 
        headers: getHeaders() 
      });
      if (response.ok) {
        const result = await response.json();
        // Standardizing the response format
        setData(Array.isArray(result) ? result : result.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Hospital System Header - Preserved Design */}
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
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Queue</p>
              <p className="text-xl font-black text-blue-600">{data.length} Requests</p>
            </div>
          </div>
        </div>

        {/* Request Table - Preserved Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Requestor Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Certificates Requested</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Release Schedule</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">Loading requests...</td>
                </tr>
              ) : data.length > 0 ? (
                data.map((req) => (
                  <tr key={req.id} className="hover:bg-blue-50/30 transition-all">
                    {/* Name Column */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 uppercase font-bold text-xs">
                          {req.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 uppercase text-sm">{req.name}</p>
                          <p className="text-[10px] font-mono text-blue-500">{req.reference}</p>
                        </div>
                      </div>
                    </td>

                    {/* Certificates List Column */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        {req.certificate_requests?.map((cert, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-white border border-blue-100 text-blue-700 text-[11px] font-bold rounded shadow-sm">
                              {cert.details.name}
                            </span>
                            {cert.sub_options?.map((opt, oi) => (
                              <span key={oi} className="text-[10px] text-slate-400 italic font-medium">
                                ({opt.details.name})
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Release Date Column */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{req.date}</span>
                        <span className="text-xs text-slate-400">{req.time}</span>
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center gap-3">
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          View Info
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all active:scale-95">
                          Process Release
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Detail Review Modal - Preserved Design --- */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Patient Request Review</h3>
                <p className="text-slate-400 text-xs">Reference: {selectedRequest.reference}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto bg-white">
              <div className="mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient Name</label>
                <p className="text-xl font-bold text-slate-800 uppercase">{selectedRequest.name}</p>
              </div>

              <div className="space-y-6">
                {selectedRequest.certificate_requests?.map((cert, cIdx) => (
                  <div key={cIdx} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between">
                      <span className="text-sm font-bold text-blue-700">{cert.details.name}</span>
                      <span className="text-[10px] font-bold text-slate-400">Fee: ₱{cert.details.fee}</span>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {cert.sub_questions && cert.sub_questions.length > 0 ? (
                        cert.sub_questions.map((q) => (
                          <div key={q.id}>
                            <p className="text-[11px] font-bold text-slate-400 mb-1">{q.details.question}</p>
                            <p className="text-sm font-semibold text-slate-700 bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                              {q.answer}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-2">No additional assessment questions.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors"
              >
                Cancel Review
              </button>
              <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                Approve & Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateRequest;