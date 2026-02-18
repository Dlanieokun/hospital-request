import React, { useState } from 'react';

const MedicalAbstract = () => {
  const [formData, setFormData] = useState({
    department: '',
    patientName: '',
    date: '',
    ageSex: '',
    civilStatus: '',
    occupation: '',
    religion: '',
    address: '',
    physicianName: '',
    licNo: '',
    age_sex: '',
    civil_status: '',
    occupation_field: '',
    religion_field: '',
    address_field: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Seal_of_the_Department_of_Health_%28Philippines%29.svg/1200px-Seal_of_the_Department_of_Health_%28Philippines%29.svg.png" 
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

          {/* Patient Info */}
          <div className="grid grid-cols-12 gap-y-2 text-[11pt] mb-6">
            <div className="col-span-8 flex items-baseline">
              <span className="shrink-0 w-32 font-bold">Name of Patient :</span>
              <input 
                name="patientName" 
                value={formData.patientName}
                onChange={handleChange} 
                className="flex-grow border-b border-dashed border-black outline-none px-2" 
              />
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

            {/* Manually defining fields for better name/value control */}
            {[
              { label: 'Age / Sex', name: 'ageSex' },
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
                    value={formData[field.name as keyof typeof formData]} 
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
              <div contentEditable className="flex-grow outline-none border-b border-dashed border-black min-h-[28px]"></div>
            </div>

            {['Past Medical History', 'Diagnosis', 'Medications'].map((section) => (
              <div key={section} className="space-y-1">
                <h3 className="font-bold">{section} :</h3>
                <div contentEditable style={linedStyle} className="w-full min-h-[112px] outline-none text-justify whitespace-pre-wrap"></div>
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
          input::placeholder { color: transparent; }
        }
      `}</style>
    </div>
  );
};

export default MedicalAbstract;