import React, { useState } from 'react';
import { Button } from './ui/button';

interface ApplicationFormValues {
  resumeFile: File;
  coverLetter?: string;
}

interface ApplicationFormProps {
  onSubmit: (values: ApplicationFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [fileError, setFileError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setResumeFile(null);
      setFileError('');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setResumeFile(null);
      setFileError('Only PDF, DOC, or DOCX files are allowed');
      return;
    }

    setResumeFile(file);
    setFileError('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!resumeFile) {
      setFileError('Please upload your resume file');
      return;
    }

    onSubmit({
      resumeFile,
      coverLetter: coverLetter.trim() || undefined,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Resume File
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Upload from your computer (PDF, DOC, DOCX)
        </p>
        {resumeFile && (
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            Selected: {resumeFile.name}
          </p>
        )}
        {fileError && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fileError}</p>
        )}
      </div>

      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cover Letter (Optional)
        </label>
        <textarea
          id="coverLetter"
          rows={4}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          placeholder="Write a cover letter or leave it blank..."
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={!resumeFile || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? 'Applying...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
};

export default ApplicationForm;
