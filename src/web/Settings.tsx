import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, X, PlusCircle, Clock, HelpCircle } from 'lucide-react';

const SettingsSetup = () => {
  // --- Data States ---
  const [certificates, setCertificates] = useState([
    { id: 1, name: 'Medical Certificate', price: '₱150.00', status: 'Active', days: '1-2 Days', subOptions: [], subQuestions: [] },
    { id: 2, name: 'Birth Certificate', price: '₱200.00', status: 'Active', days: '3-5 Days', subOptions: [], subQuestions: [] },
  ]);

  // --- UI/Modal States ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- Form & Dynamic Rows States ---
  const [formData, setFormData] = useState({ name: '', price: '', days: '', status: 'Active' });
  const [editFormData, setEditFormData] = useState({ id: 0, name: '', price: '', days: '', status: 'Active' });
  const [subOptions, setSubOptions] = useState<any[]>([]); // For Add-ons (No Type)
  const [subQuestions, setSubQuestions] = useState<any[]>([]); // For Questions (With Type)

  // --- Handlers ---
  const resetForm = () => {
    setFormData({ name: '', price: '', days: '', status: 'Active' });
    setSubOptions([]);
    setSubQuestions([]);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert = {
      ...formData,
      id: Date.now(),
      price: `₱${parseFloat(formData.price).toFixed(2)}`,
      subOptions,
      subQuestions
    };
    setCertificates([...certificates, newCert]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditClick = (cert: any) => {
    const numericPrice = cert.price.replace('₱', '').replace(',', '');
    setEditFormData({ ...cert, price: numericPrice });
    setSubOptions(cert.subOptions || []);
    setSubQuestions(cert.subQuestions || []);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCertificates(certificates.map(cert => 
      cert.id === editFormData.id 
        ? { ...editFormData, price: `₱${parseFloat(editFormData.price).toFixed(2)}`, subOptions, subQuestions }
        : cert
    ));
    setIsEditModalOpen(false);
  };

  // --- Dynamic Helpers ---
  const addSubOption = () => setSubOptions([...subOptions, { id: Date.now(), label: '' }]);
  const removeSubOption = (id: number) => setSubOptions(subOptions.filter(opt => opt.id !== id));

  const addSubQuestion = () => setSubQuestions([...subQuestions, { id: Date.now(), question: '', type: 'Text' }]);
  const removeSubQuestion = (id: number) => setSubQuestions(subQuestions.filter(q => q.id !== id));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Certificate Settings</h2>
          <p className="text-slate-500 dark:text-slate-400">Configure certificate details, additional fees, and form requirements.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus size={20} /> Add New Certificate
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Certificate Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Price</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {certificates.map((cert) => (
              <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">{cert.name}</td>
                <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-200">{cert.price}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditClick(cert)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                  <button onClick={() => setCertificates(certificates.filter(c => c.id !== cert.id))} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODALS --- */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal 
          title={isAddModalOpen ? "Add New Certificate" : "Edit Certificate"}
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
          onSubmit={isAddModalOpen ? handleAddSubmit : handleUpdateSubmit}
          formData={isAddModalOpen ? formData : editFormData}
          setFormData={isAddModalOpen ? setFormData : setEditFormData}
          subOptions={subOptions}
          setSubOptions={setSubOptions}
          addSubOption={addSubOption}
          removeSubOption={removeSubOption}
          subQuestions={subQuestions}
          setSubQuestions={setSubQuestions}
          addSubQuestion={addSubQuestion}
          removeSubQuestion={removeSubQuestion}
          isEdit={isEditModalOpen}
        />
      )}
    </div>
  );
};

// --- REUSABLE MODAL COMPONENT ---
const Modal = ({ 
  title, onClose, onSubmit, formData, setFormData, 
  subOptions, setSubOptions, addSubOption, removeSubOption,
  subQuestions, setSubQuestions, addSubQuestion, removeSubQuestion,
  isEdit 
}: any) => {

  const updateSubOption = (id: number, field: string, value: string) => {
    setSubOptions(subOptions.map((opt: any) => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  const updateSubQuestion = (id: number, field: string, value: string) => {
    setSubQuestions(subQuestions.map((q: any) => q.id === id ? { ...q, [field]: value } : q));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-8">
          {/* Section 1: Basic Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Certificate Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Base Fee (₱)</label>
                <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Processing Time</label>
                <input required type="text" value={formData.days} onChange={(e) => setFormData({...formData, days: e.target.value})} placeholder="e.g. 1-2 Days" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>
          </div>

          {/* Section 2: Sub-options / Add-ons (TYPE REMOVED) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <PlusCircle size={16} className="text-emerald-500" />
                <h4 className="font-bold text-slate-900 dark:text-white">Sub-options / Add-ons</h4>
              </div>
              <button type="button" onClick={addSubOption} className="text-xs text-emerald-600 font-bold hover:underline transition-all">+ Add Fee Row</button>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] uppercase font-bold text-slate-500">Option Name</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subOptions.map((opt) => (
                    <tr key={opt.id}>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={opt.label} 
                          onChange={(e) => updateSubOption(opt.id, 'label', e.target.value)} 
                          placeholder="e.g. Documentary Stamp" 
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200" 
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeSubOption(opt.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {subOptions.length === 0 && (
                    <tr><td className="p-4 text-center text-xs text-slate-400 italic">No add-ons added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Sub-questions (Question + Type) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-indigo-500" />
                <h4 className="font-bold text-slate-900 dark:text-white">Sub-questions</h4>
              </div>
              <button type="button" onClick={addSubQuestion} className="text-xs text-indigo-600 font-bold hover:underline transition-all">+ Add Question Row</button>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] uppercase font-bold text-slate-500">Question / Label</th>
                    <th className="px-4 py-2 text-left text-[10px] uppercase font-bold text-slate-500 w-32">Input Type</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subQuestions.map((q) => (
                    <tr key={q.id}>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={q.question} 
                          onChange={(e) => updateSubQuestion(q.id, 'question', e.target.value)} 
                          placeholder="e.g. Purpose of Request" 
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200" 
                        />
                      </td>
                      <td className="p-2">
                        <select 
                          value={q.type} 
                          onChange={(e) => updateSubQuestion(q.id, 'type', e.target.value)} 
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200"
                        >
                          <option>Text</option>
                          <option>Number</option>
                          <option>Date</option>
                          <option>Long Text</option>
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeSubQuestion(q.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {subQuestions.length === 0 && (
                    <tr><td colSpan={2} className="p-4 text-center text-xs text-slate-400 italic">No questions added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky Footer Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky bottom-0 mt-auto">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
              {isEdit ? 'Update Certificate' : 'Save Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsSetup;