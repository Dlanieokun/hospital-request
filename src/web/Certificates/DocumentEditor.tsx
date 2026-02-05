import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, Printer, Save, Clipboard, Minus, Plus, 
  List, ListOrdered, Image as ImageIcon, Table as TableIcon, 
  Link as LinkIcon
} from 'lucide-react';

const DocumentEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [zoom, setZoom] = useState(100);
  const [wordCount, setWordCount] = useState(0);
  const [docName, setDocName] = useState("Document1");

  // Initial setup for the editing engine
  useEffect(() => {
    document.execCommand('defaultParagraphSeparator', false, 'p');
    editorRef.current?.focus();
  }, []);

  // --- Executive Commands ---
  const handleAction = (cmd: string, val?: string) => {
    // Forces browser to use HTML tags instead of inline CSS spans
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    const text = editorRef.current?.innerText || "";
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  // --- Insert Logic ---
  const insertTable = () => {
    const rows = parseInt(prompt("Rows:", "3") || "0");
    const cols = parseInt(prompt("Columns:", "3") || "0");
    if (rows > 0 && cols > 0) {
      let table = `<table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; margin: 10px 0;">`;
      for (let i = 0; i < rows; i++) {
        table += `<tr>`;
        for (let j = 0; j < cols; j++) {
          table += `<td style="border: 1px solid #ccc; padding: 8px; min-width: 50px; height: 25px;">&nbsp;</td>`;
        }
        table += `</tr>`;
      }
      table += `</table><p><br></p>`;
      handleAction('insertHTML', table);
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; display: block; margin: 10px auto;" />`;
      handleAction('insertHTML', imgHtml);
    }
  };

  const saveDoc = () => {
    const content = editorRef.current?.innerHTML || "";
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${docName}.html`;
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-[#808080] overflow-hidden font-sans select-none">
      
      {/* 1. Ribbon Header */}
      <header className="bg-[#E3EBF6] border-b border-[#A3B4C9] shrink-0 print:hidden">
        {/* Tab Row */}
        <div className="flex items-center text-[11px] px-2 pt-1 gap-1">
          <div className="flex gap-3 px-2 border-r border-[#A3B4C9] mr-2 text-[#2B579A]">
             <span title="Save as HTML" className="cursor-pointer hover:opacity-70" onClick={saveDoc}>
                <Save size={14} />
             </span>
             <span title="Print" className="cursor-pointer hover:opacity-70" onClick={() => window.print()}>
                <Printer size={14} />
             </span>
          </div>
          {['File', 'Home', 'Insert', 'Page Layout'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 outline-none transition-colors ${
                activeTab === tab 
                ? 'bg-[#F5F8FD] border-t border-x border-[#A3B4C9] rounded-t font-semibold text-[#3B5A82]' 
                : 'text-gray-700 hover:bg-white/40'
              }`}
            >
              {tab}
            </button>
          ))}
          
          {/* Added Document Name Input to use docName/setDocName */}
          <input 
            className="ml-4 bg-transparent border-none text-[#2B579A] font-bold focus:outline-none focus:bg-white/30 px-2 rounded"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />

          <div className="ml-auto pr-4 text-[10px] text-gray-400 italic font-medium opacity-50 uppercase tracking-widest">Microsoft Word 2010</div>
        </div>

        {/* Toolbar Content */}
        <div className="bg-[#F5F8FD] h-24 border-b border-[#A3B4C9] flex p-1 gap-1 shadow-inner overflow-x-auto">
          
          {/* HOME TAB */}
          {activeTab === 'Home' && (
            <div className="flex gap-1 animate-in fade-in duration-300">
              <RibbonGroup label="Clipboard">
                <button onClick={() => alert("Please use Ctrl+V to paste safely.")} className="flex flex-col items-center hover:bg-blue-100 p-1 rounded min-w-[50px]">
                  <Clipboard size={28} className="text-blue-800" />
                  <span className="text-[10px]">Paste</span>
                </button>
              </RibbonGroup>

              <RibbonGroup label="Font">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <select className="text-[10px] border border-gray-300 h-5 w-24 bg-white outline-none"><option>Calibri</option><option>Arial</option></select>
                    <select className="text-[10px] border border-gray-300 h-5 w-10 bg-white outline-none"><option>11</option><option>12</option></select>
                  </div>
                  <div className="flex gap-0.5">
                    <ToolbarBtn icon={<Bold size={14}/>} onClick={() => handleAction('bold')} />
                    <ToolbarBtn icon={<Italic size={14}/>} onClick={() => handleAction('italic')} />
                    <ToolbarBtn icon={<Underline size={14}/>} onClick={() => handleAction('underline')} />
                  </div>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Paragraph">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <ToolbarBtn icon={<List size={14}/>} onClick={() => handleAction('insertUnorderedList')} />
                    <ToolbarBtn icon={<ListOrdered size={14}/>} onClick={() => handleAction('insertOrderedList')} />
                  </div>
                  <div className="flex gap-0.5">
                    <ToolbarBtn icon={<AlignLeft size={14}/>} onClick={() => handleAction('justifyLeft')} />
                    <ToolbarBtn icon={<AlignCenter size={14}/>} onClick={() => handleAction('justifyCenter')} />
                    <ToolbarBtn icon={<AlignRight size={14}/>} onClick={() => handleAction('justifyRight')} />
                  </div>
                </div>
              </RibbonGroup>
            </div>
          )}

          {/* INSERT TAB */}
          {activeTab === 'Insert' && (
            <div className="flex gap-1 animate-in fade-in duration-300">
              <RibbonGroup label="Tables">
                <button onClick={insertTable} className="flex flex-col items-center hover:bg-blue-100 p-1 rounded min-w-[50px]">
                  <TableIcon size={28} className="text-blue-700" />
                  <span className="text-[10px]">Table</span>
                </button>
              </RibbonGroup>
              <RibbonGroup label="Illustrations">
                <button onClick={insertImage} className="flex flex-col items-center hover:bg-blue-100 p-1 rounded min-w-[50px]">
                  <ImageIcon size={28} className="text-green-700" />
                  <span className="text-[10px]">Picture</span>
                </button>
              </RibbonGroup>
              <RibbonGroup label="Links">
                <button onClick={() => {
                  const url = prompt("Enter URL:");
                  if(url) handleAction('createLink', url);
                }} className="flex flex-col items-center hover:bg-blue-100 p-1 rounded min-w-[50px]">
                  <LinkIcon size={28} className="text-blue-500" />
                  <span className="text-[10px]">Hyperlink</span>
                </button>
              </RibbonGroup>
            </div>
          )}
        </div>
      </header>

      {/* 2. The Page Canvas */}
      <main className="flex-1 overflow-auto p-12 flex flex-col items-center bg-[#A0A0A0] relative print:p-0 print:bg-white custom-scrollbar">
        <div 
          className="bg-white shadow-2xl transition-transform origin-top print:shadow-none print:m-0"
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '25.4mm', 
            transform: `scale(${zoom / 100})`,
            marginBottom: '100px'
          }}
        >
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="outline-none min-h-[240mm] text-left cursor-text word-content"
            style={{ 
              fontFamily: 'Calibri, sans-serif', 
              fontSize: '11pt', 
              lineHeight: '1.2',
              color: 'black'
            }}
            suppressContentEditableWarning
          />
        </div>
      </main>

      {/* 3. Status Bar */}
      <footer className="bg-[#2B579A] h-6 flex items-center justify-between px-3 text-white text-[11px] shrink-0 print:hidden">
        <div className="flex gap-4 items-center">
          <span>Page 1 of 1</span>
          <span>{wordCount} words</span>
          <span className="hover:bg-white/20 px-1 cursor-pointer">English (U.S.)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Minus size={12} className="cursor-pointer" onClick={() => setZoom(Math.max(20, zoom - 10))} />
            <input 
              type="range" min="20" max="200" value={zoom} 
              onChange={(e) => setZoom(parseInt(e.target.value))} 
              className="w-24 accent-white h-1 bg-blue-400 rounded-lg appearance-none cursor-pointer" 
            />
            <Plus size={12} className="cursor-pointer" onClick={() => setZoom(Math.min(200, zoom + 10))} />
            <span className="w-8 text-right font-mono">{zoom}%</span>
          </div>
        </div>
      </footer>

      {/* Global CSS */}
      <style>{`
        .word-content ul { list-style-type: disc; padding-left: 40px; margin: 12px 0; }
        .word-content ol { list-style-type: decimal; padding-left: 40px; margin: 12px 0; }
        .word-content li { display: list-item; margin-bottom: 4px; }
        .word-content table { border-collapse: collapse; margin: 15px 0; width: 100%; }
        .word-content table td { border: 1px solid #ccc; padding: 8px; }
        
        @media print {
          body { background: white !important; }
          header, footer { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; display: block !important; }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #808080; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border: 3px solid #808080; border-radius: 10px; }
      `}</style>
    </div>
  );
};

// --- Atomic Ribbon Components ---

const RibbonGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="flex flex-col border-r border-gray-300 px-2 h-full justify-between items-center pb-0.5 min-w-[60px]">
    <div className="flex items-center gap-1 h-full">{children}</div>
    <span className="text-[9px] text-gray-400 uppercase tracking-tighter mt-1">{label}</span>
  </div>
);

const ToolbarBtn = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="p-1 hover:bg-orange-100 border border-transparent hover:border-orange-300 rounded transition-all"
  >
    {icon}
  </button>
);

export default DocumentEditor;