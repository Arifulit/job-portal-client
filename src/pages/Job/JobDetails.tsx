import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { useState } from 'react';
import { useApplyJob } from '../../services/applicationService';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building,
  Calendar,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { formatDate, formatSalary, getStatusColor } from '../../utils/helpers';
import { ButtonLoader } from '../../components/Loader';

export const JobDetails = () => {
  const { id } = useParams();
  const { data: job, isLoading, isError } = useJob(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [resume, setResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const applyMutation = useApplyJob();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    applyMutation.mutate(
      { jobId: id, resume, coverLetter },
      {
        onSuccess: () => {
          setIsApplyModalOpen(false);
          setResume('');
          setCoverLetter('');
        },
      }
    );
  };

  if (isLoading) return <Loader />;

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Job not found</p>
          <button onClick={() => navigate('/jobs')} className="btn btn-primary">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                {job.companyLogo && (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-20 h-20 rounded-lg bg-white p-2"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <p className="text-xl opacity-90">{job.company}</p>
                </div>
              </div>
              <span className={`badge ${getStatusColor(job.status)} badge-lg`}>
                {job.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                <span className="capitalize">{job.jobType}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                <span>{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="badge badge-lg badge-outline">{job.category}</span>
              <span className="badge badge-lg badge-outline capitalize">
                {job.experienceLevel}
              </span>
              {job.isPremium && <span className="badge badge-lg badge-warning">Premium</span>}
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{job.applicantsCount} applicants</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Deadline: {formatDate(job.applicationDeadline)}</span>
                </div>
              </div>

              {user?.role === 'seeker' && (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsApplyModalOpen(true)}
                >
                  Apply Now
                </button>
              )}
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <Building className="w-6 h-6 mr-2" />
                  Job Description
                </h2>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Responsibilities
                </h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2" />
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {job.benefits && job.benefits.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
                  <ul className="space-y-2">
                    {job.benefits.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for this Job"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Resume URL</span>
            </label>
            <input
              type="url"
              placeholder="https://your-resume-url.com"
              className="input input-bordered w-full"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              required
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                Upload your resume to Cloudinary or Google Drive and paste the link
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Cover Letter (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-32"
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={applyMutation.isPending}>
              {applyMutation.isPending ? <ButtonLoader /> : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
