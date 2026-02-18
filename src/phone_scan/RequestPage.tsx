import { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';

// --- CONFIGURATION ---
// const API_BASE_URL = "http://127.0.0.1:8000/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_WEB = import.meta.env.VITE_API_WEB;

// --- TYPES & INTERFACES ---
type Time = string;

interface SubQuestion {
  id: number;
  question: string;
  type: string;
  answer: string;
}

interface SubOption {
  id: number;
  name: string;
  check: string;
}

interface RequestOption {
  id: number;
  name: string;
  days: string | number; 
  fee: number;
  sub_options: SubOption[];
  sub_questions?: SubQuestion[];
  purpose?: string;
  copies: number; 
  url?: string; 
}

interface UserData {
  firstname: string;
  lastname: string;
  middlename: string
  patient_id?: number;
}

interface RequestDate {
  date: Date;
  time: Time;
  case_id: string;
}

function RequestPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [requestOptions, setRequestOptions] = useState<RequestOption[]>([]);
  const [activeRequest, setActiveRequest] = useState<RequestOption | null>(null);
  
  // View Control
  const [isDateSelected, setIsDateSelected] = useState(false);

  // Modals
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Data
  const [infoModalData, setInfoModalData] = useState<any>(null);
  const [requestDateList, setRequestDateList] = useState<RequestDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeDate, setSelectedTimeDate] = useState<RequestDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  // --- CALCULATIONS ---
  const totalAmount = useMemo(() => {
    return selectedRequests.reduce((sum, name) => {
      const item = requestOptions.find(r => r.name === name);
      return sum + (item ? (item.fee * item.copies) : 0);
    }, 0);
  }, [selectedRequests, requestOptions]);

  const totalDays = useMemo(() => {
    const selectedData = requestOptions.filter(opt => 
      selectedRequests.includes(opt.name)
    );
    if (selectedData.length === 0) return 0;
    return Math.max(...selectedData.map(opt => Number(opt.days) || 0));
  }, [selectedRequests, requestOptions]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/request`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data: RequestOption[] = await response.json();
        setRequestOptions(data.map(item => ({ ...item, copies: 1 })));
      } catch (err) { console.error(err); }

      const storedUser = sessionStorage.getItem("qrCodeDataJson");
      if (storedUser) { 
        try { 
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          if (parsedUser.patient_id) {
            // setIsFetchingDates(true); // Removed
            const res = await fetch(`${API_BASE_URL}/patient_date/${parsedUser.patient_id}`);
            const dateData = await res.json();
            setRequestDateList(dateData.map((item: any) => ({ 
              date: new Date(item.date), 
              time: item.time, 
              case_id: item.case_id
            })));
            setIsDateModalOpen(true);
          }
        } catch (e) { 
          console.error(e); 
        } // Removed finally { setIsFetchingDates(false); }
      }
      setLoading(false);
    };
    initializePage();
  }, []);

  // --- LOGIC FLOW ---
  const handleDateSelection = (item: RequestDate) => {
    setSelectedDate(`${item.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${item.time}`);
    setSelectedTimeDate(item);
    setIsDateModalOpen(false);
    setIsDateSelected(true);
  };

  const processRequestStep = (request: RequestOption, skipUrl = false) => {
  setIsInfoModalOpen(false);
  setActiveRequest(request);
  const caseId = selectedTimeDate?.case_id;
  const web_patient = `${API_WEB}/${request.url}/${caseId}`;
  
  if (request.url && !skipUrl) { 
    fetchInfoData(web_patient); 
    return; 
  }
  
  if ((request.sub_options?.length || 0) > 0 && !request.purpose) { 
    setIsOptionsModalOpen(true); 
    return; 
  }
  
  if ((request.sub_questions?.length || 0) > 0) { 
    setIsQuestionsModalOpen(true); 
    return; 
  }
  
  addRequest(request.name);
};

  const fetchInfoData = async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "success" || result.message === "Success") {
        setInfoModalData(result.data);
        setIsInfoModalOpen(true);
      }
    } catch (e) { alert("Error loading data"); } finally { setLoading(false); }
  };

  const handleCheckboxChange = (requestName: string) => {
    if (selectedRequests.includes(requestName)) {
      setSelectedRequests(prev => prev.filter(item => item !== requestName));
    } else {
      const request = requestOptions.find(r => r.name === requestName);
      if (!request) return;
      setInfoModalData(null);
      setHasAgreedToTerms(false);
      processRequestStep(request);
    }
  };

  const addRequest = (name: string) => {
    if (!selectedRequests.includes(name)) setSelectedRequests(prev => [...prev, name]);
    setIsInfoModalOpen(false); setIsOptionsModalOpen(false); setIsQuestionsModalOpen(false);
    setActiveRequest(null);
  };

  const handlePurposeSelection = (purposeName: string) => {
    if (!activeRequest) return;
    const updated = { ...activeRequest, purpose: purposeName };
    setRequestOptions(prev => prev.map(opt => opt.id === activeRequest.id ? updated : opt));
    setIsOptionsModalOpen(false);
    processRequestStep(updated, true);
  };

  // --- FIXED HANDLER ---
  const handleAnswerChange = (requestName: string, idx: number, val: string) => {
    // 1. Update the master options list
    setRequestOptions(prev => prev.map(opt => {
      if (opt.name === requestName) {
        const q = [...(opt.sub_questions || [])];
        q[idx] = { ...q[idx], answer: val };
        return { ...opt, sub_questions: q };
      }
      return opt;
    }));

    // 2. Update the activeRequest state so the Modal UI reflects the change
    setActiveRequest(prev => {
        if (!prev || prev.name !== requestName) return prev;
        const updatedQuestions = [...(prev.sub_questions || [])];
        updatedQuestions[idx] = { ...updatedQuestions[idx], answer: val };
        return { ...prev, sub_questions: updatedQuestions };
    });
  };

  const handleCopyChange = (id: number, d: number) => {
    setRequestOptions(prev => prev.map(o => o.id === id ? { ...o, copies: Math.max(1, o.copies + d) } : o));
  };

  const navigateToReceipt = async (method: string) => {
    try{
      const detailed = selectedRequests.map(name => {
        const opt = requestOptions.find(o => o.name === name);
        return opt ? { id: opt.id, label: opt.name, price: opt.fee, copies: opt.copies, purpose: opt.purpose, sub_question: opt.sub_questions } : null;
      });
      const sendData = {
        requests: detailed,
        total: totalAmount,
        totalProcessingDays: totalDays, 
        paymentMethod: method, 
        requestedDate: selectedDate, 
        arrival: selectedTimeDate,
        userName: `${user?.firstname} ${user?.lastname}`, p_id: user?.patient_id, transactionId: `REF-${Date.now()}`
      };
      const response = await fetch(`${API_BASE_URL}/receipt_store`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(sendData),
      });

      if (!response.ok) throw new Error("Failed to store receipt");
      navigate("/receipt", { state: sendData });
    } catch (error) {
      alert("Error processing payment.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* 1. Date Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Select Date Admitted</h2>
            <p className="text-sm text-gray-500 mb-6">Please select an admission date to view available requests.</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {requestDateList.length > 0 ? (
                requestDateList.map((item, index) => (
                    <button key={index} onClick={() => handleDateSelection(item)} className="w-full text-left px-4 py-4 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-gray-700">{item.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-xs text-indigo-600 font-black uppercase tracking-wider">{item.time}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-gray-300">→</div>
                    </button>
                ))
              ) : (
                <p className="text-center py-10 text-gray-400">No records found.</p>
              )}
            </div>
            {!isDateSelected && (
                 <button onClick={() => navigate(-1)} className="mt-4 w-full text-gray-400 text-xs font-bold uppercase tracking-widest">Back to Profile</button>
            )}
          </div>
        </div>
      )}

      {/* 2. Info Modal */}
      {isInfoModalOpen && infoModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-indigo-600 p-5 text-white font-bold uppercase">{activeRequest?.name} Information</div>
            
            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
              
              {/* Patient Information Section (Always Top) */}
              <div className="border-b-2 border-indigo-100 pb-4">
                <h3 className="text-indigo-600 font-black text-xs uppercase mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Added: Logged-in User Name */}
                  <div className="col-span-2 bg-indigo-50 p-2 rounded-lg mb-2">
                    <p className="text-[10px] text-indigo-400 uppercase font-bold">Authenticated Patient</p>
                    <p className="text-sm font-black text-indigo-900">
                      {user ? `${user.firstname} ${user.middlename} ${user.lastname}` : "Guest User"}
                    </p>
                  </div>

                  {/* Render dynamic patient fields from API if they exist */}
                  {infoModalData["Patient Information"] && 
                    Object.entries(infoModalData["Patient Information"]).map(([key, val]: [string, any]) => (
                      <div key={key}>
                        <p className="text-[10px] text-gray-400 uppercase">{key}</p>
                        <p className="text-sm font-semibold">{val || "---"}</p>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Render remaining sections (excluding Patient Information) */}
              {Object.entries(infoModalData)
                .filter(([section]) => section !== "Patient Information")
                .map(([section, fields]: [string, any]) => (
                  <div key={section} className="border-b pb-4 last:border-0">
                    <h3 className="text-indigo-600 font-black text-xs uppercase mb-2">{section}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(fields).map(([key, val]: [string, any]) => (
                        <div key={key}>
                          <p className="text-[10px] text-gray-400 uppercase">{key}</p>
                          <p className="text-sm font-semibold">{val || "---"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 flex gap-3">
              <button onClick={() => setIsInfoModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold uppercase text-xs">Cancel</button>
              <button onClick={() => activeRequest && processRequestStep({...activeRequest, url: undefined})} className="flex-[2] py-3 bg-indigo-600 text-white font-black rounded-xl uppercase">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Options/Purpose Modal */}
      {isOptionsModalOpen && activeRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Select Purpose</h2>
            <div className="space-y-2">
              {activeRequest.sub_options.map((opt) => (
                <button key={opt.id} onClick={() => handlePurposeSelection(opt.name)} className="w-full text-left px-4 py-3 border rounded-lg hover:bg-indigo-50 transition-all font-medium">{opt.name}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Additional Details Modal */}
      {isQuestionsModalOpen && activeRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Additional Details</h2>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {activeRequest.sub_questions?.map((q, index) => (
                <div key={`${activeRequest.id}-q-${index}`}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{q.question}</label>
                  <input 
                    type="text" 
                    value={q.answer || ""} 
                    onChange={(e) => handleAnswerChange(activeRequest.name, index, e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 bg-white" 
                    placeholder="Enter details..." 
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-xl">
              <label className="flex gap-3 cursor-pointer">
                <input type="checkbox" checked={hasAgreedToTerms} onChange={(e) => setHasAgreedToTerms(e.target.checked)} />
                <span className="text-[11px] text-amber-900 font-medium">I certify that all information provided is accurate.</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsQuestionsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">Back</button>
              <button onClick={() => addRequest(activeRequest.name)} disabled={!hasAgreedToTerms} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN UI */}
      {isDateSelected ? (
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-8">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Requesting records for admission:</span>
              <p className="text-sm font-bold text-gray-800 flex items-center justify-center gap-2">
                {selectedDate}
                <button onClick={() => setIsDateModalOpen(true)} className="text-indigo-400 text-[10px] underline hover:text-indigo-600">Change</button>
              </p>
          </div>
          
          <h1 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter text-gray-900">Document Request Center</h1>
          
          <div className="space-y-4">
            {requestOptions.map((option) => (
              <div key={option.id} onClick={() => handleCheckboxChange(option.name)} 
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between
                  ${selectedRequests.includes(option.name) ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-50' : 'border-white bg-white/60 hover:border-indigo-100'}`}>
                <div className="flex-1">
                  <span className={`text-lg font-bold block ${selectedRequests.includes(option.name) ? 'text-indigo-700' : 'text-gray-700'}`}>{option.name}</span>
                  <span className="text-sm font-semibold text-indigo-500">₱{option.fee.toFixed(2)} / copy</span>
                  {selectedRequests.includes(option.name) && option.purpose && <span className="text-[10px] uppercase font-black text-indigo-400 block mt-1 italic tracking-widest">{option.purpose}</span>}
                </div>
                {selectedRequests.includes(option.name) && (
                  <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl mr-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleCopyChange(option.id, -1)} className="w-8 h-8 flex bg-white rounded-lg shadow-sm font-bold items-center justify-center">-</button>
                      <span className="font-black text-indigo-600">{option.copies}</span>
                      <button onClick={() => handleCopyChange(option.id, 1)} className="w-8 h-8 flex bg-white rounded-lg shadow-sm font-bold items-center justify-center">+</button>
                  </div>
                )}
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${selectedRequests.includes(option.name) ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-white border-gray-200'}`}>
                  {selectedRequests.includes(option.name) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setIsSummaryModalOpen(true)} disabled={selectedRequests.length === 0} className="w-full mt-10 px-6 py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-2xl disabled:opacity-50 transition-transform active:scale-95">
             PROCEED (₱{totalAmount.toFixed(2)})
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 opacity-50">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">Awaiting Date Selection...</p>
        </div>
      )}

      {/* 6. Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[55] p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Request</h2>
            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto">
              {selectedRequests.map((name) => {
                const item = requestOptions.find(r => r.name === name);
                return (
                  <div key={name} className="p-4 bg-slate-50 rounded-xl border flex justify-between items-center">
                    <div>
                        <p className="font-bold">{name}</p>
                        <p className="text-[11px] text-indigo-600 font-bold uppercase">⏱️ {item?.days} Days</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black">x{item?.copies}</p>
                        <p className="text-[10px] text-gray-400">₱{(item ? item.fee * item.copies : 0).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-indigo-600 rounded-xl p-4 mb-6 text-white">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-black">₱{totalAmount.toFixed(2)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-indigo-400/50 flex flex-col items-center">
                  <p className="text-[10px] uppercase font-bold opacity-80 mb-1">Processing Status</p>
                  {totalDays === 0 ? (
                    <span className="text-xs font-black bg-white/20 px-3 py-1.5 rounded-lg text-center w-full">
                      {new Date().getHours() < 15 ? "Available within the day" : "Available the following working day"}
                    </span>
                  ) : (
                    <span className="text-xs font-black bg-white/20 px-3 py-1.5 rounded-full">Max {totalDays} Working Days</span>
                  )}
                </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsSummaryModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold bg-gray-100 rounded-xl uppercase text-xs">Back</button>
              <button onClick={() => { setIsSummaryModalOpen(false); setIsSubmitModalOpen(true); }} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl uppercase text-xs">Proceed to Pay</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Payment Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <h2 className="text-2xl font-black mb-1 text-gray-800 uppercase">Payment Method</h2>
            <div className="bg-indigo-50 rounded-2xl p-5 my-6 border border-indigo-100 text-center">
              <p className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.2em] mb-1">Total Due</p>
              <p className="text-4xl font-black text-indigo-700">₱{totalAmount.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigateToReceipt("Online")} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl">Online Payment</button>
              <button onClick={() => navigateToReceipt("Hospital Cashier")} className="w-full py-4 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-2xl">Hospital Cashier</button>
            </div>
            <button onClick={() => { setIsSubmitModalOpen(false); setIsSummaryModalOpen(true); }} className="mt-6 text-xs font-bold text-gray-400 uppercase">← Back</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestPage;