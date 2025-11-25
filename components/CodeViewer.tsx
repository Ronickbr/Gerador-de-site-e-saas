import React from 'react';
import { Icons } from './Icon';

interface CodeViewerProps {
  code: string;
  onClose: () => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm z-20 flex flex-col animate-fadeIn">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Icons.Code className="w-5 h-5 text-indigo-400" />
          Código Fonte
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-200 border border-gray-600/50 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
          >
            {copied ? <Icons.Check className="w-4 h-4 text-green-400" /> : <Icons.Layout className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
          >
            Fechar
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-gray-950">
        <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap break-all">
          {code}
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;