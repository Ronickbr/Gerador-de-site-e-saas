import React, { useEffect, useRef } from 'react';
import { DeviceType } from '../types';

interface PreviewFrameProps {
  html: string;
  device: DeviceType;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ html, device }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      // Direct srcDoc is usually safer/faster for this use case than writing to document
      // We add a base tag to ensure relative links (if any) don't break the app, 
      // though we expect AI to use absolute CDNs.
      iframeRef.current.srcdoc = html;
    }
  }, [html]);

  const getWidth = () => {
    switch (device) {
      case DeviceType.MOBILE: return '375px';
      case DeviceType.TABLET: return '768px';
      default: return '100%';
    }
  };

  const getHeight = () => {
     // Desktop full height, others fixed aspect simulation
     return '100%';
  };

  return (
    <div className="flex-1 bg-gray-900 flex justify-center items-start overflow-hidden relative h-full w-full p-4">
      <div 
        className={`transition-all duration-300 ease-in-out bg-white shadow-2xl relative ${device !== DeviceType.DESKTOP ? 'rounded-2xl border-8 border-gray-800' : 'w-full h-full'}`}
        style={{ 
          width: getWidth(), 
          height: device !== DeviceType.DESKTOP ? '85vh' : '100%' 
        }}
      >
        {device !== DeviceType.DESKTOP && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10 flex justify-center items-center">
             <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full h-full bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{ border: 'none', borderRadius: device !== DeviceType.DESKTOP ? '0.75rem' : '0' }}
        />
      </div>
    </div>
  );
};

export default PreviewFrame;