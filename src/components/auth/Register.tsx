// এই ফাইলটি authentication related form, input validation ও submit behavior সামলায়।
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Code, Eye, EyeOff, FileText, Lock, Mail, MapPin, Phone, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface CandidateRegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  biodata: string;
  location: string;
  skills: string[];
  skillInput: string;
}

const initialForm: CandidateRegisterForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  biodata: '',
  location: '',
  skills: [],
  skillInput: '',
};

const getPasswordStrength = (value: string) => {
  if (!value) {
    return { width: 0, label: '', color: 'bg-gray-300' };
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return {
    width: (score / 5) * 100,
    label: labels[score - 1] || 'Very Weak',
    color: colors[score - 1] || 'bg-red-500',
  };
};

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const googleLoginUrl = `${API_BASE}/auth/google?redirect=${encodeURIComponent(window.location.origin + '/auth/google/success?redirect=/')}`;
  const [formData, setFormData] = useState<CandidateRegisterForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const getRedirectPath = (role?: string) => {
    const normalizedRole = String(role || '').toLowerCase();

    if (normalizedRole === 'admin') return '/admin/dashboard';
    if (normalizedRole === 'recruiter') return '/recruiter/dashboard';
    return '/';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const addSkill = () => {
    const incomingSkills = formData.skillInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (incomingSkills.length === 0) {
      return;
    }

    const uniqueToAdd = incomingSkills.filter((skill) => !formData.skills.includes(skill));

    if (uniqueToAdd.length === 0) {
      setFormData((prev) => ({ ...prev, skillInput: '' }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ...uniqueToAdd],
      skillInput: '',
    }));
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Password and confirm password do not match';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!formData.biodata.trim()) return 'Biodata is required';
    if (!formData.location.trim()) return 'Location is required';
    if (formData.skills.length === 0) return 'Please add at least one skill';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const registeredUser = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'candidate',
        phone: formData.phone.trim(),
        biodata: formData.biodata.trim(),
        location: formData.location.trim(),
        skills: formData.skills,
      });

      setSuccess('Candidate account created successfully! Redirecting...');
      toast.success('Candidate registration successful');

      setTimeout(() => {
        navigate(getRedirectPath(registeredUser.role));
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || loading;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_36%),linear-gradient(180deg,_#f8fbff_0%,_#eef3ff_100%)] dark:bg-slate-950 flex p-4 relative overflow-hidden">

      <div className="container mx-auto flex items-center justify-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl">
          <div className="bg-white/95 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
              <h2 className="text-2xl font-bold text-white">Candidate Registration</h2>
              <p className="text-blue-100 text-sm mt-1">Create your candidate profile with skills</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto" autoComplete="off">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} className="w-full h-10 pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="rahim" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} className="w-full h-10 pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="rahimcandidate@gmail.com" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" spellCheck={false} value={formData.password} onChange={handleChange} className="w-full h-10 pl-10 pr-10 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="123456" />
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" autoComplete="new-password" spellCheck={false} value={formData.confirmPassword} onChange={handleChange} className="w-full h-10 pl-10 pr-10 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="123456" />
                    <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${passwordStrength.color}`} style={{ width: `${passwordStrength.width}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{passwordStrength.label}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full h-10 pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="01712345678" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full h-10 pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Dhaka, Bangladesh" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Biodata *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    name="biodata"
                    value={formData.biodata}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Junior frontend developer with internship experience."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Skills *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="skillInput"
                      value={formData.skillInput}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="w-full h-10 pl-10 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="JavaScript, React, Node.js"
                    />
                  </div>
                  <button type="button" onClick={addSkill} className="px-4 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Add
                  </button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 rounded text-xs font-medium">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-blue-200 dark:hover:bg-blue-400/20 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={disabled} className={`w-full h-11 rounded-lg font-semibold text-white flex items-center justify-center gap-2 ${disabled ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
                {disabled ? 'Creating Candidate Account...' : 'Create Candidate Account'}
                {!disabled && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => (window.location.href = googleLoginUrl)}
                className="w-full h-11 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.07-1.41-.2-2.08H12z" />
                  <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.3-2.56c-.91.61-2.08.97-3.33.97-2.56 0-4.73-1.73-5.5-4.05l-3.41 2.64C4.75 19.85 8.08 22 12 22z" />
                  <path fill="#4A90E2" d="M6.5 13.92A6.02 6.02 0 016.18 12c0-.67.12-1.32.32-1.92l-3.41-2.64A9.99 9.99 0 002 12c0 1.6.38 3.1 1.09 4.44l3.41-2.52z" />
                  <path fill="#FBBC05" d="M12 6.03c1.47 0 2.78.5 3.81 1.49l2.86-2.86C16.96 3.07 14.7 2 12 2 8.08 2 4.75 4.15 3.09 7.44l3.41 2.64c.77-2.32 2.94-4.05 5.5-4.05z" />
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400 pt-1">
                Want to register as recruiter?{' '}
                <Link to="/register/recruiter" className="font-semibold text-blue-600 hover:text-blue-700">
                  Recruiter Registration
                </Link>
              </p>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
