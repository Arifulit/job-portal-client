import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { uploadToCloudinary, api } from '../../utils/api';

type AnalysisResult = {
  success: boolean;
  score: number;
  scoreBreakdown: Record<string, number>;
  extractedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  suggestions: string[];
  summary: string;
};

export default function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return toast({ title: 'Error', description: 'Please choose a file first', variant: 'destructive' });
    setLoading(true);
    setProgress(0);
    try {
      // 1) Upload directly to Cloudinary (unsigned preset)
      const cloudUrl = await uploadToCloudinary(file, (p) => setProgress(p));

      // 2) Trigger analysis on backend using filePath query (backend will fetch the file)
      const mimetype = file.type || 'application/pdf';
      const resp = await api.get('/resume/analyze', {
        params: { filePath: cloudUrl, mimetype },
      });

      if (!resp?.data?.success) {
        throw new Error(resp?.data?.message || 'Analysis failed');
      }

      setResult(resp.data.data as AnalysisResult);
      toast({ title: 'Success', description: 'Resume analyzed', variant: 'default' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Upload failed', variant: 'destructive' });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Resume for Analysis</h2>

      <div className="space-y-3">
        <input type="file" accept=".pdf,.txt" onChange={handleFile} />
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="inline-flex items-center rounded bg-[#0E5EA8] px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : 'Upload & Analyze'}
          </button>
          {file && <div className="text-sm text-slate-600">Selected: {file.name}</div>}
        </div>
        {loading && (
          <div className="mt-2 w-full">
            <div className="h-2 bg-slate-100 rounded overflow-hidden">
              <div className="h-2 bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-1">Uploading: {progress}%</div>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded border p-4">
            <h3 className="font-semibold">Summary</h3>
            <p className="text-sm">{result.summary}</p>
          </div>

          <div className="rounded border p-4">
            <h3 className="font-semibold">Score: {result.score}</h3>
            <div className="text-sm">
              {Object.entries(result.scoreBreakdown).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="capitalize">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border p-4">
            <h3 className="font-semibold">Detected Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.extractedSkills.length ? (
                result.extractedSkills.map((s) => (
                  <span key={s} className="rounded bg-slate-100 px-2 py-1 text-sm">{s}</span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills detected</p>
              )}
            </div>
          </div>

          {result.suggestions.length > 0 && (
            <div className="rounded border p-4">
              <h3 className="font-semibold">Suggestions</h3>
              <ul className="list-disc ml-5 text-sm">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
