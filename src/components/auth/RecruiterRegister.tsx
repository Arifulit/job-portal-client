// এই ফাইলটি authentication related form, input validation ও submit behavior সামলায়।
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Briefcase, Mail, Lock, Phone, User, Globe, MapPin, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface RecruiterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  biodata: string;
  location: string;
  designation: string;
  companyName: string;
  yearOfEstablishment: string;
  companyAddress: string;
  industryType: string;
  websiteUrl: string;
}

const initialForm: RecruiterForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  biodata: '',
  location: '',
  designation: '',
  companyName: '',
  yearOfEstablishment: '',
  companyAddress: '',
  industryType: '',
  websiteUrl: '',
};

export const RecruiterRegister = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RecruiterForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const getRedirectPath = (role?: string) => {
    const normalizedRole = String(role || '').toLowerCase();

    if (normalizedRole === 'admin') return '/admin/dashboard';
    if (normalizedRole === 'recruiter') return '/recruiter/dashboard';
    return '/';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Recruiter name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Password does not match';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!formData.biodata.trim()) return 'Biodata is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.designation.trim()) return 'Designation is required';
    if (!formData.companyName.trim()) return 'Company name is required';
    if (!formData.yearOfEstablishment.trim()) return 'Year of establishment is required';
    if (!formData.companyAddress.trim()) return 'Company address is required';
    if (!formData.industryType.trim()) return 'Industry type is required';
    if (!formData.websiteUrl.trim()) return 'Website url is required';

    const year = Number(formData.yearOfEstablishment);
    if (Number.isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      return 'Please provide a valid establishment year';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const registeredUser = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'recruiter',
        phone: formData.phone.trim(),
        biodata: formData.biodata.trim(),
        location: formData.location.trim(),
        designation: formData.designation.trim(),
        companyName: formData.companyName.trim(),
        yearOfEstablishment: Number(formData.yearOfEstablishment),
        companyAddress: formData.companyAddress.trim(),
        industryType: formData.industryType.trim(),
        websiteUrl: formData.websiteUrl.trim(),
      });

      toast.success('Recruiter account created successfully');
      navigate(getRedirectPath(registeredUser.role));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Recruiter registration failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || loading;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_36%),linear-gradient(180deg,_#f8fbff_0%,_#eef3ff_100%)] dark:bg-slate-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white/95 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5">
          <h1 className="text-2xl font-bold text-white">Recruiter Registration</h1>
          <p className="text-blue-100 text-sm mt-1">Create recruiter account with company profile details</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid md:grid-cols-2 gap-4" autoComplete="off">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recruiter Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="name" autoComplete="name" value={formData.name} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Recruiter salam" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="salam@gmail.com" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="password" type="password" autoComplete="new-password" spellCheck={false} value={formData.password} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="123456" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="confirmPassword" type="password" autoComplete="new-password" spellCheck={false} value={formData.confirmPassword} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="123456" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="phone" value={formData.phone} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="01812345678" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="location" value={formData.location} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Chattogram, Bangladesh" />
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Biodata</label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                name="biodata"
                value={formData.biodata}
                onChange={(e) => setFormData((prev) => ({ ...prev, biodata: e.target.value }))}
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Technical recruiter with 4 years hiring experience."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Designation</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="designation" value={formData.designation} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="HR Manager" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="companyName" value={formData.companyName} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Tech Corp" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Year Of Establishment</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="yearOfEstablishment" type="number" value={formData.yearOfEstablishment} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="2012" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="companyAddress" value={formData.companyAddress} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Banani, Dhaka" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Industry Type</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="industryType" value={formData.industryType} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Software" />
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Website URL</label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="h-10 w-full pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="https://techcorp.com" />
            </div>
          </div>

          <div className="md:col-span-2 mt-2 space-y-3">
            <button
              type="submit"
              disabled={disabled}
              className="h-11 w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {disabled ? 'Creating...' : 'Create Recruiter Account'}
              {!disabled && <ArrowRight className="w-4 h-4" />}
            </button>

            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
              Already have recruiter account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterRegister;
