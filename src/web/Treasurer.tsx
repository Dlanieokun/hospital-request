import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, X } from 'lucide-react';

interface CollectionItem {
  id: string;
  reference: string;
  name: string;
  totalPaid: number;
  date: string;
  status: 'Paid' | 'Pending';
}

const Treasurer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const itemsPerPage = 5;

  // Ref for the hidden input to capture handheld scanner data
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const [collections] = useState<CollectionItem[]>([
    { id: '1', reference: 'REF-001', name: 'John Doe', totalPaid: 150.00, date: '2026-01-15', status: 'Paid' },
    { id: '2', reference: 'REF-002', name: 'Jane Smith', totalPaid: 200.50, date: '2026-02-20', status: 'Pending' },
    { id: '3', reference: 'REF-003', name: 'Acme Corp', totalPaid: 1200.00, date: '2025-11-10', status: 'Paid' },
    { id: '4', reference: 'REF-004', name: 'Sarah Wilson', totalPaid: 450.75, date: '2026-03-05', status: 'Pending' },
    { id: '5', reference: 'REF-005', name: 'Michael Brown', totalPaid: 310.20, date: '2025-12-25', status: 'Paid' },
  ]);

  // Focus the scanner input whenever the modal opens
  useEffect(() => {
    if (isScannerModalOpen && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [isScannerModalOpen]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scannedValue = scanInputRef.current?.value || '';
    if (scannedValue) {
      setSearchTerm(scannedValue); // Set search to the scanned reference
      setIsScannerModalOpen(false); // Close modal
      if (scanInputRef.current) scanInputRef.current.value = ''; // Clear for next time
    }
  };

  const filteredCollections = collections.filter((item) => {
    const matchesYear = item.date.startsWith(selectedYear);
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCollections.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);

  const resetPagination = () => setCurrentPage(1);

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Treasurer Collections</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-600">Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); resetPagination(); }}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div className="relative flex-grow sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); resetPagination(); }}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            <button 
              onClick={() => setIsScannerModalOpen(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all flex items-center justify-center"
              title="Scan Receipt"
            >
              <ScanLine size={20}/>
            </button>
          </div>
        </div>

        {/* Table - Same as your content */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Total Paid</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-700">{item.reference}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-bold">${item.totalPaid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-sm space-x-4">
                    <button className="text-blue-600 hover:underline font-semibold">View Receipt</button>
                    <button 
                      disabled={item.status === 'Paid'}
                      className={`${item.status === 'Paid' ? 'text-gray-400' : 'text-emerald-600 hover:underline'} font-semibold`}
                    >
                      {item.status === 'Paid' ? 'Paid' : 'Pay Receipt'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Same as your content */}
        <div className="mt-6 flex justify-between items-center border-t pt-4">
          <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg disabled:opacity-30">Previous</button>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>

      {/* Handheld Scanner Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsScannerModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24}/>
            </button>
            
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScanLine size={40} className="text-blue-600 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Scan</h3>
            <p className="text-gray-500 mb-6">Please use your handheld scanner to scan the QR code on the receipt.</p>
            
            {/* Hidden form for handheld scanner keyboard emulation */}
            <form onSubmit={handleScanSubmit}>
              <input
                ref={scanInputRef}
                type="text"
                autoFocus
                className="opacity-0 absolute"
                onBlur={() => isScannerModalOpen && scanInputRef.current?.focus()}
              />
              <div className="text-xs font-mono text-gray-400 bg-gray-50 py-2 rounded">
                Waiting for input...
              </div>
            </form>
            
            <button 
              onClick={() => setIsScannerModalOpen(false)}
              className="mt-8 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancel and close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Treasurer;