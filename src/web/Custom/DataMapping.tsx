import React, { useState, useMemo } from 'react';
import { data, useLocation } from 'react-router-dom';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Types ---
type ReportType = "Medical Certificate" | "Medical Abstract" | "Medico Legal" | "Live Birth";

interface SubQuestion {
  question: string;
}

interface LocationState {
  certificate: {
    id:any;
    syn_cert: ReportType;
    sub_questions: SubQuestion[];
  };
  patient: {
    datas: {
      data: {
        "Case Information": Record<string, any>;
        "Patient Information": Record<string, any>;
      };
    };
  };
}

// --- Components ---
const DraggableKey = ({ id }: { id: string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 mb-2 bg-white border border-slate-200 rounded shadow-sm cursor-grab active:cursor-grabbing text-xs font-mono transition-all
        ${isDragging ? 'opacity-40 ring-2 ring-blue-500 scale-95' : 'hover:border-blue-400 hover:bg-blue-50'}`}
    >
      {id}
    </div>
  );
};

const DroppableSlot = ({ label, mappedValue, onClear }: { label: string; mappedValue: string | null; onClear: () => void }) => {
  const { isOver, setNodeRef } = useDroppable({ id: label });
  return (
    <div className="flex items-center mb-3 gap-4">
      <div className="w-44 text-sm font-semibold text-slate-700 truncate font-mono">{label}</div>
      <span className="text-slate-400 font-bold">=</span>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[44px] rounded border-2 border-dashed flex items-center justify-between px-3 transition-all
          ${isOver ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200'}
          ${mappedValue ? 'bg-white border-green-600 border-solid shadow-sm' : ''}`}
      >
        {mappedValue ? (
          <>
            <span className="text-green-700 font-mono text-xs font-bold bg-green-50 px-2 py-1 rounded">{mappedValue}</span>
            <button onClick={onClear} className="text-slate-400 hover:text-red-500 transition-colors p-1">✕</button>
          </>
        ) : (
          <span className="text-slate-300 italic text-[10px] uppercase tracking-widest text-center w-full">Drop Key</span>
        )}
      </div>
    </div>
  );
};

const DataMapping = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  
  // Helper for Authorization Headers
  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  // Destructure data safely
  const certificate = state?.certificate;
  const patient = state?.patient;

  const fieldsConfig: Record<ReportType, string[]> = {
    "medical-certificate": ["date", "patientName", "address", "dateAdmitted", "dateDischarged", "diagnosis", "remark", "physician"],
    "medical-abstract": ["department", "patientName", "date", "ageSex", "civilStatus", "occupation", "religion", "address", "physicianName", "licNo"],
    "Medico Legal": ["name", "age", "sex", "address", "allegedCase", "allegedDate", "allegedTime", "allegedPlace", "dateExam", "timeExam", "physicalExam", "remarks", "minDays", "maxDays", "physician", "datePrepared"],
    "Live Birth": ["registryNo", "province", "city", "childFirst", "childMiddle", "childLast", "sex", "dob", "pob", "motherName", "fatherName"]
  };

  // Determine initial type safely
  const initialType: ReportType = (certificate?.syn_cert && fieldsConfig[certificate.syn_cert]) 
    ? certificate.syn_cert 
    : "medical-certificate";

  const [currentType, setCurrentType] = useState<ReportType>(initialType);

  // Safely get active fields
  const activeFields = useMemo(() => fieldsConfig[currentType] || [], [currentType]);

  // Use a functional initializer for state to prevent crash during init
  const [mappings, setMappings] = useState<{ [key: string]: string | null }>(() => 
    Object.fromEntries(activeFields.map(field => [field, null]))
  );

  const sourceKeys = useMemo(() => {
    // Return empty array if patient data is missing to avoid "map of undefined"
    if (!patient?.datas?.data) return [];

    const caseKeys = Object.keys(patient.datas.data["Case Information"] || {});
    const patientKeys = Object.keys(patient.datas.data["Patient Information"] || {});
    const questions = certificate?.sub_questions?.map(q => q.question) || [];
    
    return Array.from(new Set([...questions, ...caseKeys, ...patientKeys]));
  }, [certificate, patient]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) setMappings(prev => ({ ...prev, [over.id]: active.id as string }));
  };

  const handleTypeChange = (type: ReportType) => {
    setCurrentType(type);
    const newFields = fieldsConfig[type] || [];
    setMappings(Object.fromEntries(newFields.map(field => [field, null])));
  };

  const handleSaveMapping = async () => {
    const allMappedKeys = Object.entries(mappings).map(([key, value]) => ({
      key: key,
      key_sync: value 
    }));
    console.log("Full Mapping Data:", allMappedKeys);
    console.log(currentType);
    
    try {
      const response = await fetch(`${API_BASE_URL}/sync/${certificate?.id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          data: allMappedKeys,
          sync_name: currentType
         }),
      });

      if (response.ok) {
        console.log("SUCCESSFULLY")
      } else {
          alert("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
    return allMappedKeys;
  };

  if (!state) return <div className="p-10 text-center">No data provided for mapping.</div>;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-slate-100 p-6 gap-6 overflow-hidden">
        {/* Left Panel: Available Keys */}
        <div className="w-1/4 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
          <div className="p-4 border-b bg-slate-50 rounded-t-xl text-center">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Available Keys</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {sourceKeys.map((key) => (
              <DraggableKey key={key} id={key} />
            ))}
          </div>
        </div>

        {/* Right Panel: Mapping Slots */}
        <div className="w-3/4 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-xl">
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{currentType} Mapping</h2>
              <div className="flex gap-2 mt-2">
                {(Object.keys(fieldsConfig) as ReportType[]).map((type) => (
                  <button 
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors ${currentType === type ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSaveMapping} className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-xs hover:bg-blue-700 shadow-md">SAVE MAPPING</button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12">
              {/* Added fallback to ensure map is called on an array */}
              {activeFields.length > 0 ? activeFields.map((field) => (
                <DroppableSlot 
                  key={`${currentType}-${field}`} 
                  label={field} 
                  mappedValue={mappings[field]} 
                  onClear={() => setMappings(prev => ({ ...prev, [field]: null }))}
                />
              )) : (
                <div className="text-slate-400 italic">No fields defined for this type.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
    </DndContext>
  );
};

export default DataMapping;