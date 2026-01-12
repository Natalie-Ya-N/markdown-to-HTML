import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { visit } from 'unist-util-visit';
import { Info, AlertTriangle, AlertCircle, Flame, Lightbulb } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

// Remark plugin to detect [!NOTE], [!TIP], etc. in blockquotes
const remarkAlerts = () => {
  return (tree: any) => {
    visit(tree, 'blockquote', (node: any) => {
      if (!node.children || node.children.length === 0) return;
      const firstChild = node.children[0];
      // We look for a paragraph as the first child
      if (firstChild.type !== 'paragraph' || !firstChild.children || firstChild.children.length === 0) return;
      
      const firstTextNode = firstChild.children[0];
      if (firstTextNode.type !== 'text') return;
      
      const content = firstTextNode.value;
      const alertMatch = content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
      
      if (alertMatch) {
        const alertType = alertMatch[1].toUpperCase();
        // Add data attribute to the blockquote node properties
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties['data-alert-type'] = alertType;
        
        // Remove the [!TYPE] text from the node content
        // This ensures the rendered text doesn't show the raw tag
        const newText = content.replace(alertMatch[0], '').trimStart();
        
        // Update the text node value
        if (!newText && firstChild.children.length === 1) {
             // If the text node was the only child and is now empty, we empty it
             // React Markdown handles empty text nodes fine
             firstTextNode.value = '';
        } else {
             firstTextNode.value = newText;
        }
      }
    });
  };
};

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
          padding-left: 3rem;
          margin-left: -1.25rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        /* Table cell spacing */
        .markdown-body td br {
          display: block;
          margin-top: 3rem !important;
          content: " " !important;
          line-height: 0;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkAlerts]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({node, ...props}) => <h1 className="hidden" {...props} />, 
          h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold text-[#5ABDAC] mt-10 mb-5 pb-2 tracking-tight" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-semibold text-[#4A9E92] mt-8 mb-3" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-base md:text-lg font-semibold text-slate-300 mt-6 mb-2" {...props} />,
          p: ({node, ...props}) => <p className="text-base leading-7 text-slate-300 mb-5" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-[#5ABDAC]" {...props} />,
          b: ({node, ...props}) => <b className="font-bold text-[#5ABDAC]" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-outside mb-5 text-slate-300 space-y-1.5 text-base marker:text-slate-500" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside mb-5 text-slate-300 space-y-1.5 text-base marker:text-slate-500" {...props} />,
          li: ({node, ...props}) => <li className="pl-2 leading-7" {...props} />,
          
          // Enhanced Blockquote / Callout Handler
          blockquote: ({node, className, children, ...props}) => {
            const alertType = props['data-alert-type'] as string | undefined;

            if (alertType) {
              let styles = "border-l-4 rounded-r p-4 my-6 text-sm ";
              let title = alertType;
              let Icon = Info;
              
              switch (alertType) {
                case 'NOTE':
                  styles += "border-blue-500 bg-blue-500/10 text-blue-200";
                  Icon = Info;
                  title = "Note";
                  break;
                case 'TIP':
                  styles += "border-green-500 bg-green-500/10 text-green-200";
                  Icon = Lightbulb;
                  title = "Tip";
                  break;
                case 'IMPORTANT':
                  styles += "border-purple-500 bg-purple-500/10 text-purple-200";
                  Icon = AlertCircle;
                  title = "Important";
                  break;
                case 'WARNING':
                  styles += "border-amber-500 bg-amber-500/10 text-amber-200";
                  Icon = AlertTriangle;
                  title = "Warning";
                  break;
                case 'CAUTION':
                  styles += "border-red-500 bg-red-500/10 text-red-200";
                  Icon = Flame;
                  title = "Caution";
                  break;
                default:
                  styles += "border-slate-500 bg-slate-800/50 text-slate-300";
              }

              return (
                <div className={styles} {...props}>
                  <div className="flex items-center gap-2 mb-2 font-bold opacity-90">
                    <Icon size={18} />
                    <span>{title}</span>
                  </div>
                  <div className="opacity-90 [&>p]:mb-0 [&>p:first-child]:mt-0">
                    {children}
                  </div>
                </div>
              );
            }

            // Default blockquote
            return (
              <blockquote className="border-l-2 border-[#5ABDAC] bg-slate-800/50 pl-5 py-3 my-6 rounded-r text-slate-400 text-sm shadow-sm italic" {...props}>
                {children}
              </blockquote>
            );
          },
          
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