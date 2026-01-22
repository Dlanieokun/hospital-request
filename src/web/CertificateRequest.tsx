import React from 'react';

interface CertificateRequest {
  id: string;
  requestorName: string;
  certificates: string[];
  releaseDate: string;
  status: 'Pending' | 'Ready' | 'Released';
}

const requests: CertificateRequest[] = [
  { id: '1', requestorName: 'John Doe', certificates: ['Medical Certificate', 'Lab Results'], releaseDate: '2026-01-25', status: 'Pending' },
  { id: '2', requestorName: 'Jane Smith', certificates: ['Birth Certificate'], releaseDate: '2026-01-22', status: 'Ready' },
  { id: '3', requestorName: 'Michael Brown', certificates: ['Clearance for Work'], releaseDate: '2026-01-20', status: 'Released' },
];

const CertificateRequestTable = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Hospital Certificate Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="px-6 py-3 border-b">Requestor Name</th>
              <th className="px-6 py-3 border-b">Certificates</th>
              <th className="px-6 py-3 border-b">Date of Release</th>
              <th className="px-6 py-3 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 border-b font-medium">{req.requestorName}</td>
                <td className="px-6 py-4 border-b">
                  <div className="flex flex-wrap gap-1">
                    {req.certificates.map((cert, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {cert}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 border-b">{req.releaseDate}</td>
                <td className="px-6 py-4 border-b text-center space-x-2">
                  <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded shadow">
                    View
                  </button>
                  <button className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded shadow">
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificateRequestTable;