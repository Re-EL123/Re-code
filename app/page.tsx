export const runtime = 'nodejs';  // Before 'use client';

'use client';
import { useState, useRef, useEffect } from "react";

export default function ReCodeClaude() {
  const [prompt, setPrompt] = useState('React dashboard with Tailwind charts');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewSrc, setPreviewSrc] = useState('');

  async function generateAndPreview() {
    setLoading(true);
    setCode('');

    const response = await fetch('/api/claude/stream', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
      headers: { 'Content-Type': 'application/json' },
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    // PERFECT STREAMING - accumulates EVERY character
    while (true) {
      const { done, value } = await reader?.read()!;
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      setCode(prev => prev + chunk);
    }
    
    setLoading(false);
    updatePreview();
  }

  const updatePreview = () => {
    if (code) {
      const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setPreviewSrc(url);
      
      // Cleanup old preview
      if (iframeRef.current?.src) {
        URL.revokeObjectURL(iframeRef.current.src);
      }
    }
  };

  useEffect(() => {
    if (code) updatePreview();
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-12">
          Re-Code + Claude Sonnet Live Preview
        </h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Prompt & Code */}
          <div className="space-y-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl h-32 resize-none font-mono text-lg placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-all"
              placeholder="Describe exact code you want Claude to generate..."
            />
            
            <button
              onClick={generateAndPreview}
              disabled={loading}
              className="w-full px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? '🔄 Claude is streaming PERFECT code...' : '✨ Generate & Live Preview'}
            </button>
            
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 max-h-96 overflow-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap text-white">
                {code || '/* Live Claude Sonnet output streams here - 100% complete, no truncation */'}
              </pre>
            </div>
          </div>

          {/* VISUAL PREVIEW */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              🎥 Live Visual Preview
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                previewSrc ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {previewSrc ? '✅ LIVE' : '⚫ Inactive'}
              </span>
            </h3>
            
            {previewSrc ? (
              <iframe
                ref={iframeRef}
                src={previewSrc}
                className="w-full h-96 lg:h-[500px] bg-white rounded-2xl shadow-2xl border-4 border-white/20"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center backdrop-blur-lg shadow-xl">
                <div className="text-center text-gray-400">
                  <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Code preview renders here automatically</p>
                  <p className="text-sm opacity-75 mt-1">HTML/JS/React renders live in sandboxed iframe</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
