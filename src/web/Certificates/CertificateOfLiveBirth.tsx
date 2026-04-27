import React from 'react';

const FullCertificateOfLiveBirth = () => {
  // Removed unused [formData, setFormData] to fix the "defined but never used" error

  const BoxLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[6.5pt] uppercase font-bold leading-none block">{children}</span>
  );

  const SubLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[5.5pt] italic text-center leading-none mt-0.5 block">{children}</span>
  );

  return (
    <div className="min-h-screen bg-zinc-200 py-8 print:bg-white print:py-0">
      {/* Action Header */}
      <div className="max-w-[8.5in] mx-auto mb-4 flex justify-between items-center bg-white p-4 shadow-md print:hidden rounded-lg">
        <div className="text-xs text-zinc-500 font-mono">FORM_NO_102_COMPLETE</div>
        <button 
          onClick={() => window.print()}
          className="bg-zinc-800 text-white px-8 py-2 rounded font-bold hover:bg-black transition-all"
        >
          Print Full Form
        </button>
      </div>

      {/* Main Form Body */}
      <div className="bg-white mx-auto w-full max-w-[8.5in] shadow-2xl print:shadow-none print:w-full font-sans text-[8pt]">
        
        {/* Strict 10mm Margins */}
        <div className="pt-[10mm] pb-[10mm] px-6 flex flex-col">
          
          {/* Top Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-1">
            <div className="text-[6pt] leading-tight w-40">
              Municipal Form No. 102<br />(Revised August 2016)
            </div>
            <div className="text-center flex-grow">
              <p className="text-[8pt] leading-tight">Republic of the Philippines</p>
              <p className="font-bold uppercase leading-tight">OFFICE OF THE CIVIL REGISTRAR GENERAL</p>
              <h1 className="text-xl font-bold tracking-widest mt-0.5">CERTIFICATE OF LIVE BIRTH</h1>
            </div>
            <div className="text-[6pt] text-right italic leading-tight w-40">
              (To be accomplished in quadruplicate using black ink)
            </div>
          </div>

          {/* Registry Section */}
          <div className="grid grid-cols-12 border-x border-b border-black">
            <div className="col-span-8 border-r border-black p-1 space-y-1">
              <div className="flex items-baseline gap-2">
                <BoxLabel>Province</BoxLabel>
                <input name="province" className="flex-grow border-b border-dotted border-black outline-none px-1 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <BoxLabel>City/Municipality</BoxLabel>
                <input name="city" className="flex-grow border-b border-dotted border-black outline-none px-1 h-4" />
              </div>
            </div>
            <div className="col-span-4 p-1">
              <BoxLabel>Registry No.</BoxLabel>
              <input name="registryNo" className="w-full border-b border-dotted border-black outline-none mt-1 h-6 text-base font-bold text-center" />
            </div>
          </div>

          {/* ---------------- CHILD SECTION ---------------- */}
          <div className="flex border-x border-b border-black">
            <div className="w-5 border-r border-black flex items-center justify-center font-bold text-[10pt] [writing-mode:vertical-lr] rotate-180 py-2">CHILD</div>
            <div className="flex-grow">
              <div className="grid grid-cols-3 border-b border-black divide-x divide-black">
                <div className="p-1"><BoxLabel>1. Name (First)</BoxLabel><input className="w-full outline-none font-bold" /></div>
                <div className="p-1"><BoxLabel>(Middle)</BoxLabel><input className="w-full outline-none font-bold" /></div>
                <div className="p-1"><BoxLabel>(Last)</BoxLabel><input className="w-full outline-none font-bold" /></div>
              </div>
              <div className="grid grid-cols-12 border-b border-black divide-x divide-black">
                <div className="col-span-4 p-1"><BoxLabel>2. Sex (Male/Female)</BoxLabel><input className="w-full outline-none" /></div>
                <div className="col-span-8 p-1">
                  <BoxLabel>3. Date of Birth (Day / Month / Year)</BoxLabel>
                  <div className="grid grid-cols-3 gap-4 mt-0.5">
                    <input className="border-b border-black outline-none text-center" placeholder="Day" />
                    <input className="border-b border-black outline-none text-center" placeholder="Month" />
                    <input className="border-b border-black outline-none text-center" placeholder="Year" />
                  </div>
                </div>
              </div>
              <div className="p-1 border-b border-black">
                <BoxLabel>4. Place of Birth (Name of Hospital/Clinic/Institution/House No., St., Barangay, City/Municipality, Province)</BoxLabel>
                <input className="w-full outline-none font-bold mt-1" />
              </div>
              <div className="grid grid-cols-12 divide-x divide-black">
                <div className="col-span-3 p-1"><BoxLabel>5a. Type of Birth</BoxLabel><input className="w-full outline-none text-[7pt]" placeholder="Single, Twin, etc." /></div>
                <div className="col-span-3 p-1"><BoxLabel>5b. If Multiple, Child was</BoxLabel><input className="w-full outline-none text-[7pt]" placeholder="First, Second, etc." /></div>
                <div className="col-span-3 p-1"><BoxLabel>5c. Birth Order</BoxLabel><input className="w-full outline-none text-[7pt]" /></div>
                <div className="col-span-3 p-1"><BoxLabel>6. Weight at Birth</BoxLabel><div className="flex items-center"><input className="flex-grow outline-none text-right font-bold" /><span>grams</span></div></div>
              </div>
            </div>
          </div>

          {/* ---------------- MOTHER SECTION ---------------- */}
          <div className="flex border-x border-b border-black bg-zinc-50/50">
            <div className="w-5 border-r border-black flex items-center justify-center font-bold text-[10pt] [writing-mode:vertical-lr] rotate-180 py-2 uppercase">Mother</div>
            <div className="flex-grow">
              <div className="grid grid-cols-3 border-b border-black divide-x divide-black">
                <div className="p-1"><BoxLabel>7. Maiden Name (First)</BoxLabel><input className="w-full outline-none" /></div>
                <div className="p-1"><BoxLabel>(Middle)</BoxLabel><input className="w-full outline-none" /></div>
                <div className="p-1"><BoxLabel>(Last)</BoxLabel><input className="w-full outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
                <div className="p-1"><BoxLabel>8. Citizenship</BoxLabel><input className="w-full outline-none" /></div>
                <div className="p-1"><BoxLabel>9. Religion/Religious Sect</BoxLabel><input className="w-full outline-none" /></div>
              </div>
              <div className="grid grid-cols-3 border-b border-black divide-x divide-black text-[6pt]">
                <div className="p-1">10a. Total Children Born Alive: <input className="w-8 border-b border-black outline-none" /></div>
                <div className="p-1">10b. Children Still Living: <input className="w-8 border-b border-black outline-none" /></div>
                <div className="p-1">10c. Children Born Now Dead: <input className="w-8 border-b border-black outline-none" /></div>
              </div>
              <div className="grid grid-cols-12 border-b border-black divide-x divide-black">
                <div className="col-span-9 p-1"><BoxLabel>11. Occupation</BoxLabel><input className="w-full outline-none" /></div>
                <div className="col-span-3 p-1"><BoxLabel>12. Age at Birth</BoxLabel><input className="w-full outline-none text-center" /></div>
              </div>
              <div className="p-1"><BoxLabel>13. Residence (House No., St., Barangay, City/Municipality, Province, Country)</BoxLabel><input className="w-full outline-none font-bold" /></div>
            </div>
          </div>

          {/* ---------------- FATHER SECTION ---------------- */}
          <div className="flex border-x border-b border-black">
            <div className="w-5 border-r border-black flex items-center justify-center font-bold text-[10pt] [writing-mode:vertical-lr] rotate-180 py-2 uppercase">Father</div>
            <div className="flex-grow">
              <div className="grid grid-cols-3 border-b border-black divide-x divide-black">
                <div className="p-1"><BoxLabel>14. Name (First)</BoxLabel><input className="w-full outline-none" /></div>
                <div className="p-1"><BoxLabel>(Middle)</BoxLabel><input className="w-full outline-none" /></div>
                <div className="p-1"><BoxLabel>(Last)</BoxLabel><input className="w-full outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
                <div className="p-1"><BoxLabel>15. Citizenship</BoxLabel><input className="w-full outline-none" /></div>
                <div className="p-1"><BoxLabel>16. Religion/Religious Sect</BoxLabel><input className="w-full outline-none" /></div>
              </div>
              <div className="grid grid-cols-12 border-b border-black divide-x divide-black">
                <div className="col-span-9 p-1"><BoxLabel>17. Occupation</BoxLabel><input className="w-full outline-none" /></div>
                <div className="col-span-3 p-1"><BoxLabel>18. Age at Birth</BoxLabel><input className="w-full outline-none text-center" /></div>
              </div>
              <div className="p-1"><BoxLabel>19. Residence</BoxLabel><input className="w-full outline-none font-bold" /></div>
            </div>
          </div>

          {/* Marriage and Attendant */}
          <div className="border-x border-b border-black p-1 bg-zinc-50/30">
            <BoxLabel>20. Marriage of Parents (If not married, accomplish Affidavit of Acknowledgement at the back.)</BoxLabel>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <div className="flex items-center gap-2"><span>Date:</span><input className="flex-grow border-b border-black outline-none text-center" /></div>
              <div className="flex items-center gap-2"><span>Place:</span><input className="flex-grow border-b border-black outline-none" /></div>
            </div>
          </div>

          <div className="border-x border-b border-black p-1">
            <div className="flex items-center gap-4">
              <BoxLabel>21a. Attendant</BoxLabel>
              <div className="flex gap-4 text-[7pt]">
                {['Physician', 'Nurse', 'Midwife', 'Hilot', 'Others'].map((label, idx) => (
                  <label key={label} className="flex items-center gap-1">
                    <input type="checkbox" className="w-3 h-3" /> {idx + 1} {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <BoxLabel>21b. Certification of Attendant at Birth</BoxLabel>
              <p className="text-[7.5pt] mt-1 pl-4">
                I hereby certify that I attended the birth of the child who was born alive at <input className="w-16 border-b border-black outline-none text-center" /> am/pm on the date of birth specified above.
              </p>
              <div className="grid grid-cols-2 gap-10 mt-2 px-8">
                <div className="space-y-3">
                  <div className="mt-4">
                    <input className="w-full border-b border-black outline-none" />
                    <SubLabel>Signature</SubLabel>
                  </div>
                  <div>
                    <input className="w-full border-b border-black outline-none text-center font-bold" />
                    <SubLabel>Name in Print</SubLabel>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <input className="w-full border-b border-black outline-none" />
                    <SubLabel>Address</SubLabel>
                  </div>
                  <div>
                    <input className="w-full border-b border-black outline-none text-center" />
                    <SubLabel>Date</SubLabel>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Informant/Registry Blocks */}
          <div className="grid grid-cols-2 border-x border-black divide-x divide-black">
            <div className="p-1 space-y-4">
              <BoxLabel>22. Certification of Informant</BoxLabel>
              <div className="px-4 space-y-3">
                <div className="mt-4"><input className="w-full border-b border-black outline-none" /><SubLabel>Signature</SubLabel></div>
                <div><input className="w-full border-b border-black outline-none text-center font-bold" /><SubLabel>Name in Print</SubLabel></div>
                <div><input className="w-full border-b border-black outline-none" /><SubLabel>Relationship / Address</SubLabel></div>
              </div>
            </div>
            <div className="p-1 space-y-4">
              <BoxLabel>23. Prepared By</BoxLabel>
              <div className="px-4 space-y-3">
                <div className="mt-4"><input className="w-full border-b border-black outline-none" /><SubLabel>Signature</SubLabel></div>
                <div><input className="w-full border-b border-black outline-none text-center font-bold" /><SubLabel>Name in Print</SubLabel></div>
                <div><input className="w-full border-b border-black outline-none" /><SubLabel>Title / Date</SubLabel></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-x border-t border-b border-black divide-x divide-black">
            <div className="p-1 space-y-4">
              <BoxLabel>24. Received By</BoxLabel>
              <div className="px-4 space-y-3">
                <div className="mt-4"><input className="w-full border-b border-black outline-none" /><SubLabel>Signature</SubLabel></div>
                <div><input className="w-full border-b border-black outline-none text-center font-bold" /><SubLabel>Name in Print / Date</SubLabel></div>
              </div>
            </div>
            <div className="p-1 space-y-4">
              <BoxLabel>25. Registered at the Office of the Civil Registrar</BoxLabel>
              <div className="px-4 space-y-3">
                <div className="mt-4"><input className="w-full border-b border-black outline-none" /><SubLabel>Signature</SubLabel></div>
                <div><input className="w-full border-b border-black outline-none text-center font-bold" /><SubLabel>Name in Print / Date</SubLabel></div>
              </div>
            </div>
          </div>

          {/* Footer Annotations */}
          <div className="border-x border-b border-black p-1 h-12">
            <BoxLabel>Remarks / Annotations (For LCR/OCRG Use Only)</BoxLabel>
            <div className="w-full h-full"></div>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          @page { size: auto; margin: 10mm 0mm; }
          body { -webkit-print-color-adjust: exact; }
          input::placeholder { color: transparent; }
        }
      `}</style>
    </div>
  );
};

export default FullCertificateOfLiveBirth;