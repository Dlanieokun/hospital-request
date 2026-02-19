import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router'; 
import hospitalLogo from '../../assets/logo.png'; 

const MedicalAbstract = () => {
  const location = useLocation();
  const mappedData = location.state?.mappedData as Record<string, string | number> | undefined;

  const [formData, setFormData] = useState({
    department: '',
    firstname: '',
    middlename: '',
    lastname: '',
    suffix: '',
    date: '',
    age: '',
    sex: '',
    civilStatus: '',
    occupation: '',
    religion: '',
    address: '',
    physicianName: '',
    licNo: '',
    pastMedicalHistory: '',
    diagnosis: '',
    medications: '',
    chiefComplaint: ''
  });

  // Helper to convert full middle name to Initial
  const getInitial = (name: string) => {
    if (!name) return '';
    const trimmed = name.trim();
    return trimmed ? `${trimmed.charAt(0).toUpperCase()}.` : '';
  };

  useEffect(() => {
    if (mappedData) {
      // Automatically convert middlename to initial when data is loaded
      const processedData = { ...mappedData };
      if (processedData.middlename) {
        processedData.middlename = getInitial(processedData.middlename as string);
      }
      
      setFormData((prev) => ({
        ...prev,
        ...processedData, 
      }));
    }
  }, [mappedData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // If user types in middle name field, force it to be an initial
    if (name === 'middlename') {
      setFormData({ ...formData, [name]: getInitial(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const linedStyle = {
    backgroundImage: 'linear-gradient(transparent, transparent 27px, #333 28px)',
    backgroundSize: '100% 28px',
    lineHeight: '28px',
  };

  return (
    <div className="min-h-screen bg-zinc-100 py-10 print:bg-white print:py-0">
      {/* Control Panel */}
      <div className="max-w-[8.5in] mx-auto mb-6 flex justify-between items-center bg-white p-4 shadow-sm print:hidden rounded-lg border border-zinc-200">
        <p className="text-sm font-bold text-zinc-600 uppercase tracking-wider">Medical Abstract Editor</p>
        <button 
          onClick={() => window.print()}
          className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2 rounded font-bold transition-all shadow-lg"
        >
          Print Abstract
        </button>
      </div>

      <div className="bg-white mx-auto w-full max-w-[8.5in] min-h-[11in] shadow-2xl print:shadow-none print:w-full font-serif">
        <div className="pt-[10mm] pb-[10mm] px-16 flex flex-col min-h-[11in] print:min-h-screen">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-4 relative">
            <div className="absolute left-0 top-0 w-24 h-24 flex items-center justify-center">
              <img 
                src={hospitalLogo}
                alt="Hospital Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <p className="text-sm">Republic of the Philippines</p>
            <p className="text-sm font-bold uppercase">Province of Leyte</p>
            <h1 className="text-xl font-bold uppercase tracking-wide">Leyte Provincial Hospital</h1>
            <p className="text-sm italic">Candahug, Palo, Leyte</p>
          </div>

          <div className="flex justify-center mb-8">
             <div className="flex items-baseline gap-2">
                <span className="font-bold">Department of</span>
                <input 
                  name="department" 
                  value={formData.department}
                  onChange={handleChange} 
                  className="border-b border-black outline-none w-64 text-center font-bold" 
                />
             </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-widest">MEDICAL ABSTRACT</h2>
          </div>

          {/* Patient Info Section */}
          <div className="grid grid-cols-12 gap-y-2 text-[11pt] mb-6">
            <div className="col-span-8 flex items-baseline">
              <span className="shrink-0 w-32 font-bold">Name of Patient :</span>
              <div className="flex-grow border-b border-dashed border-black flex items-baseline px-1">
                <input 
                  name="firstname" 
                  value={formData.firstname}
                  onChange={handleChange} 
                  className="w-[35%] outline-none bg-transparent" 
                />
                <input 
                  name="middlename" 
                  value={formData.middlename}
                  onChange={handleChange} 
                  className="w-[10%] outline-none bg-transparent text-center" 
                />
                <input 
                  name="lastname" 
                  value={formData.lastname}
                  onChange={handleChange} 
                  className="w-[35%] outline-none bg-transparent" 
                />
                <input 
                  name="suffix" 
                  value={formData.suffix}
                  onChange={handleChange} 
                  className="w-[20%] outline-none bg-transparent" 
                />
              </div>
            </div>
            <div className="col-span-4 flex items-baseline pl-4">
              <span className="shrink-0 font-bold">Date :</span>
              <input 
                name="date" 
                value={formData.date}
                onChange={handleChange} 
                className="flex-grow border-b border-dashed border-black outline-none px-2" 
              />
            </div>

            {/* AGE / SEX ROW */}
            <div className="col-span-8 flex items-baseline">
              <span className="shrink-0 w-32 font-bold">Age / Sex :</span>
              <div className="flex-grow border-b border-dashed border-black flex items-baseline">
                <input 
                  name="age"
                  value={formData.age} 
                  onChange={handleChange} 
                  className="w-16 outline-none px-2 bg-transparent text-center" 
                />
                <span className="px-1 text-zinc-400">/</span>
                <input 
                  name="sex"
                  value={formData.sex} 
                  onChange={handleChange} 
                  className="flex-grow outline-none px-2 bg-transparent" 
                />
              </div>
            </div>
            <div className="col-span-4"></div>

            {[
              { label: 'Civil Status', name: 'civilStatus' },
              { label: 'Occupation', name: 'occupation' },
              { label: 'Religion', name: 'religion' },
              { label: 'Address', name: 'address' }
            ].map((field) => (
              <React.Fragment key={field.name}>
                <div className="col-span-8 flex items-baseline">
                  <span className="shrink-0 w-32 font-bold">{field.label} :</span>
                  <input 
                    name={field.name}
                    value={(formData as any)[field.name]} 
                    onChange={handleChange} 
                    className="flex-grow border-b border-dashed border-black outline-none px-2" 
                  />
                </div>
                <div className="col-span-4"></div>
              </React.Fragment>
            ))}
          </div>

          {/* Flowing Content */}
          <div className="flex-grow space-y-6 text-[11pt]">
            <div className="flex items-start">
              <span className="font-bold w-36 shrink-0 pt-1">Chief Complaint :</span>
              <div 
                contentEditable 
                suppressContentEditableWarning={true}
                onInput={(e) => setFormData({...formData, chiefComplaint: e.currentTarget.textContent || ''})}
                className="flex-grow outline-none border-b border-dashed border-black min-h-[28px]"
              >
                {formData.chiefComplaint}
              </div>
            </div>

            {[
              { label: 'Past Medical History', key: 'pastMedicalHistory' },
              { label: 'Diagnosis', key: 'diagnosis' },
              { label: 'Medications', key: 'medications' }
            ].map((section) => (
              <div key={section.key} className="space-y-1">
                <h3 className="font-bold">{section.label} :</h3>
                <div 
                  contentEditable 
                  suppressContentEditableWarning={true}
                  style={linedStyle} 
                  className="w-full min-h-[112px] outline-none text-justify whitespace-pre-wrap"
                  onInput={(e) => setFormData({...formData, [section.key]: e.currentTarget.textContent || ''})}
                >
                  {(formData as any)[section.key]}
                </div>
              </div>
            ))}
            <p className="font-bold text-center mt-8">Thank You and God Bless!!!</p>
          </div>

          {/* Footer Signature Section */}
          <div className="mt-16 flex justify-end break-inside-avoid">
            <div className="w-96">
              <div className="text-center">
                <input 
                  name="physicianName"
                  value={formData.physicianName}
                  onChange={handleChange}
                  className="w-full border-b border-black outline-none text-center font-bold uppercase bg-transparent px-2"
                  placeholder="Type Name Here"
                />
                <p className="text-xs font-bold mt-1">Physician's Printed Name & Signature</p>
              </div>

              <div className="flex items-center mt-2 pl-12">
                <span className="text-sm font-bold">Lic. #</span>
                <input 
                  name="licNo"
                  value={formData.licNo}
                  onChange={handleChange}
                  className="flex-grow border-b border-black outline-none bg-transparent px-2 text-center"
                  placeholder="Type License No."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: auto; margin: 10mm 0mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          div[contenteditable] { background-image: linear-gradient(transparent, transparent 27px, #333 28px) !important; }
        }
      `}</style>
    </div>
  );
};

export default MedicalAbstract;