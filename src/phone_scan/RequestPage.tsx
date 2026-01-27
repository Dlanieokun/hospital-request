import { useEffect, useState, type ChangeEvent, useMemo } from "react";
import { useNavigate } from 'react-router-dom';

// --- CONFIGURATION ---
const API_BASE_URL = "http://127.0.0.1:8000/api";

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
  days: string | number; // FIX: API sends numbers (1, 0), so we allow both
  fee: number;
  sub_options: SubOption[];
  sub_questions?: SubQuestion[];
  purpose?: string;
  copies: number; 
}

interface UserData {
  firstname: string;
  lastname: string;
  patient_id?: number;
}

interface RequestDate {
  date: Date;
  time: Time;
}

function RequestPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState<boolean>(false);
  const [activeRequest, setActiveRequest] = useState<RequestOption | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState<boolean>(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeDate, setSelectedTimeDate] = useState<RequestDate | null>(null);
  const [requestOptions, setRequestOptions] = useState<RequestOption[]>([]);
  const [requestDateList, setRequestDateList] = useState<RequestDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingDates, setIsFetchingDates] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean>(false);

  // --- USEMEMO CALCULATIONS ---
  const totalAmount = useMemo(() => {
    return selectedRequests.reduce((sum, name) => {
      const item = requestOptions.find(r => r.name === name);
      return sum + (item ? (item.fee * item.copies) : 0);
    }, 0);
  }, [selectedRequests, requestOptions]);

  /** * FIXED: This was where the crash occurred. 
   * We now force 'days' to a string before using .replace()
   */
  const maxProcessingDays = useMemo(() => {
    const dayValues = selectedRequests.map(name => {
      const item = requestOptions.find(r => r.name === name);
      if (!item || item.days === undefined || item.days === null) return 0;
      
      // Convert to string safely to handle numbers (like 1 or 0)
      const dayString = String(item.days);
      const numericDays = parseInt(dayString.replace(/[^0-9]/g, ''), 10);
      
      return isNaN(numericDays) ? 0 : numericDays;
    });
    
    return dayValues.length > 0 ? Math.max(0, ...dayValues) : 0;
  }, [selectedRequests, requestOptions]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/request`);
        if (!response.ok) throw new Error("Failed to fetch requests");
        const data: RequestOption[] = await response.json();
        
        // Initialize copies for each option
        const initializedData = data.map(item => ({
            ...item,
            copies: 1
        }));
        
        setRequestOptions(initializedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    const storedUser = sessionStorage.getItem("qrCodeDataJson");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Invalid JSON in sessionStorage:", e);
      }
    }
  }, []);

  const handleCopyChange = (id: number, delta: number) => {
    setRequestOptions(prev => prev.map(opt => {
      if (opt.id === id) {
        const newCount = Math.max(1, opt.copies + delta);
        return { ...opt, copies: newCount };
      }
      return opt;
    }));
  };

  const handleProceed = async () => {
    if (!user?.patient_id) {
      alert("No patient ID found. Please scan again.");
      return;
    }

    try {
      setIsFetchingDates(true);
      const response = await fetch(`${API_BASE_URL}/patient_date/${user.patient_id}`);
      if (!response.ok) throw new Error("Failed to fetch available dates");
      const data = await response.json();
      
      const formattedDates: RequestDate[] = data.map((item: { date: string, time: string }) => ({
        date: new Date(item.date),
        time: item.time
      }));
      
      setRequestDateList(formattedDates);
      setIsDateModalOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not load dates");
    } finally {
      setIsFetchingDates(false);
    }
  };

  const handleAnswerChange = (requestName: string, questionIndex: number, value: string) => {
    setRequestOptions(prevOptions =>
      prevOptions.map(opt => {
        if (opt.name === requestName) {
          const newQuestions = [...(opt.sub_questions || [])];
          newQuestions[questionIndex] = { ...newQuestions[questionIndex], answer: value };
          const updatedOpt = { ...opt, sub_questions: newQuestions };
          if (activeRequest?.name === requestName) setActiveRequest(updatedOpt);
          return updatedOpt;
        }
        return opt;
      })
    );
  };

  const handleCheckboxChange = (requestName: string) => {
    if (selectedRequests.includes(requestName)) {
      setSelectedRequests(prev => prev.filter(item => item !== requestName));
    } else {
      const request = requestOptions.find(r => r.name === requestName);
      if (!request) return;
      setActiveRequest(request);
      if (request.sub_options && request.sub_options.length > 0) {
        setIsOptionsModalOpen(true);
      } else if (request.sub_questions && request.sub_questions.length > 0) {
        setIsQuestionsModalOpen(true);
      } else {
        addRequest(request.name);
      }
    }
  };

  const handlePurposeSelection = (purposeName: string) => {
    if (!activeRequest) return;
    setRequestOptions(prev => prev.map(opt =>
      opt.id === activeRequest.id ? { ...opt, purpose: purposeName } : opt
    ));
    if (activeRequest.sub_questions && activeRequest.sub_questions.length > 0) {
      setIsOptionsModalOpen(false);
      setIsQuestionsModalOpen(true);
    } else {
      addRequest(activeRequest.name);
      setIsOptionsModalOpen(false);
    }
  };

  const addRequest = (name: string) => {
    if (!selectedRequests.includes(name)) setSelectedRequests(prev => [...prev, name]);
  };

  const confirmQuestions = () => {
    if (activeRequest) addRequest(activeRequest.name);
    setIsQuestionsModalOpen(false);
    setHasAgreedToTerms(false); 
    setActiveRequest(null);
  };

  const handleDateSelection = (item: RequestDate) => {
    const dateFormatted = item.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setSelectedDate(`${dateFormatted} at ${item.time}`);
    setSelectedTimeDate(item);
    setIsDateModalOpen(false);
    setIsSummaryModalOpen(true);
  };

  const handleExit = () => {
    sessionStorage.removeItem("qrCodeDataJson");
    navigate('/scanner');
  };

  const navigateToReceipt = async (method: string) => {
    try {
      const detailedRequests = selectedRequests.map(name => {
        const opt = requestOptions.find(o => o.name === name);
        if (!opt) return null;
        const filteredSubOptions = Array.isArray(opt.sub_options)
          ? opt.sub_options.filter(sub => sub.name === opt.purpose)
          : [];
        return {
          id: opt.id,
          label: opt.name,
          price: opt.fee,
          copies: opt.copies, 
          purpose: opt.purpose,
          sub_option: filteredSubOptions,
          sub_question: opt.sub_questions
        };
      });

      const transactionId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
      const sendData = {
        requests: detailedRequests,
        total: totalAmount,
        paymentMethod: method,
        requestedDate: selectedDate,
        arrival: selectedTimeDate,
        userName: user ? `${user.firstname} ${user.lastname}` : "Guest",
        p_id: user ? `${user.patient_id}` : "None",
        transactionId: transactionId,
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

  if (loading) return <div className="flex items-center justify-center min-h-screen font-bold text-indigo-600">Loading Options...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      
      {/* 1. Purpose Modal */}
      {isOptionsModalOpen && activeRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Purpose for {activeRequest.name}</h2>
            <div className="space-y-2">
              {activeRequest.sub_options.map((opt) => (
                <button 
                  key={opt.id} 
                  onClick={() => handlePurposeSelection(opt.name)} 
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                >
                  {opt.name}
                </button>
              ))}
            </div>
            <button onClick={() => { setIsOptionsModalOpen(false); setActiveRequest(null); }} className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* 2. Additional Questions Modal */}
      {isQuestionsModalOpen && activeRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Additional Information</h2>
            <p className="text-sm text-gray-500 mb-6 italic">Required for {activeRequest.name}</p>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {activeRequest.sub_questions?.map((q, index) => (
                <div key={q.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{q.question}</label>
                  <input 
                    type={q.type} 
                    value={q.answer || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleAnswerChange(activeRequest.name, index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <label className="flex gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasAgreedToTerms}
                  onChange={(e) => setHasAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-amber-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] leading-tight text-amber-900 font-medium">
                  The user certifies that all electronically submitted data is accurate and correct. I understand that any false information may void this request.
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { 
                    setIsQuestionsModalOpen(false); 
                    setHasAgreedToTerms(false);
                    if (activeRequest.sub_options.length > 0) setIsOptionsModalOpen(true); 
                }} 
                className="flex-1 px-4 py-3 text-gray-500 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button 
                onClick={confirmQuestions} 
                disabled={!hasAgreedToTerms}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Date & Time Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Select Available Date Admitted</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {requestDateList.length > 0 ? (
                requestDateList.map((item, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleDateSelection(item)} 
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all flex justify-between items-center"
                  >
                    <div>
                        <p className="font-medium text-gray-700">
                            {item.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-indigo-600 font-bold">{item.time}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No scheduled dates found.</p>
              )}
            </div>
            <button onClick={() => setIsDateModalOpen(false)} className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* 4. Request Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[55] p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Review Request</h2>
            </div>
            
            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {selectedRequests.map((name) => {
                const item = requestOptions.find(r => r.name === name);
                return (
                  <div key={name} className="p-4 bg-slate-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{name}</p>
                      <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mt-1">
                        ⏱️ Processing: {item?.days} Days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-700">x{item?.copies}</p>
                      <p className="text-[10px] text-gray-400">₱{(item ? item.fee * item.copies : 0).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-indigo-600 rounded-xl p-4 mb-6 text-white shadow-lg shadow-indigo-100">
               <div className="flex justify-between items-start mb-1">
                  <span className="text-indigo-100 text-xs font-bold uppercase">Estimated Wait</span>
                  <div className="text-right">
                    {maxProcessingDays === 0 ? (
                      <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-lg block">
                        {new Date().getHours() < 15 
                          ? "Available after 24 hours" 
                          : "Available after 48 hours"}
                      </span>
                    ) : (
                      <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full">
                        {maxProcessingDays} Days Max
                      </span>
                    )}
                  </div>
               </div>

               <div className="flex justify-between items-center mt-3">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-black">₱{totalAmount.toFixed(2)}</span>
               </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setIsSummaryModalOpen(false); setIsDateModalOpen(true); }} 
                className="flex-1 py-4 text-gray-500 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition uppercase text-xs tracking-widest"
              >
                Change Date
              </button>
              <button 
                onClick={() => { setIsSummaryModalOpen(false); setIsSubmitModalOpen(true); }} 
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition uppercase text-xs tracking-widest"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Payment Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 text-center border border-white/20">
            <div className="mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black mb-1 text-gray-800 uppercase tracking-tight">Payment Method</h2>
              <p className="text-sm text-gray-500 italic">Select how you'd like to pay for your request</p>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100">
              <p className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.2em] mb-1">Total Amount Due</p>
              <p className="text-4xl font-black text-indigo-700">₱{totalAmount.toFixed(2)}</p>
              <div className="mt-3 pt-3 border-t border-indigo-200/50">
                <p className="text-[11px] text-indigo-500 font-medium">Scheduled: {selectedDate}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigateToReceipt("Online")} 
                className="group relative w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>Online Payment</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
              </button>

              <button 
                onClick={() => navigateToReceipt("Clerk")} 
                className="w-full py-4 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                Over the Counter
              </button>
            </div>

            <button 
              onClick={() => { setIsSubmitModalOpen(false); setIsSummaryModalOpen(true); }} 
              className="mt-6 text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              ← Go Back to Summary
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-0 right-0 p-6 text-gray-500 italic text-sm">
        Logged in as: <span className="font-bold text-gray-800">{user ? `${user.firstname} ${user.lastname}` : "Guest"}</span>
      </div>

      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-black mb-8 text-gray-900 text-center uppercase tracking-tighter">Document Request Center</h1>
        <div className="grid grid-cols-1 gap-4">
          {requestOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleCheckboxChange(option.name)}
              className={`p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between
                ${selectedRequests.includes(option.name) ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-white bg-white/60 hover:border-indigo-100'}
              `}
            >
              <div className="flex-1">
                <span className={`text-lg font-bold block ${selectedRequests.includes(option.name) ? 'text-indigo-700' : 'text-gray-700'}`}>{option.name}</span>
                <span className="text-sm font-semibold text-indigo-500">₱{option.fee.toFixed(2)} / copy</span>
                {selectedRequests.includes(option.name) && option.purpose && (
                   <span className="text-[10px] uppercase font-black text-indigo-400 block mt-1 italic tracking-widest">{option.purpose}</span>
                )}
              </div>

              {selectedRequests.includes(option.name) && (
                <div 
                    className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl mr-4" 
                    onClick={(e) => e.stopPropagation()} 
                >
                    <button 
                        onClick={() => handleCopyChange(option.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                    >
                        -
                    </button>
                    <div className="flex flex-col items-center min-w-[30px]">
                        <span className="text-[10px] text-gray-400 font-bold uppercase leading-none">Qty</span>
                        <span className="font-black text-indigo-600 leading-none">{option.copies}</span>
                    </div>
                    <button 
                        onClick={() => handleCopyChange(option.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-gray-600 hover:bg-green-50 hover:text-green-600 transition"
                    >
                        +
                    </button>
                </div>
              )}

              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${selectedRequests.includes(option.name) ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-white border-gray-200'}`}>
                {selectedRequests.includes(option.name) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="w-full mt-10 px-6 py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-50"
          disabled={selectedRequests.length === 0 || isFetchingDates}
          onClick={handleProceed}
        >
          {isFetchingDates ? "CHECKING DATES..." : `PROCEED (₱${totalAmount.toFixed(2)})`}
        </button>
      </div>

      <button onClick={handleExit} className="absolute bottom-6 right-6 font-bold text-red-500 hover:text-red-700 uppercase tracking-widest text-xs">Exit Application</button>
    </div>
  );
}

export default RequestPage;