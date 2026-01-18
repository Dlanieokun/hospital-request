import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 

function RequestPage() {
  const [user, setUser] = useState(null);
  const [selectedRequests, setSelectedRequests] = useState([]);
  
  // Modal states
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  
  // NEW: Request Date Modal States
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const navigate = useNavigate(); 

  // --- DATA ARRAYS ---
  const [requestOptions, setRequestOptions] = useState([
    { 
      label: "Medical Certificate", 
      name: "Medical Certificate", 
      days: "3", 
      price: 100, 
      subOptions: [], 
      subQuestion: [
        { question: 'Father Name', type: 'text', answer: '' }, 
        { question: 'Father bday', type: 'date', answer: '' }, 
        { question: 'Father Citizenship', type: 'text', answer: '' }
      ] 
    },
    { label: "Death Certificate", name: "Death Certificate", days: "4", price: 150, subOptions: ["Original Copy", "Certified True Copy"] },
    { label: "Birth Certificate", name: "Birth Certificate", days: "1", price: 200, subOptions: ["Newborn", "Late Registration"] },
    { label: "Other Request", name: "Other Request", days: "4", price: 50, subOptions: [] },
  ]);
  
  const [requestDate, setRequestDate] = useState([
    { date: "01/23/2024" },
    { date: "04/03/2024" },
  ]);

  const totalAmount = selectedRequests.reduce((sum, requestName) => {
    const item = requestOptions.find(r => r.name === requestName);
    return sum + (item ? item.price : 0);
  }, 0);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("qrCodeDataJson");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid JSON in sessionStorage:", error);
      }
    }
  }, []);

  const handleAnswerChange = (requestName, questionIndex, value) => {
    setRequestOptions(prevOptions => 
      prevOptions.map(opt => {
        if (opt.name === requestName) {
          const newQuestions = [...(opt.subQuestion || [])];
          newQuestions[questionIndex] = { ...newQuestions[questionIndex], answer: value };
          return { ...opt, subQuestion: newQuestions };
        }
        return opt;
      })
    );
  };

  const handleCheckboxChange = (requestName) => {
    if (selectedRequests.includes(requestName)) {
      setSelectedRequests(prev => prev.filter(item => item !== requestName));
    } else {
      const request = requestOptions.find(r => r.name === requestName);
      setActiveRequest(request);

      if (request.subOptions && request.subOptions.length > 0) {
        setIsOptionsModalOpen(true);
      } else if (request.subQuestion && request.subQuestion.length > 0) {
        setIsQuestionsModalOpen(true);
      } else {
        addRequest(request.name);
      }
    }
  };

  const handlePurposeSelection = () => {
    if (activeRequest?.subQuestion && activeRequest.subQuestion.length > 0) {
      setIsOptionsModalOpen(false);
      setIsQuestionsModalOpen(true);
    } else {
      addRequest(activeRequest.name);
      setIsOptionsModalOpen(false);
    }
  };

  const addRequest = (name) => {
    if (!selectedRequests.includes(name)) {
      setSelectedRequests(prev => [...prev, name]);
    }
  };

  const confirmQuestions = () => {
    addRequest(activeRequest.name);
    setIsQuestionsModalOpen(false);
  };

  // NEW: Logic to handle date selection and proceed to payment
  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setIsDateModalOpen(false);
    setIsSubmitModalOpen(true); // Open payment modal after date is picked
  };

  const handleExit = () => {
    sessionStorage.removeItem("qrCodeDataJson");
    navigate('/scanner'); 
  };

  const navigateToReceipt = (method) => {
    const detailedRequests = selectedRequests.map(name => 
      requestOptions.find(opt => opt.name === name)
    );
    navigate('/receipt', { 
      state: { 
        requests: detailedRequests, 
        total: totalAmount,
        paymentMethod: method,
        requestedDate: selectedDate, // Passing the selected date to receipt
        userName: user ? `${user.firstname} ${user.lastname}` : "Guest"
      } 
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      
      {/* 1. Purpose Modal */}
      {isOptionsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Purpose for {activeRequest?.label}</h2>
            <div className="space-y-2">
              {activeRequest?.subOptions.map((opt) => (
                <button 
                  key={opt} 
                  onClick={handlePurposeSelection} 
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setIsOptionsModalOpen(false)} className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* 2. Additional Questions Modal */}
      {isQuestionsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Additional Information</h2>
            <p className="text-sm text-gray-500 mb-6 italic">Required for {activeRequest?.label}</p>
            <div className="space-y-4">
              {requestOptions.find(r => r.name === activeRequest?.name)?.subQuestion?.map((q, index) => (
                <div key={index}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{q.question}</label>
                  <input 
                    type={q.type} 
                    value={q.answer}
                    onChange={(e) => handleAnswerChange(activeRequest.name, index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setIsQuestionsModalOpen(false); if (activeRequest?.subOptions?.length > 0) setIsOptionsModalOpen(true); }} className="flex-1 px-4 py-3 text-gray-500 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition">Back</button>
              <button onClick={confirmQuestions} className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: 2.5 Request Date Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Select Request Date</h2>
            <p className="text-sm text-gray-500 mb-4">Please choose a preferred schedule:</p>
            <div className="space-y-2">
              {requestDate.map((item, index) => (
                <button 
                  key={index} 
                  onClick={() => handleDateSelection(item.date)} 
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all flex justify-between items-center"
                >
                  <span className="font-medium text-gray-700">{item.date}</span>
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
            <button onClick={() => setIsDateModalOpen(false)} className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* 3. Payment Selection Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Payment Method</h2>
            <div className="bg-gray-50 rounded-xl p-4 mb-2 border border-gray-100">
              <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Total Amount</p>
              <p className="text-3xl font-black text-indigo-600">₱{totalAmount.toFixed(2)}</p>
            </div>
            <p className="text-xs text-gray-400 mb-6 italic">Scheduled Date: {selectedDate}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigateToReceipt("Online")} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Pay Online</button>
              <button onClick={() => navigateToReceipt("Clerk")} className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 transition">Pay in Clerk</button>
            </div>
            <button onClick={() => setIsSubmitModalOpen(false)} className="mt-6 text-sm text-gray-400 hover:text-gray-600">Go Back</button>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="absolute top-0 right-0 p-6 text-gray-500 italic text-sm">
        Logged in as: <span className="font-bold text-gray-800">{user ? `${user.firstname} ${user.lastname}` : "Guest"}</span>
      </div>

      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-black mb-8 text-gray-900 text-center uppercase tracking-tighter">Document Request Center</h1>
        <div className="grid grid-cols-1 gap-4">
          {requestOptions.map((option) => (
            <div
              key={option.name}
              onClick={() => handleCheckboxChange(option.name)}
              className={`p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between
                ${selectedRequests.includes(option.name) ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-white bg-white/60 hover:border-indigo-100'}
              `}
            >
              <div>
                <span className={`text-lg font-bold block ${selectedRequests.includes(option.name) ? 'text-indigo-700' : 'text-gray-700'}`}>{option.label}</span>
                <span className="text-sm font-semibold text-indigo-500">₱{option.price.toFixed(2)}</span>
              </div>
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${selectedRequests.includes(option.name) ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-white border-gray-200'}`}>
                {selectedRequests.includes(option.name) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="w-full mt-10 px-6 py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-20"
          disabled={selectedRequests.length === 0}
          onClick={() => setIsDateModalOpen(true)} // Changed: Go to Date selection first
        >
          PROCEED (₱{totalAmount.toFixed(2)})
        </button>
      </div>

      <button onClick={handleExit} className="absolute bottom-6 right-6 font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest text-xs">Exit Application</button>
    </div>
  );
}

export default RequestPage;