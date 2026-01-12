import { ParsedDoc } from '../types';

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const generateStandaloneHtml = (doc: ParsedDoc): string => {
  const sectionsHtml = doc.sections.map((section, index) => {
    // Determine previous and next sections for navigation
    const prevSection = index > 0 ? doc.sections[index - 1] : null;
    const nextSection = index < doc.sections.length - 1 ? doc.sections[index + 1] : null;

    // We need to render markdown to HTML here for the static export.
    return `
      <div id="section-${section.id}" class="section-content ${index === 0 ? '' : 'hidden'}">
        <header class="mb-8 pb-4">
           <h1 class="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight mb-6">${escapeHtml(section.title)}</h1>
           <!-- Option A: Aurora Gradient (Full Width, Thinner 1.5px) -->
           <div class="h-[1.5px] w-full rounded-full bg-gradient-to-r from-[#5ABDAC] to-transparent"></div>
        </header>
        
        <div class="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-[#5ABDAC] hover:prose-a:text-[#7CD4C6] prose-h2:border-none prose-h2:pb-2">
          <div class="markdown-raw hidden">${escapeHtml(section.content)}</div>
          <div class="markdown-rendered"></div>
        </div>

        <!-- Navigation Footer -->
        <div class="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-800/60">
            <!-- Previous Button -->
            <div class="flex justify-start">
                ${prevSection ? `
                <button onclick="switchSection('${prevSection.id}')" class="group w-full md:w-auto min-w-[200px] flex flex-col items-start p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-800/80 hover:border-[#5ABDAC]/30 transition-all duration-300 text-left">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-[#5ABDAC] transition-colors">Previous</span>
                    <div class="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors w-full">
                        <svg class="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-[#5ABDAC] transition-colors transform group-hover:-translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span class="text-lg font-semibold truncate max-w-[200px] md:max-w-[300px]">${escapeHtml(prevSection.title)}</span>
                    </div>
                </button>
                ` : ''}
            </div>
            
            <!-- Next Button -->
            <div class="flex justify-end">
                 ${nextSection ? `
                <button onclick="switchSection('${nextSection.id}')" class="group w-full md:w-auto min-w-[200px] flex flex-col items-end p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-800/80 hover:border-[#5ABDAC]/30 transition-all duration-300 text-right">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-[#5ABDAC] transition-colors">Next</span>
                    <div class="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors w-full justify-end">
                        <span class="text-lg font-semibold truncate max-w-[200px] md:max-w-[300px]">${escapeHtml(nextSection.title)}</span>
                        <svg class="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-[#5ABDAC] transition-colors transform group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
                ` : ''}
            </div>
        </div>
      </div>
    `;
  }).join('');

  // Define styling constants for consistency between initial render and JS updates
  const btnBaseClass = "w-full text-left px-2 py-1.5 rounded-md text-sm transition-all duration-200 group flex items-center justify-between";
  const btnActiveExtra = "bg-[#5ABDAC]/10 text-[#5ABDAC] font-medium ring-1 ring-[#5ABDAC]/30";
  const btnInactiveExtra = "text-slate-400 hover:bg-slate-800 hover:text-slate-200";

  const sidebarItemsHtml = doc.sections.map((section, index) => `
    <li>
      <button
        onclick="switchSection('${section.id}')"
        id="btn-${section.id}"
        class="${btnBaseClass} ${index === 0 ? btnActiveExtra : btnInactiveExtra}"
      >
        <span class="truncate">${escapeHtml(section.title)}</span>
      </button>
    </li>
  `).join('');

  const displayFileName = doc.fileName.replace(/\.[^/.]+$/, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(displayFileName)} - DocuFlow Export</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: { primary: '#0f172a', accent: '#5ABDAC' },
            fontFamily: { sans: ['Inter', 'sans-serif'] }
          }
        }
      }
    </script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      body { font-family: 'Inter', sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; }
      .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #475569; }
      
      /* Layout split */
      .layout-container { display: flex; height: 100vh; overflow: hidden; width: 100%; }
      .sidebar { width: 350px; background-color: #0f172a; display: flex; flex-direction: column; flex-shrink: 0; }
      .main-content { flex: 1; overflow-y: auto; background-color: #020617; padding: 3rem; min-width: 0; scroll-behavior: smooth; }
      
      /* Specific Styling Overrides for Export */
      
      /* Headings */
      .prose h2 { 
          color: #5ABDAC !important; 
          font-size: 1.35em !important; 
          margin-top: 1.2em !important; 
          margin-bottom: 0.5em !important; 
      }
      .prose h3 { 
          color: #4A9E92 !important; 
          font-size: 1.15em !important; 
          margin-top: 1.0em !important; 
          margin-bottom: 0.4em !important; 
      }
      .prose h4 {
          font-size: 1.0em !important;
          margin-top: 1.0em !important;
          margin-bottom: 0.4em !important;
      }

      /* Bold Text */
      .prose strong, .prose b {
          color: #5ABDAC !important;
          font-weight: 700 !important;
      }
      
      /* Links */
      .prose a {
          color: #5ABDAC !important;
          text-decoration-color: rgba(90, 189, 172, 0.3) !important;
      }
      .prose a:hover {
          color: #7CD4C6 !important;
      }
      
      /* Blockquotes - FIX: Remove default quotes and style border */
      .prose blockquote {
          border-left-color: #5ABDAC !important;
          border-left-width: 2px !important;
          font-style: normal !important;
          quotes: none !important;
          color: #94a3b8 !important;
      }
      .prose blockquote p:first-of-type::before { content: none !important; }
      .prose blockquote p:last-of-type::after { content: none !important; }

      /* Callout Styles for Exported HTML */
      .callout {
        border-left-width: 4px !important;
        border-radius: 0 0.25rem 0.25rem 0;
        padding: 1rem !important;
        margin-top: 1.5rem !important;
        margin-bottom: 1.5rem !important;
        font-size: 0.875rem !important;
        background-color: rgba(30, 41, 59, 0.5); /* Default fallback */
      }
      .callout-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        text-transform: capitalize;
        opacity: 0.9;
      }
      
      .callout-note { border-color: #3b82f6 !important; background-color: rgba(59, 130, 246, 0.1) !important; color: #bfdbfe !important; }
      .callout-tip { border-color: #22c55e !important; background-color: rgba(34, 197, 94, 0.1) !important; color: #bbf7d0 !important; }
      .callout-important { border-color: #a855f7 !important; background-color: rgba(168, 85, 247, 0.1) !important; color: #e9d5ff !important; }
      .callout-warning { border-color: #f59e0b !important; background-color: rgba(245, 158, 11, 0.1) !important; color: #fde68a !important; }
      .callout-caution { border-color: #ef4444 !important; background-color: rgba(239, 68, 68, 0.1) !important; color: #fecaca !important; }

      /* Inline Code */
      .prose code {
          color: #5ABDAC !important;
      }
      .prose code::before { content: none !important; }
      .prose code::after { content: none !important; }

      /* Body Text & Spacing */
      .prose p { 
          margin-bottom: 0.6em !important; 
          margin-top: 0.6em !important; 
          line-height: 1.7 !important; 
          font-size: 0.95em !important;
      }
      
      /* List Styling */
      .prose ul, .prose ol { 
          margin-bottom: 0.8em !important; 
          margin-top: 0.4em !important;
          margin-left: 0.5rem !important;
          padding-left: 1.5rem !important;
          border-left: none !important;
          font-size: 0.95em !important;
      }
      
      /* Nested List Styling */
      .prose li > ul, .prose li > ol { 
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
          border-left: 1px solid #334155 !important;
          padding-left: 3rem !important;
          margin-left: -1.25rem !important;
      }

      .prose li { 
          margin-top: 0.2em !important; 
          margin-bottom: 0.2em !important; 
          line-height: 1.6 !important;
          padding-left: 0.5rem !important;
      }

      /* Table Styling */
      .prose table { 
          width: 100%; 
          text-align: left; 
          border-collapse: collapse; 
          border-radius: 0.5rem; 
          overflow: hidden;
          margin-bottom: 2em; 
          border: 1px solid #334155;
          font-size: 0.9em;
      }
      .prose thead th { 
          background-color: #1e293b; 
          color: #f1f5f9; 
          font-weight: 600; 
          padding: 0.75rem 1rem; 
          border-bottom: 2px solid #334155; 
      }
      .prose tbody td { 
          padding: 0.75rem 1rem; 
          color: #cbd5e1; 
          border-bottom: 1px solid #1e293b; 
          vertical-align: top;
          white-space: pre-wrap;
          line-height: 1.6rem;
      }
      .prose tbody td br {
          display: block;
          content: " " !important;
          margin-top: 2rem !important;
          margin-bottom: 0 !important;
          line-height: 0 !important;
      }
      .prose tbody tr:last-child td { border-bottom: none; }
      .prose tbody tr:nth-child(even) { background-color: #0f172a; }
      .prose tbody tr:nth-child(odd) { background-color: rgba(30, 41, 59, 0.4); }

      /* Resize Handle */
      .resizer { 
        width: 1px; 
        background: #1e293b; 
        cursor: col-resize; 
        transition: background 0.2s, width 0.2s;
        flex-shrink: 0;
        z-index: 10;
      }
      .resizer:hover, .resizer.resizing { background: #5ABDAC; width: 3px; }

      @media (max-width: 768px) {
        .layout-container { flex-direction: column; }
        .sidebar { width: 100% !important; height: auto; max-height: 30vh; border-right: none; border-bottom: 1px solid #1e293b; }
        .main-content { padding: 1.5rem; }
        .resizer { display: none; }
      }
    </style>
</head>
<body>
    <div class="layout-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="p-4 border-b border-slate-800 bg-slate-900">
                <div class="flex items-center gap-3 text-slate-100">
                    <h1 class="font-bold text-xl tracking-tight leading-tight break-words">${escapeHtml(displayFileName)}</h1>
                </div>
            </div>
            <nav class="flex-1 overflow-y-auto custom-scrollbar p-2">
                <ul class="space-y-0.5">
                    ${sidebarItemsHtml}
                </ul>
            </nav>
        </aside>

        <!-- Resizer Handle -->
        <div class="resizer"></div>

        <!-- Main Content -->
        <main class="main-content custom-scrollbar">
            ${sectionsHtml}
        </main>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            marked.use({ breaks: true, gfm: true });
            
            // Process Callouts/Alerts and render Markdown
            const rawDivs = document.querySelectorAll('.markdown-raw');
            rawDivs.forEach(div => {
                const raw = div.textContent; 
                let rendered = marked.parse(raw);
                div.nextElementSibling.innerHTML = rendered;
            });

            // Post-processing for Callouts styling
            // This script converts blockquotes that start with [!NOTE] etc. into styled divs
            document.querySelectorAll('.markdown-rendered blockquote').forEach(bq => {
                const firstP = bq.querySelector('p');
                if (!firstP) return;
                
                const text = firstP.textContent.trim();
                // Check for GitHub Alert syntax
                const match = text.match(/^\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\\]/i);
                
                if (match) {
                    const type = match[1].toLowerCase();
                    const titleText = type.charAt(0).toUpperCase() + type.slice(1);
                    
                    // Add classes
                    bq.classList.add('callout', 'callout-' + type);
                    
                    // Clean up text content in the paragraph to remove the tag
                    const newText = firstP.innerHTML.replace(/^\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\\]/i, '').trim();
                    firstP.innerHTML = newText;

                    // Insert Title
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'callout-title';
                    // Simple icons using SVG
                    let iconSvg = '';
                    if (type === 'note') iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
                    if (type === 'tip') iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a6 6 0 0 0-6 6c0 1.9 1 3.7 2.5 5 1.5 1.3 2.5 3 2.5 5h2c0-2 1-3.7 2.5-5C14 11.7 15 9.9 15 8a6 6 0 0 0-6-6z"></path><path d="M9 22h6"></path></svg>';
                    if (type === 'important') iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                    if (type === 'warning') iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
                    if (type === 'caution') iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3"></path></svg>';
                    
                    titleDiv.innerHTML = iconSvg + '<span>' + titleText + '</span>';
                    bq.insertBefore(titleDiv, firstP);
                }
            });

            hljs.highlightAll();

            // Resizing Logic
            const resizer = document.querySelector('.resizer');
            const sidebar = document.querySelector('.sidebar');
            let isResizing = false;

            if (resizer && sidebar) {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    resizer.classList.add('resizing');
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                });

                document.addEventListener('mousemove', (e) => {
                    if (!isResizing) return;
                    let newWidth = e.clientX;
                    if (newWidth < 200) newWidth = 200;
                    if (newWidth > 800) newWidth = 800;
                    sidebar.style.width = newWidth + 'px';
                });

                document.addEventListener('mouseup', () => {
                    if (isResizing) {
                        isResizing = false;
                        resizer.classList.remove('resizing');
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                    }
                });
            }
        });

        function switchSection(id) {
            document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('section-' + id).classList.remove('hidden');
            const mainContent = document.querySelector('.main-content');
            if (mainContent) mainContent.scrollTop = 0;

            const baseClass = "${btnBaseClass}";
            const activeClass = "${btnActiveExtra}";
            const inactiveClass = "${btnInactiveExtra}";

            document.querySelectorAll('button[id^="btn-"]').forEach(btn => {
                btn.className = baseClass + " " + inactiveClass;
            });
            const activeBtn = document.getElementById('btn-' + id);
            if (activeBtn) activeBtn.className = baseClass + " " + activeClass;
        }
    </script>
</body>
</html>`;
};