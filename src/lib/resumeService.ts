import { getApiUrl } from './api';

export async function uploadResume(file: File) {
  const base = (getApiUrl() || '').replace(/\/$/, '');
  const url = `${base}/resume/analyze`;
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}
