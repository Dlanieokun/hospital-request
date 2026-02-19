import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router'; 

import hospitalLogo from '../../assets/logo.png'; 

const MedicalCertificate = () => {
  const location = useLocation();
  const mappedData = location.state?.mappedData as Record<string, string | number> | undefined;

  const [certData, setCertData] = useState({
    date: '',
    firstname: '',
    middlename: '',
    lastname: '',
    address: '',
    dateAdmitted: '',
    dateDischarged: '',
    diagnosis: '',
    remark: '',
    physician: '',
  });

  // Helper to convert full middle name to Initial
  const getInitial = (name: string) => {
    if (!name) return '';
    const trimmed = name.trim();
    return trimmed ? `${trimmed.charAt(0).toUpperCase()}.` : '';
  };

  useEffect(() => {
    if (mappedData) {
      const processedData = { ...mappedData };
      // Automatically convert middlename to initial when data is loaded
      if (processedData.middlename) {
        processedData.middlename = getInitial(processedData.middlename as string);
      }

      setCertData((prev) => ({
        ...prev,
        ...processedData, 
      }));
    }
  }, [mappedData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Force middle name to be an initial if manually typed
    if (name === 'middlename') {
      setCertData({ ...certData, [name]: getInitial(value) });
    } else {
      setCertData({ ...certData, [name]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      <div className="max-w-[8.5in] mx-auto mb-6 flex justify-end print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow font-bold hover:bg-blue-700 transition-colors"
        >
          Print Certificate
        </button>
      </div>

      <div className="max-w-[8.5in] mx-auto bg-white text-black font-serif shadow-sm print:shadow-none print:w-full">
        <div className="pt-[10mm] pb-[10mm] px-12 flex flex-col min-h-[11in] print:min-h-screen">
          
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

          <div className="space-y-6 leading-relaxed flex-grow">
            <p className="font-bold">TO WHOM IT MAY CONCERN:</p>

            <div className="relative">
              <div className="flex items-baseline gap-2">
                <span className="font-bold whitespace-nowrap uppercase">THIS IS TO CERTIFY that</span>
                <div className="flex-grow border-b border-black flex items-baseline px-2 font-bold uppercase">
                  <input 
                    name="firstname"
                    value={certData.firstname}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-[40%] outline-none bg-transparent text-center" 
                  />
                  <input 
                    name="middlename"
                    value={certData.middlename}
                    onChange={handleChange}
                    placeholder="M.I."
                    className="w-[15%] outline-none bg-transparent text-center" 
                  />
                  <input 
                    name="lastname"
                    value={certData.lastname}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-[45%] outline-none bg-transparent text-center" 
                  />
                </div>
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