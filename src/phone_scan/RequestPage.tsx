import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom';

// --- TYPES & INTERFACES ---
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
  days: string;
  fee: number;
  sub_options: SubOption[];
  sub_questions?: SubQuestion[];
  purpose?: string;
}

interface UserData {
  firstname: string;
  lastname: string;
  patient_id?: number;
}

interface RequestDate {
  date: Date;
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
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<string>("");

  const [requestOptions, setRequestOptions] = useState<RequestOption[]>([]);
  const [requestDateList, setRequestDateList] = useState<RequestDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingDates, setIsFetchingDates] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/api/request");
        if (!response.ok) throw new Error("Failed to fetch requests");
        const data: RequestOption[] = await response.json();
        setRequestOptions(data);
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

  const handleProceed = async () => {
    if (!user?.patient_id) {
      alert("No patient ID found. Please scan again.");
      return;
    }

    try {
      setIsFetchingDates(true);
      const response = await fetch(`http://127.0.0.1:8000/api/patient_date/${user.patient_id}`);
      if (!response.ok) throw new Error("Failed to fetch available dates");
      const data = await response.json();
      const formattedDates: RequestDate[] = data.map((item: { date: string }) => ({
        date: new Date(item.date)
      }));
      setRequestDateList(formattedDates);
      setIsDateModalOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not load dates");
    } finally {
      setIsFetchingDates(false);
    }
  };

  const totalAmount = selectedRequests.reduce((sum, name) => {
    const item = requestOptions.find(r => r.name === name);
    return sum + (item ? item.fee : 0);
  }, 0);

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
    setActiveRequest(null);
  };

  const handleDateSelection = (date: Date) => {
    setSelectedDate(date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    setIsDateModalOpen(false);
    setIsSubmitModalOpen(true);
  };

  const handleExit = () => {
    sessionStorage.removeItem("qrCodeDataJson");
    navigate('/scanner');
  };

  const navigateToReceipt = async (method: string) => {
    try {
      // Data Transformation to match ReceiptPage expectations
      const detailedRequests = selectedRequests
        .map(name => {
          const opt = requestOptions.find(o => o.name === name);
          if (!opt) return null;
          return {
            id: opt.id,
            label: opt.name,
            price: opt.fee,
            purpose: opt.purpose,
            sub_option: opt.sub_options,
            sub_question: opt.sub_questions
          };
        })
        .filter((item) => item !== null);

      const transactionId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
      console.log(requestOptions);
      console.log("===========================================");
      console.log(selectedRequests);
      console.log("===========================================");
      console.log(detailedRequests);


      const sendData = {
        requests: detailedRequests,
        total: totalAmount,
        paymentMethod: method,
        requestedDate: selectedDate,
        userName: user ? `${user.firstname} ${user.lastname}` : "Guest",
        p_id: user ? `${user.patient_id}` : "None",
        transactionId: transactionId,
      };

      const response = await fetch("http://127.0.0.1:8000/api/receipt_store", {
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

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Options...</div>;
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
            <div className="space-y-4">
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
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => { setIsQuestionsModalOpen(false); if (activeRequest.sub_options.length > 0) setIsOptionsModalOpen(true); }} 
                className="flex-1 px-4 py-3 text-gray-500 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button onClick={confirmQuestions} className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Date Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Select Available Date</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {requestDateList.length > 0 ? (
                requestDateList.map((item, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleDateSelection(item.date)} 
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all flex justify-between items-center"
                  >
                    <span className="font-medium text-gray-700">{item.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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

      {/* 4. Payment Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Payment Method</h2>
            <div className="bg-gray-50 rounded-xl p-4 mb-2 border border-gray-100">
              <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Total Amount</p>
              <p className="text-3xl font-black text-indigo-600">₱{totalAmount.toFixed(2)}</p>
            </div>
            <p className="text-xs text-gray-400 mb-6 italic">Scheduled Date: {selectedDate}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigateToReceipt("Online")} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Pay Online</button>
              <button onClick={() => navigateToReceipt("Clerk")} className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 transition">Pay in Clerk</button>
            </div>
            <button onClick={() => setIsSubmitModalOpen(false)} className="mt-6 text-sm text-gray-400 hover:text-gray-600">Go Back</button>
          </div>
        </div>
      )}

      {/* Header Info */}
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
              <div>
                <span className={`text-lg font-bold block ${selectedRequests.includes(option.name) ? 'text-indigo-700' : 'text-gray-700'}`}>{option.name}</span>
                <span className="text-sm font-semibold text-indigo-500">₱{option.fee.toFixed(2)}</span>
                {selectedRequests.includes(option.name) && option.purpose && (
                   <span className="text-[10px] uppercase font-black text-indigo-400 block mt-1 italic tracking-widest">{option.purpose}</span>
                )}
              </div>
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