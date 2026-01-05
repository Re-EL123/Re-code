'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [input, setInput] = useState('React dashboard with charts');
  const [streaming, setStreaming] = useState(false);
  const [code, setCode] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  async function generateCode() {
    setStreaming(true);
    setCode('');

    const res = await fetch('/api/claude/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader?.read()!;
      if (done) break;

      const chunk = decoder.decode(value);
      setCode(prev => prev + chunk);  // Full accumulation, no skips
    }

    setStreaming(false);
    updatePreview();
  }

  function updatePreview() {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    // Cleanup previous
    if (iframeRef.current?.src) {
      URL.revokeObjectURL(iframeRef.current.src);
    }
  }

  useEffect(() => updatePreview(), [code]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Claude Sonnet + Live Preview</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Code Editor */}
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-4 border rounded-lg mb-4 h-32"
            placeholder="Describe code to generate..."
          />
          <button
            onClick={generateCode}
            disabled={streaming}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {streaming ? 'Generating...' : 'Generate & Preview'}
          </button>
          
          <pre className="mt-8 p-6 bg-gray-900 text-white rounded-xl overflow-auto max-h-96 font-mono text-sm">
            {code || '// Live streaming code will appear here...'}
          </pre>
        </div>

        {/* Visual Preview */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
          {previewUrl ? (
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-96 border rounded-xl shadow-lg"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500">
              Preview appears here after generation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
