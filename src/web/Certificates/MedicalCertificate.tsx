
const MedicalCertificate = () => {
  return (
    <div className="max-w-3xl mx-auto p-12 bg-white text-black font-serif border border-gray-200 shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-8 relative">
        {/* Placeholder for Logo */}
        <div className="absolute left-0 top-0 w-20 h-20 border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400">
          HOSPITAL LOGO
        </div>
        
        <p className="text-sm">Republic of the Philippines</p>
        <p className="text-sm font-bold">Province of Leyte</p>
        <h1 className="text-xl font-bold uppercase tracking-wide">Leyte Provincial Hospital</h1>
        <p className="text-sm italic">Candahug, Palo, Leyte</p>
      </div>

      {/* Document Title */}
      <div className="text-center my-12">
        <h2 className="text-3xl font-bold tracking-widest border-b-2 border-black inline-block pb-1">
          MEDICAL CERTIFICATE
        </h2>
      </div>

      {/* Date Field */}
      <div className="text-right mb-8">
        <p className="inline-block border-b border-black min-w-[150px] text-left">Date: </p>
      </div>

      {/* Body Section */}
      <div className="space-y-6 leading-relaxed">
        <p className="font-bold">TO WHOM IT MAY CONCERN:</p>

        <div className="relative">
          <p className="flex items-baseline gap-2">
            <span className="font-bold whitespace-nowrap">THIS IS TO CERTIFY that</span>
            <span className="flex-grow border-b border-black"></span>
          </p>
          <p className="text-xs italic text-center ml-40">(Name of Patient)</p>
        </div>

        <div className="relative mt-4">
          <div className="w-full border-b border-black h-6"></div>
          <p className="text-xs italic text-center">(Address)</p>
        </div>

        <div className="flex items-baseline gap-2 mt-4">
          <span>was examined/treated/confined in this hospital on/from</span>
          <span className="flex-grow border-b border-black"></span>
        </div>
        <p className="text-xs italic text-right pr-20">(Date Admitted)</p>

        <div className="flex items-baseline gap-2">
          <span className="w-48 border-b border-black"></span>
          <span>with the following findings and diagnosis:</span>
        </div>
        <p className="text-xs italic text-left pl-10">(Date discharge)</p>

        {/* Diagnosis Section */}
        <div className="mt-8">
          <h3 className="font-bold underline uppercase">Diagnosis:</h3>
          <div className="space-y-4 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-black w-full h-6"></div>
            ))}
          </div>
        </div>

        {/* Remark Section */}
        <div className="mt-8">
          <h3 className="font-bold underline uppercase">Remark:</h3>
          <div className="space-y-4 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-black w-full h-6"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Signature */}
      <div className="mt-24 flex flex-col items-end">
        <div className="w-64 text-center">
          <div className="border-b border-black w-full mb-1"></div>
          <p className="font-bold">Attending Physician</p>
        </div>
      </div>
    </div>
  );
};

export default MedicalCertificate;