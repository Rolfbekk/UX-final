import { useState } from 'react';
import Image from 'next/image';

interface ScreenshotViewerProps {
  screenshots?: {
    desktop?: string;
    mobile?: string;
  };
  metadata?: {
    pageTitle?: string;
    loadTime?: number;
    pageSize?: number;
    technologies?: string[];
  };
}

export default function ScreenshotViewer({ screenshots, metadata }: ScreenshotViewerProps) {
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
  const [desktopError, setDesktopError] = useState(false);
  const [mobileError, setMobileError] = useState(false);

  if (!screenshots?.desktop && !screenshots?.mobile) {
    return null;
  }

  return (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Website Screenshots</h3>
        <div className="flex space-x-2">
          {screenshots.desktop && (
            <button
              onClick={() => setActiveView('desktop')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'desktop'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Desktop
            </button>
          )}
          {screenshots.mobile && (
            <button
              onClick={() => setActiveView('mobile')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'mobile'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Mobile
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 max-h-96 overflow-y-auto relative">
        {activeView === 'desktop' && screenshots.desktop && (
          <div className="relative">
            {!desktopError ? (
              <Image
                src={screenshots.desktop}
                alt="Desktop screenshot"
                width={1920}
                height={1080}
                className="w-full rounded-lg border border-white/20 shadow-lg"
                onError={() => setDesktopError(true)}
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-black/30 rounded-lg border border-white/20 text-white text-center">
                Image failed to load.
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Desktop View
            </div>
          </div>
        )}
        {activeView === 'mobile' && screenshots.mobile && (
          <div className="relative max-w-xs mx-auto">
            {!mobileError ? (
              <Image
                src={screenshots.mobile}
                alt="Mobile screenshot"
                width={375}
                height={667}
                className="w-full rounded-lg border border-white/20 shadow-lg"
                onError={() => setMobileError(true)}
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-black/30 rounded-lg border border-white/20 text-white text-center">
                Image failed to load.
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Mobile View
            </div>
          </div>
        )}
        
        {/* Scroll indicator */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>Scroll</span>
        </div>
      </div>

      {metadata && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metadata.pageTitle && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Page Title</div>
              <div className="text-sm text-white font-medium truncate" title={metadata.pageTitle}>
                {metadata.pageTitle}
              </div>
            </div>
          )}
          {metadata.loadTime && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Load Time</div>
              <div className="text-sm text-white font-medium">
                {metadata.loadTime}ms
              </div>
            </div>
          )}
          {metadata.pageSize && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Page Size</div>
              <div className="text-sm text-white font-medium">
                {metadata.pageSize}KB
              </div>
            </div>
          )}
          {metadata.technologies && metadata.technologies.length > 0 && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Technologies</div>
              <div className="text-sm text-white font-medium">
                {metadata.technologies.slice(0, 2).join(', ')}
                {metadata.technologies.length > 2 && '...'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 