import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeAnalyzer } from '@/services/resumeAnalyzerService';
import type { ResumeAnalysisResponse } from '@/services/resumeAnalyzerService';

const ResumeAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const mutation = useResumeAnalyzer();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    try {
      const result = await mutation.mutateAsync(selectedFile);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 py-12 px-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Resume Analyzer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Get instant feedback on your resume with AI-powered analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              
              <label className="cursor-pointer">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  {selectedFile ? selectedFile.name : 'Upload Resume'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  PDF, DOC or DOCX
                </span>
              </label>

              {selectedFile && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setAnalysis(null);
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              )}
            </div>

            {selectedFile && (
              <Button
                onClick={handleAnalyze}
                disabled={mutation.isPending}
                className="w-full mt-4 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {mutation.isPending ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {mutation.isPending && (
              <div className="rounded-xl bg-white dark:bg-slate-800 p-8 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Analyzing your resume...</p>
              </div>
            )}

            {analysis && !mutation.isPending && (
              <div className="space-y-6">
                {/* Score Card */}
                <div className={`rounded-xl bg-gradient-to-br ${getScoreColor(analysis.score)} p-8 text-white shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Overall Score</h3>
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-5xl font-bold mb-2">{analysis.score}</div>
                  <p className="text-blue-100">{getScoreLabel(analysis.score)}</p>

                  {/* Score Breakdown */}
                  {analysis.scoreBreakdown && (
                    <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-white/20">
                      {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="block text-blue-100 capitalize mb-1">{key}</span>
                          <span className="font-bold text-lg">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                {analysis.extractedSkills && analysis.extractedSkills.length > 0 && (
                  <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Detected Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.extractedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths Section */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions Section */}
                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md border-l-4 border-blue-500">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      Improvement Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300">
                          <span className="text-blue-500 font-bold">→</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Skills Section */}
                {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                  <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-orange-500" />
                      Skills to Consider Adding
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {analysis.summary && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-6">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {analysis.summary}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!analysis && !mutation.isPending && !selectedFile && (
              <div className="rounded-xl bg-white dark:bg-slate-800 p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Upload a resume to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
