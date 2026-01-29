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
  days: string | number; 
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

// Updated to match your JSON data structure
interface RequestDate {
  date: string;
  time: string;
  case_id: number;
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
  const [error, setError] = useState<string | null>(null);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean>(false);
  
  // Logic flag to hide request list until a date is chosen
  const [isInitialDateSelected, setIsInitialDateSelected] = useState<boolean>(false);

  // --- CALCULATIONS ---
  const totalAmount = useMemo(() => {
    return selectedRequests.reduce((sum, name) => {
      const item = requestOptions.find(r => r.name === name);
      return sum + (item ? (item.fee * item.copies) : 0);
    }, 0);
  }, [selectedRequests, requestOptions]);

  const maxProcessingDays = useMemo(() => {
    const dayValues = selectedRequests.map(name => {
      const item = requestOptions.find(r => r.name === name);
      if (!item || item.days === undefined || item.days === null) return 0;
      const dayString = String(item.days);
      const numericDays = parseInt(dayString.replace(/[^0-9]/g, ''), 10);
      return isNaN(numericDays) ? 0 : numericDays;
    });
    return dayValues.length > 0 ? Math.max(0, ...dayValues) : 0;
  }, [selectedRequests, requestOptions]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const reqResponse = await fetch(`${API_BASE_URL}/request`);
        if (!reqResponse.ok) throw new Error("Failed to fetch requests");
        const reqData: RequestOption[] = await reqResponse.json();
        setRequestOptions(reqData.map(item => ({ ...item, copies: 1 })));

        const storedUser = sessionStorage.getItem("qrCodeDataJson");
        if (storedUser) {
          const parsedUser: UserData = JSON.parse(storedUser);
          setUser(parsedUser);
          if (parsedUser.patient_id) {
            const dateResponse = await fetch(`${API_BASE_URL}/patient_date/${parsedUser.patient_id}`);
            if (!dateResponse.ok) throw new Error("Failed to fetch dates");
            const dateData: RequestDate[] = await dateResponse.json();
            setRequestDateList(dateData);
            setIsDateModalOpen(true); // Show modal immediately
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Initialization error");
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // --- HANDLERS ---
  const handleDateSelection = (item: RequestDate) => {
    const dateFormatted = new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setSelectedDate(`${dateFormatted} at ${item.time}`);
    setSelectedTimeDate(item); // Stores {date, time, case_id} for the 'arrival' prop
    setIsDateModalOpen(false);
    setIsInitialDateSelected(true);
  };

  const handleCheckboxChange = (requestName: string) => {
    if (selectedRequests.includes(requestName)) {
      setSelectedRequests(prev => prev.filter(item => item !== requestName));
    } else {
      const request = requestOptions.find(r => r.name === requestName);
      if (!request) return;
      setActiveRequest(request);
      if (request.sub_options?.length > 0) setIsOptionsModalOpen(true);
      else if (request.sub_questions?.length > 0) setIsQuestionsModalOpen(true);
      else addRequest(request.name);
    }
  };

  const addRequest = (name: string) => {
    if (!selectedRequests.includes(name)) setSelectedRequests(prev => [...prev, name]);
  };

  const handleCopyChange = (id: number, delta: number) => {
    setRequestOptions(prev => prev.map(opt => opt.id === id ? { ...opt, copies: Math.max(1, opt.copies + delta) } : opt));
  };

  const handleExit = () => {
    sessionStorage.removeItem("qrCodeDataJson");
    navigate('/scanner');
  };

  const navigateToReceipt = async (method: string) => {
    try {
      const detailedRequests = selectedRequests.map(name => {
        const opt = requestOptions.find(o => o.name === name);
        return opt ? { id: opt.id, label: opt.name, price: opt.fee, copies: opt.copies, purpose: opt.purpose, sub_question: opt.sub_questions } : null;
      });

      const sendData = {
        requests: detailedRequests,
        total: totalAmount,
        paymentMethod: method,
        requestedDate: selectedDate,
        arrival: selectedTimeDate, // Contains date, time, and case_id
        userName: user ? `${user.firstname} ${user.lastname}` : "Guest",
        p_id: user?.patient_id || "None",
        transactionId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      const response = await fetch(`${API_BASE_URL}/receipt_store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData),
      });

      if (!response.ok) throw new Error("Failed to store receipt");
      navigate("/receipt", { state: sendData });
    } catch (error) {
      alert("Error processing payment.");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen font-bold text-indigo-600 tracking-widest">LOADING RECORDS...</div>;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      
      {/* 1. Header (User Name) */}
      <div className="absolute top-0 right-0 p-6 text-gray-500 italic text-sm">
        Logged in as: <span className="font-bold text-gray-800">{user ? `${user.firstname} ${user.lastname}` : "Guest"}</span>
      </div>

      {/* 2. Date Selection Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Select Available Date Admitted</h2>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {requestDateList.map((item, index) => (
                <button 
                  key={index} 
                  onClick={() => handleDateSelection(item)} 
                  className="w-full text-left px-4 py-4 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all flex justify-between items-center group bg-slate-50"
                >
                  <div>
                    <p className="font-bold text-gray-700">{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs text-indigo-600 font-black">Time: {item.time}</p>
                    <p className="text-[10px] text-gray-400">Case ID: #{item.case_id}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
            {isInitialDateSelected && (
              <button onClick={() => setIsDateModalOpen(false)} className="mt-4 w-full text-gray-400 text-xs font-bold hover:text-gray-600 uppercase">Cancel</button>
            )}
          </div>
        </div>
      )}

      {/* Main UI */}
      {isInitialDateSelected ? (
        <div className="w-full max-w-xl animate-in fade-in duration-500">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Record</p>
            <button onClick={() => setIsDateModalOpen(true)} className="font-extrabold text-gray-800 hover:text-indigo-600 flex items-center gap-2 mx-auto">
              {selectedDate} <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded text-indigo-600">Change</span>
            </button>
          </div>

          <h1 className="text-3xl font-black mb-8 text-gray-900 text-center uppercase tracking-tighter">Document Request Center</h1>
          
          <div className="space-y-4">
            {requestOptions.map((option) => (
              <div key={option.id} onClick={() => handleCheckboxChange(option.name)} className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedRequests.includes(option.name) ? 'border-indigo-600 bg-white shadow-xl' : 'border-white bg-white/60 hover:border-indigo-100'}`}>
                <div>
                  <span className={`text-lg font-bold block ${selectedRequests.includes(option.name) ? 'text-indigo-700' : 'text-gray-700'}`}>{option.name}</span>
                  <span className="text-sm font-semibold text-indigo-500">₱{option.fee.toFixed(2)}</span>
                </div>
                {selectedRequests.includes(option.name) && (
                  <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl mr-4" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleCopyChange(option.id, -1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold text-gray-600">-</button>
                    <span className="font-black text-indigo-600">{option.copies}</span>
                    <button onClick={() => handleCopyChange(option.id, 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold text-gray-600">+</button>
                  </div>
                )}
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${selectedRequests.includes(option.name) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}>
                  {selectedRequests.includes(option.name) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setIsSummaryModalOpen(true)} disabled={selectedRequests.length === 0} className="w-full mt-10 px-6 py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
            PROCEED (₱{totalAmount.toFixed(2)})
          </button>
        </div>
      ) : (
        <div className="text-center py-20 animate-pulse"><p className="text-gray-400 font-bold uppercase tracking-widest">Waiting for selection...</p></div>
      )}

      {/* 3. Exit Application Button */}
      <button onClick={handleExit} className="absolute bottom-6 right-6 font-bold text-red-500 hover:text-red-700 uppercase tracking-widest text-xs transition-colors">Exit Application</button>

      {/* Remaining Modals (Summary/Payment/Questions) would be implemented here following the same structure */}
    </div>
  );
}

export default RequestPage;