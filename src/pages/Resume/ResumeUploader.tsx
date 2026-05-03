import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { uploadResume } from '../../lib/resumeService';

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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const toast = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return toast({ title: 'Error', description: 'Please choose a file first', variant: 'destructive' });
    setLoading(true);
    try {
      const data = await uploadResume(file);
      setResult(data as AnalysisResult);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Upload failed', variant: 'destructive' });
    } finally {
      setLoading(false);
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
