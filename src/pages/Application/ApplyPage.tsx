import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '../../services/jobService';
import { useCandidateProfile } from '../../services/candidateService';
import { useApplyJob } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/ui/button';
import { ArrowLeft, FileText, Briefcase, MapPin, DollarSign, Mail, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ApplyPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: jobData, isLoading: jobLoading } = useJob(jobId);
  const { data: profileData, isLoading: profileLoading } = useCandidateProfile();
  const { mutate: applyForJob, isPending: isSubmitting } = useApplyJob();

  const job = jobData;
  const profile = profileData?.data;
  const normalizedRole = String(user?.role || '').toLowerCase();
  const canApply = ['candidate', 'seeker', 'job_seeker'].includes(normalizedRole);
  const existingResumeUrl =
    (profile?.user as { resume?: string } | undefined)?.resume ||
    (profile as { resume?: string } | undefined)?.resume ||
    '';

  // Form state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState(existingResumeUrl);

  useEffect(() => {
    if (existingResumeUrl) {
      setResumeUrl(existingResumeUrl);
    }
  }, [existingResumeUrl]);

  const companyName =
    typeof job?.company === 'string'
      ? job.company
      : job?.company?.name || 'Confidential Company';

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

    if (file.size > 5 * 1024 * 1024) {
      setResumeFile(null);
      setFileError('File size must be less than 5MB');
      return;
    }

    setResumeFile(file);
    setFileError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobId) {
      toast.error('Invalid job ID');
      return;
    }

    if (!resumeFile && !resumeUrl.trim()) {
      setFileError('Please upload a resume or use your saved resume URL');
      return;
    }

    setFileError('');

    applyForJob(
      {
        jobId,
        coverLetter: coverLetter.trim() || undefined,
        resumeFile: resumeFile || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate('/candidate/applications', { replace: true });
        },
      }
    );
  };

  if (jobLoading || profileLoading) {
    return <Loader />;
  }

  if (!job || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load</h2>
          <p className="text-gray-600 mb-6">Job or profile information could not be loaded.</p>
          <Link to="/jobs" className="text-blue-600 hover:underline">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!user || !canApply) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only candidates can apply for jobs.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Job
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Job Summary + Candidate Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Job Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                Job Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{job.title}</p>
                  <p className="text-gray-600 text-sm mt-1">{companyName}</p>
                </div>

                {job.location && (
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Location</p>
                      <p className="text-gray-900 font-medium">{job.location}</p>
                    </div>
                  </div>
                )}

                {job.jobType && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Job Type</p>
                      <p className="text-gray-900 font-medium capitalize">{job.jobType.replace('-', ' ')}</p>
                    </div>
                  </div>
                )}

                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Salary Range</p>
                      <p className="text-gray-900 font-medium">
                        {job.currency || 'BDT'} {job.salaryMin?.toLocaleString() || 0}
                        {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                Your Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-bold text-gray-900">{profile.name}</p>
                  {profile.headline && <p className="text-sm text-gray-600">{profile.headline}</p>}
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900 text-sm">{profile.user.email}</p>
                  </div>
                </div>

                {profile.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-900 text-sm">{profile.phone}</p>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-gray-900 text-sm">{profile.location}</p>
                    </div>
                  </div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 5 && (
                        <span className="text-xs text-gray-600">+{profile.skills.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Apply for this role</h2>
              <p className="text-gray-600 mb-8">Complete your application by filling in the details below.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Expected Salary */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Expected Salary (Monthly)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {job.currency || 'BDT'}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Job offers: {job.currency || 'BDT'} {job.salaryMin?.toLocaleString() || 0}
                    {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}
                  </p>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Resume / CV
                  </label>
                  {existingResumeUrl && (
                    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      <p className="font-medium">Saved resume found</p>
                      <p className="mt-1 break-all text-xs text-blue-800">{existingResumeUrl}</p>
                      <button
                        type="button"
                        onClick={() => setResumeUrl(existingResumeUrl)}
                        className="mt-2 text-xs font-semibold text-blue-700 hover:text-blue-800"
                      >
                        Use saved resume URL
                      </button>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Resume URL</label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => {
                        setResumeUrl(e.target.value);
                        if (e.target.value.trim()) {
                          setFileError('');
                        }
                      }}
                      placeholder="https://example.com/my-resume.pdf"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-gray-500">If you already have a hosted resume link, paste it here. Otherwise upload a file below.</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer block">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        {resumeFile ? (
                          <span className="text-green-600">✓ {resumeFile.name}</span>
                        ) : (
                          <>
                            Click to upload a resume file or keep using the URL above
                            <br />
                            <span className="text-xs text-gray-500">PDF, DOC, DOCX (Max 5MB)</span>
                          </>
                        )}
                      </p>
                    </label>
                  </div>
                  {fileError && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fileError}
                    </p>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-900 mb-2">
                    Cover Letter or Notes (Optional)
                  </label>
                  <textarea
                    id="coverLetter"
                    rows={5}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you're interested in this role..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">{coverLetter.length} / 2000 characters</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={(!resumeFile && !resumeUrl.trim()) || isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
