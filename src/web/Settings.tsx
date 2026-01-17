import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, X, PlusCircle, Clock } from 'lucide-react';

const SettingsSetup = () => {
  // Modal & Data States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [subOptions, setSubOptions] = useState([{ id: Date.now(), label: '', type: 'Fixed' }]);

  const [certificates, setCertificates] = useState([
    { id: 1, name: 'Medical Certificate', price: '₱150.00', status: 'Active', days: '1-2 Days' },
    { id: 2, name: 'Birth Certificate', price: '₱200.00', status: 'Active', days: '3-5 Days' },
    { id: 3, name: 'Health Clearance', price: '₱100.00', status: 'Active', days: '1 Day' },
    { id: 4, name: 'Sanitary Permit', price: '₱300.00', status: 'Inactive', days: '5-7 Days' },
  ]);

  // Form States
  const [formData, setFormData] = useState({ name: '', price: '', days: '', status: 'Active' });
  const [editFormData, setEditFormData] = useState({ id: 0, name: '', price: '', days: '', status: 'Active' });

  // --- Handlers for Add Modal ---
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert = {
      id: Date.now(),
      name: formData.name,
      price: `₱${parseFloat(formData.price).toFixed(2)}`,
      status: formData.status,
      days: formData.days
    };
    setCertificates([...certificates, newCert]);
    setIsAddModalOpen(false);
    setFormData({ name: '', price: '', days: '', status: 'Active' });
  };

  // --- Handlers for Edit Modal ---
  const handleEditClick = (cert: any) => {
    // Strip the '₱' symbol to make it a raw number for the input
    const numericPrice = cert.price.replace('₱', '').replace(',', '');
    setEditFormData({ ...cert, price: numericPrice });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCertificates(certificates.map(cert => 
      cert.id === editFormData.id 
        ? { ...editFormData, price: `₱${parseFloat(editFormData.price).toFixed(2)}` }
        : cert
    ));
    setIsEditModalOpen(false);
  };

  // --- Helpers ---
  const addSubOption = () => setSubOptions([...subOptions, { id: Date.now(), label: '', type: 'Fixed' }]);
  const removeSubOption = (id: number) => {
    if (subOptions.length > 1) setSubOptions(subOptions.filter(opt => opt.id !== id));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Certificate Settings</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your hospital's certificate offerings and service fees.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus size={20} />
          Add New Certificate
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Certificate Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Processing Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600"><FileText size={18} /></div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{cert.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-200">{cert.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                      <Clock size={14} className="text-slate-400" />
                      <span>{cert.days}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cert.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEditClick(cert)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setCertificates(certificates.filter(c => c.id !== cert.id))}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD NEW CERTIFICATE MODAL --- */}
      {isAddModalOpen && (
        <Modal 
          title="Add New Certificate" 
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSubmit}
          formData={formData}
          setFormData={setFormData}
          subOptions={subOptions}
          addSubOption={addSubOption}
          removeSubOption={removeSubOption}
        />
      )}

      {/* --- EDIT CERTIFICATE MODAL --- */}
      {isEditModalOpen && (
        <Modal 
          title="Edit Certificate" 
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateSubmit}
          formData={editFormData}
          setFormData={setEditFormData}
          subOptions={subOptions}
          addSubOption={addSubOption}
          removeSubOption={removeSubOption}
          isEdit
        />
      )}
    </div>
  );
};

// --- Reusable Modal Component to keep code clean ---
const Modal = ({ title, onClose, onSubmit, formData, setFormData, subOptions, addSubOption, removeSubOption, isEdit = false }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><X size={20} /></button>
      </div>

      <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Certificate Name</label>
            <input 
              required type="text" value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-emerald-500/20" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Base Fee (₱)</label>
            <input 
              required type="number" value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-emerald-500/20" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Processing Time</label>
              <input 
                required type="text" value={formData.days}
                onChange={(e) => setFormData({...formData, days: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-emerald-500/20" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none appearance-none"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sub-options Dynamic Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Sub-options / Add-ons</h4>
            <button type="button" onClick={addSubOption} className="text-xs flex items-center gap-1.5 text-emerald-600 font-bold hover:underline">
              <PlusCircle size={14} /> Add Row
            </button>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left font-bold uppercase text-[10px]">Option Name</th>
                  <th className="px-4 py-2 text-left font-bold uppercase text-[10px]">Option Type</th>
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subOptions.map((option: any) => (
                  <tr key={option.id}>
                    <td className="p-2"><input type="text" placeholder="e.g. Documentary Stamp" className="w-full bg-transparent border-none focus:ring-0" /></td>
                    <td className="p-2">
                      <select className="w-full bg-transparent border-none focus:ring-0">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                      </select>
                    </td>
                    <td className="p-2 text-center">
                      <button type="button" onClick={() => removeSubOption(option.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20">
            {isEdit ? 'Update Certificate' : 'Save Certificate'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default SettingsSetup;