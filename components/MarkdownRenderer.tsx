import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body w-full">
      <style>{`
        /* Base list styles - Top Level */
        .markdown-body ul, .markdown-body ol {
          margin-left: 0.5rem;
          padding-left: 1.5rem;
        }
        
        /* Nested lists get the guide line */
        .markdown-body li > ul, .markdown-body li > ol {
          border-left: 1px solid #334155;
          padding-left: 3rem; /* Increased indentation to 3rem */
          margin-left: -1.25rem; /* Align with parent bullet */
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        /* Table cell spacing: Distinguish explicit newlines from wrapped lines */
        /* Using !important to ensure this overrides any browser or parent styles */
        .markdown-body td br {
          display: block;
          margin-top: 3rem !important; /* Significantly increased spacing for explicit breaks */
          content: " " !important; /* Ensure content exists for block rendering */
          line-height: 0;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({node, ...props}) => <h1 className="hidden" {...props} />, // H1 is handled by the page header
          // Reduced H2 from text-2xl to text-xl
          h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold text-[#5ABDAC] mt-10 mb-5 pb-2 tracking-tight" {...props} />,
          // Reduced H3 from text-xl to text-lg
          h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-semibold text-[#4A9E92] mt-8 mb-3" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-base md:text-lg font-semibold text-slate-300 mt-6 mb-2" {...props} />,
          // Reduced P from text-lg to text-base (16px) for a neater look
          p: ({node, ...props}) => <p className="text-base leading-7 text-slate-300 mb-5" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-[#5ABDAC]" {...props} />,
          b: ({node, ...props}) => <b className="font-bold text-[#5ABDAC]" {...props} />,
          // Reduced list text from text-lg to text-base
          ul: ({node, ...props}) => <ul className="list-disc list-outside mb-5 text-slate-300 space-y-1.5 text-base marker:text-slate-500" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside mb-5 text-slate-300 space-y-1.5 text-base marker:text-slate-500" {...props} />,
          li: ({node, ...props}) => <li className="pl-2 leading-7" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-[#5ABDAC] bg-slate-800/50 pl-5 py-3 my-6 rounded-r italic text-slate-400 text-sm shadow-sm" {...props} />
          ),
          a: ({node, ...props}) => <a className="text-[#5ABDAC] hover:text-[#7CD4C6] underline transition-colors decoration-[#5ABDAC]/30 underline-offset-4" target="_blank" rel="noopener noreferrer" {...props} />,
          code: ({node, className, children, ...props}) => {
             const match = /language-(\w+)/.exec(className || '')
             const isInline = !match && String(children).indexOf('\n') === -1;
             
             if (isInline) {
                 return <code className="bg-slate-800 text-[#5ABDAC] rounded px-1.5 py-0.5 text-sm font-mono border border-slate-700" {...props}>{children}</code>
             }

             return (
               <div className="relative group my-6">
                 <pre className="bg-[#0d1117] text-slate-200 p-5 rounded-xl overflow-x-auto text-sm leading-relaxed border border-slate-800 shadow-2xl">
                   <code className={className} {...props}>
                     {children}
                   </code>
                 </pre>
               </div>
             )
          },
          table: ({node, ...props}) => <div className="overflow-x-auto mb-6 border border-slate-800 rounded-xl shadow-lg"><table className="min-w-full divide-y divide-slate-800" {...props} /></div>,
          thead: ({node, ...props}) => <thead className="bg-slate-900" {...props} />,
          th: ({node, ...props}) => <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider" {...props} />,
          tbody: ({node, ...props}) => <tbody className="bg-slate-900/50 divide-y divide-slate-800" {...props} />,
          td: ({node, ...props}) => <td className="px-5 py-3 align-top whitespace-pre-wrap text-sm text-slate-300 leading-6" {...props} />,
          img: ({node, ...props}) => <img className="max-w-full h-auto rounded-xl shadow-2xl my-6 mx-auto border border-slate-800" {...props} />,
          hr: ({node, ...props}) => <hr className="my-10 border-slate-800" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;