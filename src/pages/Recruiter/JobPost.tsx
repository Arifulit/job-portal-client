
import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useCreateJob, useJob, useUpdateJob } from "../../services/jobService";
import { api } from "@/utils/api";
import { Job, JobStatus } from "../../types";
import recruiterService from "@/services/recruiterService";

interface JobFormData {
  title: string;
  description: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  jobType: string;
  experience: string;
  deadline: string;
  vacancies: number;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
}

interface LocalUser {
  company?: string | { _id?: string };
}

interface RecruiterProfileResponse {
  success?: boolean;
  data?: {
    company?: string | { _id?: string };
  };
}

interface AuthMeResponse {
  success?: boolean;
  user?: {
    company?: string | { _id?: string };
  };
  data?: {
    company?: string | { _id?: string };
  };
}

export default function JobPost() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const isEditMode = Boolean(jobId);

  const { mutate: createJob, isPending } = useCreateJob();
  const { mutate: updateJob, isPending: isUpdating } = useUpdateJob();
  const { data: existingJob, isLoading: isLoadingJob, error: existingJobError } = useJob(jobId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      salaryMin: 0,
      salaryMax: 0,
      currency: "BDT",
      jobType: "full-time",
      experience: "1-2 years",
      deadline: "",
      vacancies: 1,
      requirements: [""],
      responsibilities: [""],
      skills: [""],
    },
  });

  const requirements = watch("requirements");
  const responsibilities = watch("responsibilities");
  const skills = watch("skills");

  useEffect(() => {
    if (!isEditMode || !existingJob) return;

    const safeExistingJob = existingJob as Job & {
      responsibilities?: string[];
      salary?: { min?: number; max?: number; currency?: string } | number;
    };

    const deadlineValue = safeExistingJob.deadline
      ? new Date(safeExistingJob.deadline).toISOString().slice(0, 10)
      : "";

    setValue("title", safeExistingJob.title || "");
    setValue("description", safeExistingJob.description || "");
    setValue("location", safeExistingJob.location || "");
    setValue("salaryMin", Number(safeExistingJob.salaryMin ?? 0));
    setValue("salaryMax", Number(safeExistingJob.salaryMax ?? 0));
    setValue("currency", safeExistingJob.currency ?? "BDT");
    setValue("jobType", safeExistingJob.jobType || "full-time");
    setValue("experience", safeExistingJob.experience || "1-2 years");
    setValue("deadline", deadlineValue);
    setValue("vacancies", Number(safeExistingJob.vacancies ?? 1));
    setValue("requirements", safeExistingJob.requirements?.length ? safeExistingJob.requirements : [""]);
    setValue(
      "responsibilities",
      safeExistingJob.responsibilities?.length ? safeExistingJob.responsibilities : [""]
    );
    setValue("skills", safeExistingJob.skills?.length ? safeExistingJob.skills : [""]);
  }, [existingJob, isEditMode, setValue]);

  const addField = (field: "requirements" | "responsibilities" | "skills") => {
    setValue(field, [...watch(field), ""], { shouldDirty: true, shouldValidate: true });
  };

  const removeField = (field: "requirements" | "responsibilities" | "skills", i: number) => {
    setValue(
      field,
      watch(field).filter((_, idx) => idx !== i),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const getCompanyId = (user: LocalUser): string | null => {
    if (typeof user.company === "string" && user.company.trim()) {
      return user.company;
    }

    if (user.company && typeof user.company === "object" && user.company._id) {
      return user.company._id;
    }

    return null;
  };

  const getCompanyIdFromJob = (job: Job | undefined): string | null => {
    if (!job?.company) return null;

    if (typeof job.company === "string" && job.company.trim()) {
      return job.company;
    }

    if (typeof job.company === "object" && job.company?._id) {
      return job.company._id;
    }

    return null;
  };

  const onSubmit: SubmitHandler<JobFormData> = async (data) => {
    let user: LocalUser = {};

    try {
      user = JSON.parse(localStorage.getItem("user") || "{}") as LocalUser;
    } catch {
      user = {};
    }

    let companyId = getCompanyId(user);

    if (!companyId && !isEditMode) {
      try {
        const profile = (await recruiterService.getRecruiterProfile()) as RecruiterProfileResponse;
        const profileCompany = profile?.data?.company;

        if (typeof profileCompany === "string" && profileCompany.trim()) {
          companyId = profileCompany;
        } else if (profileCompany && typeof profileCompany === "object" && profileCompany._id) {
          companyId = profileCompany._id;
        }
      } catch {
        try {
          const meResponse = await api.get<AuthMeResponse>("/auth/me");
          const meCompany = meResponse.data?.user?.company ?? meResponse.data?.data?.company;

          if (typeof meCompany === "string" && meCompany.trim()) {
            companyId = meCompany;
          } else if (meCompany && typeof meCompany === "object" && meCompany._id) {
            companyId = meCompany._id;
          }
        } catch {
          // Keep local fallback behavior if profile request fails.
        }
      }
    }

    if (!companyId) {
      companyId = getCompanyIdFromJob(existingJob);
    }

    if (!companyId && !isEditMode) return toast.error("Company profile is required");

    const cleanedSkills = data.skills.map((item) => item.trim()).filter(Boolean);
    const cleanedRequirements = data.requirements.map((item) => item.trim()).filter(Boolean);
    const cleanedResponsibilities = data.responsibilities.map((item) => item.trim()).filter(Boolean);

    if (!cleanedSkills.length) return toast.error("Add at least one skill");
    if (!cleanedRequirements.length) return toast.error("Add at least one requirement");
    if (!cleanedResponsibilities.length) return toast.error("Add at least one responsibility");
    if (data.salaryMax > 0 && data.salaryMin > data.salaryMax) {
      return toast.error("Minimum salary cannot be greater than maximum salary");
    }

    const allowedJobTypes: Job["jobType"][] = ["full-time", "part-time", "remote", "contract", "internship"];
    const requestedJobType = data.jobType.trim().toLowerCase();
    const normalizedJobType: Job["jobType"] = allowedJobTypes.includes(requestedJobType as Job["jobType"])
      ? (requestedJobType as Job["jobType"])
      : "full-time";

    const payload = {
      title: data.title.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      jobType: normalizedJobType,
      salaryMin: data.salaryMin ? Number(data.salaryMin) : 0,
      salaryMax: data.salaryMax ? Number(data.salaryMax) : 0,
      currency: data.currency,
      skills: cleanedSkills,
      experience: data.experience,
      deadline: data.deadline || undefined,
      vacancies: data.vacancies ? Number(data.vacancies) : 1,
      requirements: cleanedRequirements,
      responsibilities: cleanedResponsibilities,
      status: "active" as JobStatus,
    };

    if (companyId) {
      (payload as { company?: string }).company = companyId;
    }

    if (isEditMode && jobId) {
      updateJob(
        { id: jobId, data: payload as Partial<Job> },
        {
          onSuccess: () => {
            toast.success("Job updated successfully!");
            navigate("/recruiter/jobs");
          },
          onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "Failed to update job";
            toast.error(message);
          },
        }
      );
      return;
    }

    createJob(payload as Partial<Job>, {
      onSuccess: () => {
        toast.success("Job posted successfully!");
        navigate("/recruiter/jobs");
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : "Failed to post job";
        toast.error(message);
      },
    });
  };

  if (isEditMode && isLoadingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-600 font-medium">Loading job details for edit...</p>
      </div>
    );
  }

  if (isEditMode && existingJobError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600 font-semibold mb-3">Failed to load job for editing</p>
          <Button onClick={() => navigate("/recruiter/jobs")} variant="outline">Back to My Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-6 py-7 text-white shadow-lg">
          <h1 className="text-3xl font-black sm:text-4xl">
            {isEditMode ? "Edit Job Posting" : "Create a New Job Posting"}
          </h1>
          <p className="mt-2 text-sm text-emerald-50 sm:text-base">
            {isEditMode
              ? "Update your job details and keep your listing accurate for candidates."
              : "Publish a clear and complete job post to attract better candidates faster."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="space-y-5">

            {/* Job Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Job Details</h2>

              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Job Title *</label>
                <input
                  {...register("title", { required: "Job title is required" })}
                  placeholder="Senior Frontend Engineer"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
              </div>

              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Location *</label>
                <input
                  {...register("location", { required: "Location is required" })}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
                />
                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  type="number"
                  min={0}
                  {...register("salaryMin", { valueAsNumber: true })}
                  placeholder="Min"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />
                <input
                  type="number"
                  min={0}
                  {...register("salaryMax", { valueAsNumber: true })}
                  placeholder="Max"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />
                <select {...register("currency")} className="rounded-xl border border-gray-300 bg-white px-4 py-3">
                  <option>BDT</option>
                  <option>USD</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <select {...register("jobType")} className="rounded-xl border border-gray-300 bg-white px-4 py-3">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="remote">Remote</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
                <select {...register("experience")} className="rounded-xl border border-gray-300 bg-white px-4 py-3">
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-6 years">3-6 years</option>
                  <option value="7+ years">7+ years</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <input type="date" {...register("deadline")} className="rounded-xl border border-gray-300 bg-white px-4 py-3" />
                <input
                  type="number"
                  min={1}
                  {...register("vacancies", { valueAsNumber: true, min: 1 })}
                  placeholder="Vacancies"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Job Description *</label>
                <textarea
                  {...register("description", { required: "Job description is required" })}
                  rows={4}
                  placeholder="Describe the role, impact, and expectations..."
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Skills</h3>
                <button type="button" onClick={() => addField("skills")} className="text-blue-600 p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {skills.map((_, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <input {...register(`skills.${i}`)} placeholder="React, Node.js..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white" />
                  {skills.length > 1 && (
                    <button type="button" onClick={() => removeField("skills", i)} className="text-red-600 p-2 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-5">

            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Requirements</h3>
                <button type="button" onClick={() => addField("requirements")} className="text-blue-600 p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {requirements.map((_, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <input {...register(`requirements.${i}`)} placeholder="3+ years experience..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white" />
                  {requirements.length > 1 && (
                    <button type="button" onClick={() => removeField("requirements", i)} className="text-red-600 p-2 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Responsibilities</h3>
                <button type="button" onClick={() => addField("responsibilities")} className="text-blue-600 p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {responsibilities.map((_, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <input {...register(`responsibilities.${i}`)} placeholder="Build scalable apps..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white" />
                  {responsibilities.length > 1 && (
                    <button type="button" onClick={() => removeField("responsibilities", i)} className="text-red-600 p-2 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Submit Button */}
          <div className="lg:col-span-2 text-center mt-8">
            <Button
              type="submit"
              disabled={isPending || isUpdating}
              className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-14 py-6 text-lg font-bold text-white shadow-xl sm:px-24"
            >
              {isEditMode
                ? isUpdating
                  ? "Updating Job..."
                  : "Update Job"
                : isPending
                ? "Publishing Job..."
                : "Publish Job Now"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}