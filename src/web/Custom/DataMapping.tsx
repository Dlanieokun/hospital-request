import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
    id: any;
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

const DroppableSlot = ({ 
  label, 
  mappedValues, 
  onRemoveKey 
}: { 
  label: string; 
  mappedValues: string[]; 
  onRemoveKey: (key: string) => void 
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: label });
  
  return (
    <div className="flex flex-col mb-4 p-3 border rounded-lg bg-slate-50 border-slate-200 transition-colors">
      <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider flex justify-between">
        <span>{label}</span>
        <span className="text-slate-400">{mappedValues.length} Keys</span>
      </div>
      
      <div
        ref={setNodeRef}
        className={`min-h-[50px] p-2 rounded border-2 border-dashed flex flex-wrap gap-2 transition-all items-center
          ${isOver ? 'bg-blue-100 border-blue-400' : 'bg-white border-slate-200'}
          ${mappedValues.length > 0 ? 'border-solid border-green-500' : ''}`}
      >
        {mappedValues.length > 0 ? (
          mappedValues.map((val) => (
            <div 
              key={val} 
              className="flex items-center bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-sm animate-in fade-in zoom-in duration-200"
            >
              <span className="font-mono font-medium">{val}</span>
              <button 
                onClick={() => onRemoveKey(val)} 
                className="ml-2 hover:text-red-300 font-bold transition-colors"
                title="Remove Key"
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <span className="text-slate-300 italic text-[10px] uppercase tracking-widest text-center w-full">
            Drop Keys Here
          </span>
        )}
      </div>
    </div>
  );
};

const DataMapping = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  
  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  const certificate = state?.certificate;
  const patient = state?.patient;

  const fieldsConfig: Record<string, string[]> = {
    "medical-certificate": ["date", "firstname", "middlename", "lastname", "suffix", "address", "dateAdmitted", "dateDischarged", "diagnosis", "remark", "physician"],
    "medical-abstract": ["department", "firstname", "middlename", "lastname", "suffix", "date", "age", "sex", "civilStatus", "occupation", "religion", "address", "physicianName", "licNo","pastMedicalHistory", "diagnosis", "medications"],
    "Medico Legal": ["name", "age", "sex", "address", "allegedCase", "allegedDate", "allegedTime", "allegedPlace", "dateExam", "timeExam", "physicalExam", "remarks", "minDays", "maxDays", "physician", "datePrepared"],
    "Live Birth": ["registryNo", "province", "city", "childFirst", "childMiddle", "childLast", "sex", "dob", "pob", "motherName", "fatherName"]
  };

  const initialType = (certificate?.syn_cert && fieldsConfig[certificate.syn_cert]) 
    ? certificate.syn_cert 
    : "medical-certificate";

  const [currentType, setCurrentType] = useState<string>(initialType);

  // Mappings now store an array of strings per field
  const [mappings, setMappings] = useState<{ [key: string]: string[] }>(() => {
    const fields = fieldsConfig[initialType] || [];
    return Object.fromEntries(fields.map(field => [field, []]));
  });

  const sourceKeys = useMemo(() => {
    if (!patient?.datas?.data) return [];
    const caseKeys = Object.keys(patient.datas.data["Case Information"] || {});
    const patientKeys = Object.keys(patient.datas.data["Patient Information"] || {});
    const questions = certificate?.sub_questions?.map(q => q.question) || [];
    return Array.from(new Set([...questions, ...caseKeys, ...patientKeys]));
  }, [certificate, patient]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) {
      const field = over.id as string;
      const key = active.id as string;
      
      setMappings(prev => {
        // Prevent adding the same key twice to the same field
        if (prev[field].includes(key)) return prev;
        return {
          ...prev,
          [field]: [...prev[field], key]
        };
      });
    }
  };

  const handleRemoveKey = (field: string, keyToRemove: string) => {
    setMappings(prev => ({
      ...prev,
      [field]: prev[field].filter(k => k !== keyToRemove)
    }));
  };

  const handleTypeChange = (type: string) => {
    setCurrentType(type);
    const newFields = fieldsConfig[type] || [];
    setMappings(Object.fromEntries(newFields.map(field => [field, []])));
  };

  const handleSaveMapping = async () => {
    // Sending keys joined by a comma or as an array depending on backend needs
    const allMappedKeys = Object.entries(mappings).map(([key, values]) => ({
      key: key,
      key_sync: values.join(', ') 
    }));
    
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
        alert("Mapping saved successfully!");
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (!state) return <div className="p-10 text-center">No data provided for mapping.</div>;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-slate-100 p-6 gap-6 overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/4 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
          <div className="p-4 border-b bg-slate-50 rounded-t-xl">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-center">Available Keys</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {sourceKeys.map((key) => (
              <DraggableKey key={key} id={key} />
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-3/4 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-xl">
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{currentType} Mapping</h2>
              <div className="flex gap-2 mt-2">
                {Object.keys(fieldsConfig).map((type) => (
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
            <button onClick={handleSaveMapping} className="bg-green-600 text-white px-6 py-2 rounded font-bold text-xs hover:bg-green-700 shadow-md transition-all">
              SAVE MAPPING
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
              {(fieldsConfig[currentType] || []).map((field) => (
                <DroppableSlot 
                  key={`${currentType}-${field}`} 
                  label={field} 
                  mappedValues={mappings[field] || []} 
                  onRemoveKey={(key) => handleRemoveKey(field, key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
    </DndContext>
  );
};

export default DataMapping;