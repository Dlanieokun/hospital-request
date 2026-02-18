import React, { useState } from 'react';

const MedicoLegalReport = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    address: '',
    allegedCase: '',
    allegedDate: '',
    allegedTime: '',
    allegedPlace: '',
    dateExam: '',
    timeExam: '',
    physician: '',
    datePrepared: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-zinc-100 py-10 print:bg-white print:py-0">
      {/* Control Panel */}
      <div className="max-w-[8.5in] mx-auto mb-6 flex justify-between items-center bg-white p-4 shadow-sm print:hidden rounded-lg border border-zinc-200">
        <p className="text-sm font-bold text-zinc-600 uppercase tracking-wider">Medico Legal Report Editor</p>
        <button 
          onClick={() => window.print()}
          className="bg-zinc-800 hover:bg-black text-white px-8 py-2 rounded font-bold transition-all shadow-lg"
        >
          Print Report
        </button>
      </div>

      {/* Main Document Container */}
      <div className="bg-white mx-auto w-full max-w-[8.5in] min-h-[11in] shadow-2xl print:shadow-none print:w-full font-serif">
        
        {/* Strict 10mm Top and Bottom Margins */}
        <div className="pt-[10mm] pb-[10mm] px-16 flex flex-col min-h-[11in] print:min-h-screen">
          
          {/* Header Section (Design preserved) */}
          <div className="flex flex-col items-center text-center mb-10 relative">
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

          {/* Document Title */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold border-b-2 border-black inline-block px-4 pb-1 uppercase tracking-widest">
              MEDICO LEGAL REPORT
            </h2>
          </div>

          {/* Patient Details Section */}
          <div className="space-y-1 mb-8 text-[11pt]">
            {[
              { label: 'Name', name: 'name' },
              { label: 'Age', name: 'age' },
              { label: 'Sex', name: 'sex' },
              { label: 'Address', name: 'address' },
              { label: 'Alleged Case', name: 'allegedCase' },
              { label: 'Alleged Date', name: 'allegedDate' },
              { label: 'Alleged Time', name: 'allegedTime' },
              { label: 'Alleged Place', name: 'allegedPlace' },
              { label: 'Date of Examination', name: 'dateExam' },
              { label: 'Time of Examination', name: 'timeExam' },
            ].map((field) => (
              <div key={field.name} className="flex items-baseline">
                <span className="w-40 shrink-0">{field.label}:</span>
                <input 
                  name={field.name}
                  onChange={handleChange}
                  type="text" 
                  className="flex-grow border-none outline-none bg-transparent focus:bg-zinc-50 print:bg-transparent"
                />
              </div>
            ))}
          </div>

          {/* Body Sections */}
          <div className="flex-grow space-y-10 text-[11pt] leading-relaxed">
            
            {/* PE Section */}
            <div>
              <h3 className="font-bold mb-2 uppercase">PE</h3>
              <div 
                contentEditable 
                className="w-full min-h-[200px] outline-none text-justify whitespace-pre-wrap"
              ></div>
            </div>

            {/* Broken Line Separator (Changed from X-X-X) */}
            <div className="py-4">
              <div className="border-t-2 border-dashed border-black w-full"></div>
            </div>

            {/* Remarks Section */}
            <div>
              <h3 className="font-bold underline mb-2 italic">Remarks:</h3>
              <div 
                contentEditable 
                className="w-full min-h-[100px] outline-none text-justify whitespace-pre-wrap"
              ></div>
            </div>

            {/* Conclusion Section */}
            <div>
              <h3 className="font-bold mb-4 uppercase">Conclusion:</h3>
              <div className="pl-8 space-y-4">
                <p>1. The above described physical injuries are found in the body of the victim, the age which is compatible to the alleged date of infliction.</p>
                <div className="flex flex-wrap items-baseline gap-1">
                  <span>2. Under normal condition, without subsequent complication and other involvement is present, but not clinically apparent at the time of examination, the above described physical injuries will require medical attention of not less than</span>
                  <input type="text" className="w-20 border-b border-black text-center outline-none" />
                  <span>( ) days but not more than</span>
                  <input type="text" className="w-20 border-b border-black text-center outline-none" />
                  <span>( ) days from the alleged date of infliction.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-16 break-inside-avoid">
            <div className="flex flex-col items-end mb-16">
              <div className="w-72 text-center">
                <input 
                  name="physician"
                  onChange={handleChange}
                  type="text" 
                  className="w-full border-b-2 border-black outline-none text-center font-bold uppercase mb-1" 
                />
                <p className="font-bold text-sm">Attending Physician</p>
              </div>
            </div>

            <div className="flex flex-col items-start font-bold uppercase">
              <p>DATE PREPARED</p>
              <input 
                name="datePrepared"
                onChange={handleChange}
                type="text" 
                className="border-b border-black outline-none w-64 mt-1 bg-transparent" 
              />
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm 0mm;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default MedicoLegalReport;