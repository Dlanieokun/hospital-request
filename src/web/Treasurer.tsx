import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';

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
  const itemsPerPage = 5;

  // Mock data
  const [collections] = useState<CollectionItem[]>([
    { id: '1', reference: 'REF-001', name: 'John Doe', totalPaid: 150.00, date: '2026-01-15', status: 'Paid' },
    { id: '2', reference: 'REF-002', name: 'Jane Smith', totalPaid: 200.50, date: '2026-02-20', status: 'Pending' },
    { id: '3', reference: 'REF-003', name: 'Acme Corp', totalPaid: 1200.00, date: '2025-11-10', status: 'Paid' },
    { id: '4', reference: 'REF-004', name: 'Sarah Wilson', totalPaid: 450.75, date: '2026-03-05', status: 'Pending' },
    { id: '5', reference: 'REF-005', name: 'Michael Brown', totalPaid: 310.20, date: '2025-12-25', status: 'Paid' },
  ]);

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Treasurer Collections</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Year Input (Left) */}
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

            {/* Search Input (Middle) */}
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

            {/* Scanner Button (Right) */}
            <button 
              onClick={() => alert("Opening Camera Scanner...")}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all flex items-center justify-center"
              title="Scan Receipt"
            >
              <ScanLine/>
            </button>
          </div>
        </div>

        {/* Table */}
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

        {/* Pagination UI */}
        <div className="mt-6 flex justify-between items-center border-t pt-4">
          <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => p - 1)} 
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => p + 1)} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Treasurer;