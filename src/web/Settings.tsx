import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Settings as SettingsIcon, 
  Users, FileText, UserPlus, AlertTriangle, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

// --- Interfaces ---
interface SubOption { 
  id: number; 
  name: string; 
  certificate_id?: number; 
}

interface SubQuestion { 
  id: number; 
  question: string; 
  type: string; 
  certificate_id?: number;
}

interface Certificate {
  id: number;
  name: string;
  fee: number;      
  days: number;     
  sub_questions: SubQuestion[]; 
  sub_options: SubOption[];     
}

interface Staff {
  id: number;
  name: string;
  email: string;
  role: string;
  username: string;
}

interface DeleteTarget {
  type: 'cert' | 'staff';
  item: Certificate | Staff;
}

const ITEMS_PER_PAGE = 5;

const SettingsSetup = () => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'staff'>('certificates');
  const [loading, setLoading] = useState(true);
  
  // --- SEARCH & PAGINATION STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // --- DATA STATES ---
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // --- UI/MODAL STATES ---
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // --- FORM & TARGET STATES ---
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [certFormData, setCertFormData] = useState({ id: 0, name: '', fee: 0, days: 0 });
  const [staffFormData, setStaffFormData] = useState({ 
    id: 0, name: '', email: '', role: 'Medical Staff', username: '', password: '', password_confirmation: '' 
  });
  const [subOptions, setSubOptions] = useState<SubOption[]>([]);
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([]);

  // --- API CONFIG ---
  const API_URL = 'http://127.0.0.1:8000/api';
  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/settings`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates || []);
        setStaffList(data.staff || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  // Reset pagination when switching tabs or typing in search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // --- FILTERING & PAGINATION LOGIC ---
  const getFilteredData = () => {
    if (activeTab === 'certificates') {
      return certificates.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return staffList.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- ACTIONS ---

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditMode ? 'PUT' : 'POST';
    const url = `${API_URL}/settings/certificates${isEditMode ? `/${certFormData.id}` : ''}`;
    const payload = { ...certFormData, sub_options: subOptions, sub_questions: subQuestions };

    try {
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.reload(); 
      }
    } catch (error) { console.error("Save failed:", error); }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (staffFormData.password !== staffFormData.password_confirmation) {
        alert("Passwords do not match!");
        return;
    }

    const method = isEditMode ? 'PUT' : 'POST';
    const url = `${API_URL}/settings/staff${isEditMode ? `/${staffFormData.id}` : ''}`;
    const payload: any = { ...staffFormData };
    
    if (isEditMode && !payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.message || "Operation failed");
      }
    } catch (error) { console.error("Staff save failed:", error); }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    const url = `${API_URL}/settings/${type === 'cert' ? 'certificates' : 'staff'}/${item.id}`;

    try {
      const response = await fetch(url, { method: 'DELETE', headers: getHeaders() });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) { console.error("Delete failed:", error); }
  };

  const openCertModal = (cert?: Certificate) => {
    setIsEditMode(!!cert);
    if (cert) {
      setCertFormData({ id: cert.id, name: cert.name, fee: cert.fee, days: cert.days });
      setSubOptions(cert.sub_options || []);
      setSubQuestions(cert.sub_questions || []);
    } else {
      setCertFormData({ id: 0, name: '', fee: 0, days: 0 });
      setSubOptions([]);
      setSubQuestions([]);
    }
    setIsCertModalOpen(true);
  };

  const openStaffModal = (staff?: Staff) => {
    setIsEditMode(!!staff);
    setStaffFormData(staff 
        ? { ...staff, password: '', password_confirmation: '' } as any 
        : { id: 0, name: '', email: '', role: 'Medical Staff', username: '', password: '', password_confirmation: '' }
    );
    setIsStaffModalOpen(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
            <SettingsIcon size={16} /> <span>System Administration</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configuration Center</h2>
        </div>

        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button onClick={() => setActiveTab('certificates')} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'certificates' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
            <FileText size={18} /> Certificates
          </button>
          <button onClick={() => setActiveTab('staff')} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'staff' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
            <Users size={18} /> Staff Members
          </button>
        </div>
      </div>

      {/* SEARCH AND ADD ACTION */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text"
                placeholder={`Search ${activeTab === 'certificates' ? 'certificates' : 'staff members'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
        </div>
        
        {activeTab === 'certificates' ? (
            <button onClick={() => openCertModal()} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                <Plus size={20} /> Add New Certificate
            </button>
        ) : (
            <button onClick={() => openStaffModal()} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                <UserPlus size={18} /> Invite Staff
            </button>
        )}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            {activeTab === 'certificates' ? (
                <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Certificate Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Fee</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                </tr>
            ) : (
                <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Staff Member</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Role</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeTab === 'certificates' ? (
                (paginatedData as Certificate[]).map(cert => (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-white">{cert.name}</td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-600">₱{cert.fee}</td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => openCertModal(cert)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => { setDeleteTarget({ type: 'cert', item: cert }); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                        </td>
                    </tr>
                ))
            ) : (
                (paginatedData as Staff[]).map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 border border-slate-200 dark:border-slate-700">{staff.name.charAt(0)}</div>
                            <div><p className="font-bold text-slate-700 dark:text-white">{staff.name}</p><p className="text-xs text-slate-400">@{staff.username}</p></div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{staff.role}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => openStaffModal(staff)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => { setDeleteTarget({ type: 'staff', item: staff }); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                        </td>
                    </tr>
                ))
            )}
            {paginatedData.length === 0 && (
                <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No records found matching your search.</td>
                </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">
                    Showing <span className="text-slate-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredData.length}</span> results
                </p>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center px-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {isCertModalOpen && (
        <CertModal 
          isEdit={isEditMode} onClose={() => setIsCertModalOpen(false)}
          formData={certFormData} setFormData={setCertFormData}
          subOptions={subOptions} setSubOptions={setSubOptions}
          subQuestions={subQuestions} setSubQuestions={setSubQuestions}
          onSubmit={handleCertSubmit}
        />
      )}

      {isStaffModalOpen && (
        <StaffModal 
          isEdit={isEditMode} onClose={() => setIsStaffModalOpen(false)}
          formData={staffFormData} setFormData={setStaffFormData}
          onSubmit={handleStaffSubmit}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-[2rem] p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Are you sure?</h3>
            <p className="text-slate-500 mb-6">Delete <span className="font-bold text-slate-900 dark:text-white">{deleteTarget?.item.name}</span>? This is permanent.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
              <button onClick={executeDelete} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-500/20">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const CertModal = ({ isEdit, onClose, formData, setFormData, subOptions, setSubOptions, subQuestions, setSubQuestions, onSubmit }: any) => {
  const addOption = () => setSubOptions([...subOptions, { id: Date.now(), name: '' }]);
  const addQuestion = () => setSubQuestions([...subQuestions, { id: Date.now(), question: '', type: 'text' }]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold">{isEdit ? 'Edit Certificate' : 'New Certificate'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Fee (₱)</label>
              <input required type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Days</label>
              <input required type="number" value={formData.days} onChange={e => setFormData({...formData, days: Number(e.target.value)})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800">
              <h4 className="font-bold">Add-ons</h4>
              <button type="button" onClick={addOption} className="text-xs text-emerald-600 font-bold">+ Add Row</button>
            </div>
            {subOptions.map((opt: any) => (
              <div key={opt.id} className="flex gap-2">
                <input required type="text" value={opt.name} onChange={e => setSubOptions(subOptions.map((o: any) => o.id === opt.id ? {...o, name: e.target.value} : o))} placeholder="Option Name" className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
                <button type="button" onClick={() => setSubOptions(subOptions.filter((o: any) => o.id !== opt.id))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800">
              <h4 className="font-bold">Questions</h4>
              <button type="button" onClick={addQuestion} className="text-xs text-indigo-600 font-bold">+ Add Row</button>
            </div>
            {subQuestions.map((q: any) => (
              <div key={q.id} className="flex gap-2">
                <input required type="text" value={q.question} onChange={e => setSubQuestions(subQuestions.map((sq: any) => sq.id === q.id ? {...sq, question: e.target.value} : sq))} placeholder="Label" className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
                <select value={q.type} onChange={e => setSubQuestions(subQuestions.map((sq: any) => sq.id === q.id ? {...sq, type: e.target.value} : sq))} className="w-24 px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none">
                  <option value="text">Text</option><option value="number">Number</option><option value="date">Date</option>
                </select>
                <button type="button" onClick={() => setSubQuestions(subQuestions.filter((sq: any) => sq.id !== q.id))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6 border-t dark:border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-bold">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StaffModal = ({ isEdit, onClose, formData, setFormData, onSubmit }: any) => {
    const isPasswordMatch = formData.password === formData.password_confirmation;
    const isPasswordValid = isEdit ? (formData.password === '' || isPasswordMatch) : (formData.password !== '' && isPasswordMatch);

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border animate-in zoom-in-95">
        <div className="px-6 py-4 border-b dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold">{isEdit ? 'Update Staff' : 'Invite Staff'}</h3>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-500"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none">
                        <option value="Medical Staff">Medical Staff</option>
                        <option value="Treasurer">Treasurer</option>
                        <option value="administrator">Administrator</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                    <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">{isEdit ? 'New Pwd' : 'Password'}</label>
                    <input required={!isEdit} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Confirm</label>
                    <input required={!isEdit || formData.password !== ''} type="password" value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} className={`w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none ${!isPasswordMatch && formData.password_confirmation ? 'border-rose-500' : 'border-slate-200'}`} />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={!isPasswordValid} className="flex-1 bg-indigo-600 disabled:bg-slate-300 text-white py-2.5 rounded-xl font-bold">Save Staff</button>
            </div>
        </form>
        </div>
    </div>
    );
}

export default SettingsSetup;