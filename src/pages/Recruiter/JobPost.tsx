
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useCreateJob } from "../../services/jobService";
import { JobStatus } from "../../types";

interface JobFormData {
  title: string;
  description: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  jobType: string;
  experienceLevel: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
}

export default function JobPost() {
  const navigate = useNavigate();
  const { mutate: createJob, isPending } = useCreateJob();

  const { register, handleSubmit, watch, setValue } = useForm<JobFormData>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      salaryMin: 0,
      salaryMax: 0,
      currency: "BDT",
      jobType: "full-time",
      experienceLevel: "mid",
      requirements: [""],
      responsibilities: [""],
      skills: [""],
    },
  });

  const requirements = watch("requirements");
  const responsibilities = watch("responsibilities");
  const skills = watch("skills");

  const addField = (field: "requirements" | "responsibilities" | "skills") =>
    setValue(field, [...watch(field), ""]);

  const removeField = (field: "requirements" | "responsibilities" | "skills", i: number) =>
    setValue(field, watch(field).filter((_, idx) => idx !== i));

  const onSubmit: SubmitHandler<JobFormData> = (data) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?._id) return toast.error("Login required");

    createJob(
      {
        ...data,
        createdBy: user._id,
        company: user.company || user._id,
        status: "active" as JobStatus,
        salary: { 
          min: data.salaryMin ? Number(data.salaryMin) : 0, 
          max: data.salaryMax ? Number(data.salaryMax) : 0, 
          currency: data.currency 
        },
      },
      {
        onSuccess: () => {
          toast.success("Job posted successfully!");
          navigate("/recruiter/jobs");
        },
        onError: () => toast.error("Failed to post job"),
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-lg text-gray-600 mt-2">Everything fits in one screen</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="space-y-5">

            {/* Job Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Job Details</h2>

              <input {...register("title", { required: true })} placeholder="Job Title *" className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-blue-600 bg-white text-gray-900 mb-3" />
              <input {...register("location", { required: true })} placeholder="Location *" className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-blue-600 bg-white text-gray-900 mb-3" />

              <div className="grid grid-cols-3 gap-3 mb-3">
                <input type="number" {...register("salaryMin")} placeholder="Min" className="px-5 py-3.5 border border-gray-300 rounded-xl bg-white" />
                <input type="number" {...register("salaryMax")} placeholder="Max" className="px-5 py-3.5 border border-gray-300 rounded-xl bg-white" />
                <select {...register("currency")} className="px-5 py-3.5 border border-gray-300 rounded-xl bg-white">
                  <option>BDT</option>
                  <option>USD</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <select {...register("jobType")} className="px-5 py-3.5 border border-gray-300 rounded-xl bg-white">
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="remote">Remote</option>
                  <option value="contract">Contract</option>
                </select>
                <select {...register("experienceLevel")} className="px-5 py-3.5 border border-gray-300 rounded-xl bg-white">
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="entry">Entry</option>
                </select>
              </div>

              <textarea
                {...register("description", { required: true })}
                rows={4}
                placeholder="Job Description *"
                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-blue-600 bg-white text-gray-900 resize-none"
              />
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Skills</h3>
                <button type="button" onClick={() => addField("skills")} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {skills.map((_, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <input {...register(`skills.${i}`)} placeholder="React, Node.js..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white" />
                  {skills.length > 1 && (
                    <button type="button" onClick={() => removeField("skills", i)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
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
                <button type="button" onClick={() => addField("requirements")} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {requirements.map((_, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <input {...register(`requirements.${i}`)} placeholder="3+ years experience..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white" />
                  {requirements.length > 1 && (
                    <button type="button" onClick={() => removeField("requirements", i)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
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
                <button type="button" onClick={() => addField("responsibilities")} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {responsibilities.map((_, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <input {...register(`responsibilities.${i}`)} placeholder="Build scalable apps..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white" />
                  {responsibilities.length > 1 && (
                    <button type="button" onClick={() => removeField("responsibilities", i)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
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
              disabled={isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xl px-32 py-7 rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
            >
              {isPending ? "Publishing Job..." : "Publish Job Now"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}