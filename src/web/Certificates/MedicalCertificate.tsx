import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router'; // Import useLocation

import hospitalLogo from '../../assets/logo.png'; 

const MedicalCertificate = () => {
  // 1. Access the state passed from navigate
  const location = useLocation();
  const mappedData = location.state?.mappedData as Record<string, string> | undefined;

  // 2. Unified State for all certificate fields
  const [certData, setCertData] = useState({
    date: '',
    patientName: '',
    address: '',
    dateAdmitted: '',
    dateDischarged: '',
    diagnosis: '',
    remark: '',
    physician: '',
  });

  // 3. Sync Logic: Updates the form when the location state is available
  useEffect(() => {
    if (mappedData) {
      setCertData((prev) => ({
        ...prev,
        ...mappedData, // Overwrites fields with values from the mapping
      }));
    }
  }, [mappedData]);

  // 4. Handle manual typing in fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCertData({ ...certData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      {/* Print Button - Hidden on Paper */}
      <div className="max-w-[8.5in] mx-auto mb-6 flex justify-end print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow font-bold hover:bg-blue-700 transition-colors"
        >
          Print Certificate
        </button>
      </div>

      {/* Main Container - Universal Bond Paper size */}
      <div className="max-w-[8.5in] mx-auto bg-white text-black font-serif shadow-sm print:shadow-none print:w-full">
        
        {/* Strict Margins */}
        <div className="pt-[10mm] pb-[10mm] px-12 flex flex-col min-h-[11in] print:min-h-screen">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-8 relative">
            <div className="absolute left-0 top-0 w-24 h-24 flex items-center justify-center">
              <img 
                src={hospitalLogo}
                alt="Hospital Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <p className="text-sm">Republic of the Philippines</p>
            <p className="text-sm font-bold">Province of Leyte</p>
            <h1 className="text-xl font-bold uppercase tracking-wide">Leyte Provincial Hospital</h1>
            <p className="text-sm italic">Candahug, Palo, Leyte</p>
          </div>

          <div className="text-center my-12">
            <h2 className="text-3xl font-bold tracking-widest border-b-2 border-black inline-block pb-1">
              MEDICAL CERTIFICATE
            </h2>
          </div>

          {/* Date Field - Reactive */}
          <div className="text-right mb-8">
            <div className="inline-flex items-baseline">
              <span className="mr-2 italic">Date</span>
              <input 
                name="date"
                value={certData.date}
                onChange={handleChange}
                type="text" 
                className="border-b border-black outline-none min-w-[150px] bg-transparent text-center" 
              />
            </div>
          </div>

          {/* Body Section */}
          <div className="space-y-6 leading-relaxed flex-grow">
            <p className="font-bold">TO WHOM IT MAY CONCERN:</p>

            <div className="relative">
              <div className="flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap uppercase">THIS IS TO CERTIFY that</span>
                <input 
                  name="patientName"
                  value={certData.patientName}
                  onChange={handleChange}
                  type="text" 
                  className="flex-grow border-b border-black outline-none bg-transparent px-2 text-center font-bold" 
                />
              </div>
              <p className="text-xs italic text-center ml-40">(Name of Patient)</p>
            </div>

            <div className="relative mt-4">
              <input 
                name="address"
                value={certData.address}
                onChange={handleChange}
                type="text" 
                className="w-full border-b border-black outline-none bg-transparent text-center" 
              />
              <p className="text-xs italic text-center">(Address)</p>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="whitespace-nowrap">was examined/treated/confined in this hospital on/from</span>
              <input 
                name="dateAdmitted"
                value={certData.dateAdmitted}
                onChange={handleChange}
                type="text" 
                className="flex-grow border-b border-black outline-none bg-transparent px-2 text-center" 
              />
            </div>
            <p className="text-xs italic text-right pr-20">(Date Admitted)</p>

            <div className="flex items-baseline gap-2">
              <input 
                name="dateDischarged"
                value={certData.dateDischarged}
                onChange={handleChange}
                type="text" 
                className="w-48 border-b border-black outline-none bg-transparent px-2 text-center" 
              />
              <span>with the following findings and diagnosis:</span>
            </div>
            <p className="text-xs italic text-left pl-10">(Date discharged)</p>

            {/* Diagnosis Section */}
            <div className="mt-8">
              <h3 className="font-bold underline uppercase">Diagnosis:</h3>
              <div 
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => setCertData({...certData, diagnosis: e.currentTarget.innerText})}
                className="w-full bg-transparent outline-none mt-2 whitespace-pre-wrap text-justify border-none"
                style={{
                  backgroundImage: 'linear-gradient(transparent, transparent 27px, #000 28px)',
                  backgroundSize: '100% 28px',
                  lineHeight: '28px',
                  minHeight: '112px'
                }}
              >
                {certData.diagnosis}
              </div>
            </div>

            {/* Remark Section */}
            <div className="mt-8">
              <h3 className="font-bold underline uppercase">Remark:</h3>
              <div 
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => setCertData({...certData, remark: e.currentTarget.innerText})}
                className="w-full bg-transparent outline-none mt-2 whitespace-pre-wrap text-justify border-none"
                style={{
                  backgroundImage: 'linear-gradient(transparent, transparent 27px, #000 28px)',
                  backgroundSize: '100% 28px',
                  lineHeight: '28px',
                  minHeight: '84px'
                }}
              >
                {certData.remark}
              </div>
            </div>
          </div>

          {/* Footer / Signature - Reactive */}
          <div className="mt-12 flex flex-col items-end break-inside-avoid">
            <div className="w-80 text-center">
              <input 
                name="physician"
                value={certData.physician}
                onChange={handleChange}
                type="text" 
                className="w-full border-b-2 border-black outline-none bg-transparent text-center font-bold uppercase mb-1" 
              />
              <p className="font-bold">Attending Physician</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: auto; margin: 10mm 0mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          div[contenteditable] { background-image: linear-gradient(transparent, transparent 27px, #000 28px) !important; }
        }
      `}</style>
    </div>
  );
};

export default MedicalCertificate;