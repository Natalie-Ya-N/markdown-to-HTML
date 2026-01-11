import React, { useState, useRef, useEffect } from 'react';
import { ParsedDoc } from './types';
import { parseMarkdownByH1 } from './utils/markdownUtils';
import { generateStandaloneHtml } from './utils/exportUtils';
import Sidebar from './components/Sidebar';
import MarkdownRenderer from './components/MarkdownRenderer';
import { UploadCloud, Menu, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [doc, setDoc] = useState<ParsedDoc | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle Resize Events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 250) newWidth = 250;
      if (newWidth > 600) newWidth = 600;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const sections = parseMarkdownByH1(text);
      
      setDoc({
        fileName: file.name,
        sections: sections
      });

      if (sections.length > 0) {
        setActiveSectionId(sections[0].id);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReset = () => {
    setDoc(null);
    setActiveSectionId(null);
    setSidebarOpen(false);
  };

  const handleDownload = () => {
    if (!doc) return;
    const htmlContent = generateStandaloneHtml(doc);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.fileName.replace(/\.[^/.]+$/, '')}-export.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeSection = doc?.sections.find(s => s.id === activeSectionId);

  // If no document is loaded, show upload screen (Dark Mode)
  if (!doc) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-white tracking-tight">DocuFlow</h1>
            <p className="text-slate-400 text-xl font-light">Transform Markdown into dark-themed HTML</p>
          </div>
          
          <div className="bg-[#0f172a] p-12 rounded-3xl shadow-2xl border border-slate-800 transition-all hover:border-[#5ABDAC]/50 hover:shadow-[#5ABDAC]/20 group">
            <label className="flex flex-col items-center cursor-pointer">
              <div className="w-20 h-20 bg-slate-800/50 text-[#5ABDAC] rounded-3xl flex items-center justify-center mb-6 group-hover:bg-[#5ABDAC]/10 group-hover:scale-110 transition-all duration-300 ring-1 ring-slate-700 group-hover:ring-[#5ABDAC]/50">
                <UploadCloud size={40} />
              </div>
              <span className="text-xl font-semibold text-slate-200 group-hover:text-[#5ABDAC] transition-colors">Select Markdown File</span>
              <span className="text-sm text-slate-500 mt-3 font-medium">".md" files only</span>
              <input 
                type="file" 
                accept=".md,.markdown,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
          
          <div className="flex gap-6 justify-center text-xs text-slate-500 font-medium tracking-wide uppercase">
             <span>Dark Mode</span> &bull; <span>Sidebar TOC</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-slate-800 z-30 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-md"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-200 truncate max-w-[200px]">{doc.fileName.replace(/\.[^/.]+$/, "")}</span>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 md:static transform transition-transform duration-300 md:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: isSidebarOpen ? '85%' : `${sidebarWidth}px` }}
      >
        <Sidebar 
          sections={doc.sections} 
          activeSectionId={activeSectionId || ''} 
          onSelectSection={setActiveSectionId}
          fileName={doc.fileName.replace(/\.[^/.]+$/, "")}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          onReset={handleReset}
          onDownload={handleDownload}
        />
      </div>

      {/* Resizer Handle - Updated hover color */}
      <div
        className="hidden md:block w-px hover:w-[3px] bg-slate-800 hover:bg-[#5ABDAC] cursor-col-resize transition-all duration-200 z-20 flex-shrink-0"
        onMouseDown={startResizing}
      />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-[#020617] pt-16 md:pt-0 relative scroll-smooth">
        {activeSection ? (
          <div className="w-full h-full px-8 py-12 md:px-12 md:py-16 mx-auto">
            {/* Page Header */}
            <header className="mb-12 pb-8 max-w-full">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-6 break-words">
                {activeSection.title}
              </h1>
              {/* Option A: Aurora Gradient (Full Width, Thinner 1.5px) */}
              <div className="h-[1.5px] w-full rounded-full bg-gradient-to-r from-[#5ABDAC] to-transparent"></div>
            </header>
            
            {/* Markdown Content - Removed 'prose' wrapper to avoid style conflicts */}
            <div className="w-full max-w-none text-slate-300">
              <MarkdownRenderer content={activeSection.content} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p className="text-xl">Select a section to start reading</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;