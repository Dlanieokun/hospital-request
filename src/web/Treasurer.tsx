import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, X, CheckCircle, Loader2 } from 'lucide-react';

interface CollectionItem {
  id: number;
  reference: string;
  name: string;
  paid: number;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

const Treasurer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/receipts', { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (id: number) => {
    if (!window.confirm("Mark this receipt as Paid?")) return;

    setProcessingId(id);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/receipts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'paid' }),
      });

      if (response.ok) {
        setCollections(prev => 
          prev.map(item => item.id === id ? { ...item, status: 'paid' } : item)
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update payment.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Server connection error.");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const filteredCollections = collections.filter((item) => {
    const dateStr = item.created_at || "2026-01-01"; 
    return dateStr.startsWith(selectedYear) && 
           (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.reference.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const itemsPerPage = 5;
  const currentItems = filteredCollections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage) || 1;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Treasurer Collections</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-600">Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div className="relative flex-grow sm:w-64">
              <input
                type="text"
                placeholder="Search Reference or Name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            <button 
              onClick={() => setIsScannerModalOpen(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <ScanLine size={20}/>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">Loading records...</td></tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-700">{item.reference}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">₱{item.paid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-sm">
                      {/* VIEW BUTTON REMOVED FROM HERE */}
                      <button 
                        onClick={() => handlePayment(item.id)}
                        disabled={item.status.toLowerCase() === 'paid' || processingId === item.id}
                        className={`inline-flex items-center gap-1.5 font-bold px-4 py-1.5 rounded-lg transition-all ${
                          item.status.toLowerCase() === 'paid' 
                          ? 'text-emerald-500 bg-emerald-50 cursor-not-allowed border border-emerald-100' 
                          : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {processingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : item.status.toLowerCase() === 'paid' ? (
                          <><CheckCircle size={14}/> Paid</>
                        ) : (
                          'Pay Receipt'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400 italic">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500 font-medium">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-30 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-30 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Scanner Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 text-center relative border border-slate-100">
            <button onClick={() => setIsScannerModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"><X size={24}/></button>
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScanLine size={40} className="text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Ready to Scan</h3>
            <p className="text-slate-500 mb-6 text-xs uppercase tracking-widest font-bold">Hardware Listener Active</p>
            <form onSubmit={(e) => { e.preventDefault(); setIsScannerModalOpen(false); }}>
              <input 
                ref={scanInputRef} 
                type="text" 
                autoFocus 
                className="opacity-0 absolute" 
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => isScannerModalOpen && scanInputRef.current?.focus()} 
              />
              <div className="text-xs font-mono text-gray-400 bg-gray-50 py-3 rounded-xl border border-gray-100 animate-pulse">
                Awaiting Scanner...
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Treasurer;