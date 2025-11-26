// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Briefcase, Mail, Lock, User, Phone, Building,
//   Eye, EyeOff, CheckCircle2, AlertCircle, Code, X, ArrowRight
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

// export const Register = () => {
//   type Role = "candidate" | "recruiter";

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "candidate" as Role,
//     phone: "",
//     skills: [] as string[],
//     skillInput: "",
//     designation: "",
//     agency: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const navigate = useNavigate();

//   const getPasswordStrength = (pwd?: string) => {
//     if (!pwd) return { strength: 0, label: "", color: "" };
//     let s = 0;
//     if (pwd.length >= 8) s++;
//     if (/[a-z]/.test(pwd)) s++;
//     if (/[A-Z]/.test(pwd)) s++;
//     if (/[0-9]/.test(pwd)) s++;
//     if (/[^A-Za-z0-9]/.test(pwd)) s++;

//     const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
//     const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
//     return { strength: (s / 5) * 100, label: labels[s - 1] || "", color: colors[s - 1] || "bg-gray-300" };
//   };

//   const passwordStrength = getPasswordStrength(formData.password);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(s => ({ ...s, [e.target.name]: e.target.value }));
//     setError(null);
//   };

//   const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && formData.skillInput.trim()) {
//       e.preventDefault();
//       const skill = formData.skillInput.trim();
//       if (!formData.skills.includes(skill)) {
//         setFormData(s => ({ ...s, skills: [...s.skills, skill], skillInput: "" }));
//       }
//     }
//   };

//   const handleRemoveSkill = (skill: string) => {
//     setFormData(s => ({ ...s, skills: s.skills.filter(s => s !== skill) }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setIsLoading(true);

//     // Validation
//     if (formData.role === "candidate" && formData.skills.length === 0) {
//       setError("Please add at least one skill");
//       setIsLoading(false);
//       return;
//     }
//     if (formData.role === "recruiter") {
//       if (!formData.phone?.trim()) { setError("Phone is required"); setIsLoading(false); return; }
//       if (!formData.designation?.trim()) { setError("Designation is required"); setIsLoading(false); return; }
//       if (!formData.agency?.trim()) { setError("Agency ID is required"); setIsLoading(false); return; }
//     }

//     try {
//       const payload: any = {
//         name: formData.name.trim(),
//         email: formData.email.trim().toLowerCase(),
//         password: formData.password.trim(),   // শুধু trim, কোনো hash না!
//         role: formData.role,
//         phone: formData.phone.trim() || undefined,
//       };

//       if (formData.role === "candidate") payload.skills = formData.skills;
//       if (formData.role === "recruiter") {
//         payload.designation = formData.designation.trim();
//         payload.agency = formData.agency.trim();
//       }

//       const res = await fetch(`${API_BASE}/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data?.message || "Registration failed");

//       // Token & User সঠিকভাবে নেওয়া
//       const accessToken = data?.data?.accessToken || data?.accessToken || data?.token;
//       const user = data?.data?.user || data?.user;

//       if (accessToken) {
//         localStorage.setItem("token", accessToken);
//         axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
//       }
//       if (user) localStorage.setItem("user", JSON.stringify(user));

//       setSuccess("Account created successfully! Redirecting...");
//       setTimeout(() => {
//         const role = user?.role || formData.role;
//         if (role === "candidate") navigate("/candidate/dashboard");
//         else if (role === "recruiter") navigate("/recruiter/dashboard");
//         else if (role === "admin") navigate("/admin/dashboard");
//         else navigate("/");
//       }, 1500);

//     } catch (err: any) {
//       setError(err.message || "Registration failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex p-4 relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
//       </div>

//       {/* Grid Pattern */}
//       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

//       <div className="container mx-auto flex items-center justify-center relative z-10">
//         <div className="w-full max-w-md">
//           {/* Form */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8 }}
//             className="w-full"
//           >
//             <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//               {/* Form Header */}
//               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
//                 <h2 className="text-2xl font-bold text-white">Create Account</h2>
//                 <p className="text-blue-100 text-sm mt-1">Join our professional community</p>
//               </div>

//               {/* Form Body */}
//               <div className="p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
//                 {/* Alerts */}
//                 <AnimatePresence>
//                   {error && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
//                     >
//                       <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
//                       <p className="text-sm text-red-800">{error}</p>
//                     </motion.div>
//                   )}
                  
//                   {success && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
//                     >
//                       <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
//                       <p className="text-sm text-green-800">{success}</p>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* Role Selection */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-semibold text-gray-700">Select Role *</label>
//                   <div className="grid grid-cols-2 gap-3">
//                     {[
//                       { value: "candidate" as const, label: "Candidate", icon: User },
//                       { value: "recruiter" as const, label: "Recruiter", icon: Building },
//                     ].map((role) => (
//                       <label
//                         key={role.value}
//                         className={`relative flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
//                           formData.role === role.value
//                             ? "border-blue-600 bg-blue-50"
//                             : "border-gray-200 hover:border-gray-300"
//                         }`}
//                       >
//                         <input
//                           type="radio"
//                           name="role"
//                           value={role.value}
//                           checked={formData.role === role.value}
//                           onChange={handleChange}
//                           className="sr-only"
//                         />
//                         <role.icon className={`w-5 h-5 ${formData.role === role.value ? "text-blue-600" : "text-gray-400"}`} />
//                         <span className={`text-sm font-medium ${formData.role === role.value ? "text-blue-600" : "text-gray-700"}`}>
//                           {role.label}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Name */}
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-gray-700">Full Name *</label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="text"
//                       name="name"
//                       placeholder="John Doe"
//                       value={formData.name}
//                       onChange={handleChange}
//                       required
//                       className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
//                     />
//                   </div>
//                 </div>

//                 {/* Email */}
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-gray-700">Email Address *</label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="email"
//                       name="email"
//                       placeholder="you@example.com"
//                       value={formData.email}
//                       onChange={handleChange}
//                       required
//                       className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
//                     />
//                   </div>
//                 </div>

//                 {/* Password */}
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-gray-700">Password *</label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       placeholder="Create a strong password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                       className="w-full h-10 pl-10 pr-10 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </button>
//                   </div>
                  
//                   {formData.password && (
//                     <div className="space-y-1">
//                       <div className="flex items-center gap-2">
//                         <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className={`h-full ${passwordStrength.color} transition-all`}
//                             style={{ width: `${passwordStrength.strength}%` }}
//                           />
//                         </div>
//                         <span className="text-xs font-medium text-gray-600">{passwordStrength.label}</span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Phone */}
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-gray-700">
//                     Phone {formData.role === 'recruiter' && <span className="text-red-500">*</span>}
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="tel"
//                       name="phone"
//                       placeholder="+8801712345678"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       required={formData.role === 'recruiter'}
//                       className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
//                     />
//                   </div>
//                 </div>

//                 {/* Candidate Skills */}
//                 <AnimatePresence>
//                   {formData.role === "candidate" && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="space-y-1.5"
//                     >
//                       <label className="text-sm font-semibold text-gray-700">
//                         Skills *
//                       </label>
//                       <div className="flex gap-2">
//                         <div className="relative flex-1">
//                           <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                           <input
//                             type="text"
//                             name="skillInput"
//                             placeholder="JavaScript, React..."
//                             value={formData.skillInput}
//                             onChange={handleChange}
//                             onKeyDown={handleAddSkill}
//                             className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
//                           />
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             if (formData.skillInput.trim()) {
//                               const skill = formData.skillInput.trim();
//                               if (!formData.skills.includes(skill)) {
//                                 setFormData(s => ({
//                                   ...s,
//                                   skills: [...s.skills, skill],
//                                   skillInput: ""
//                                 }));
//                               }
//                             }
//                           }}
//                           className="px-4 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap"
//                         >
//                           Add
//                         </button>
//                       </div>
//                       {formData.skills.length > 0 && (
//                         <div className="flex flex-wrap gap-1.5 pt-1">
//                           {formData.skills.map((skill, idx) => (
//                             <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
//                               {skill}
//                               <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:bg-blue-200 rounded-full p-0.5">
//                                 <X className="w-3 h-3" />
//                               </button>
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* Recruiter Fields */}
//                 <AnimatePresence>
//                   {formData.role === "recruiter" && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="space-y-3"
//                     >
//                       <div className="space-y-1.5">
//                         <label className="text-sm font-semibold text-gray-700">Designation *</label>
//                         <div className="relative">
//                           <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                           <input
//                             type="text"
//                             name="designation"
//                             placeholder="Senior Recruiter"
//                             value={formData.designation}
//                             onChange={handleChange}
//                             required
//                             className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
//                           />
//                         </div>
//                       </div>

//                       <div className="space-y-1.5">
//                         <label className="text-sm font-semibold text-gray-700">Agency ID *</label>
//                         <div className="relative">
//                           <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                           <input
//                             type="text"
//                             name="agency"
//                             placeholder="691ad2e2b60132687c6e8d87"
//                             value={formData.agency}
//                             onChange={handleChange}
//                             required
//                             className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono text-xs"
//                           />
//                         </div>
//                         <p className="text-xs text-gray-500 flex items-center gap-1">
//                           <AlertCircle className="w-3 h-3" />
//                           Contact admin for your agency ID
//                         </p>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* Submit */}
//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={isLoading}
//                   className={`w-full h-11 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
//                     isLoading
//                       ? "bg-blue-400 cursor-not-allowed"
//                       : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
//                   }`}
//                 >
//                   {isLoading ? (
//                     <>
//                       <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Creating...
//                     </>
//                   ) : (
//                     <>
//                       Create Account
//                       <ArrowRight className="w-4 h-4" />
//                     </>
//                   )}
//                 </button>

//                 {/* Sign In Link */}
//                 <p className="text-center text-sm text-gray-600 pt-2">
//                   Already have an account?{" "}
//                   <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
//                     Sign In
//                   </Link>
//                 </p>
//               </div>
//             </div>

//             {/* Footer */}
//             <p className="text-center text-xs text-slate-400 mt-4">
//               By signing up, you agree to our{" "}
//               <a href="#" className="text-blue-400 hover:underline">Terms</a> &{" "}
//               <a href="#" className="text-blue-400 hover:underline">Privacy</a>
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Mail, Lock, User, Phone, Building,
  Eye, EyeOff, CheckCircle2, AlertCircle, Code, X, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export const Register = () => {
  type Role = "candidate" | "recruiter";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate" as Role,
    phone: "",
    skills: [] as string[],
    skillInput: "",
    designation: "",
    agency: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const getPasswordStrength = (pwd?: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    return { strength: (s / 5) * 100, label: labels[s - 1] || "", color: colors[s - 1] || "bg-gray-300" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(s => ({ ...s, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && formData.skillInput.trim()) {
      e.preventDefault();
      const skill = formData.skillInput.trim();
      if (!formData.skills.includes(skill)) {
        setFormData(s => ({ ...s, skills: [...s.skills, skill], skillInput: "" }));
      }
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(s => ({ ...s, skills: s.skills.filter(s => s !== skill) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validation
    if (formData.role === "candidate" && formData.skills.length === 0) {
      setError("Please add at least one skill");
      setIsLoading(false);
      return;
    }
    if (formData.role === "recruiter") {
      if (!formData.phone?.trim()) { setError("Phone is required"); setIsLoading(false); return; }
      if (!formData.designation?.trim()) { setError("Designation is required"); setIsLoading(false); return; }
      if (!formData.agency?.trim()) { setError("Agency ID is required"); setIsLoading(false); return; }
    }

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        role: formData.role,
        phone: formData.phone.trim() || undefined,
      };

      if (formData.role === "candidate") payload.skills = formData.skills;
      if (formData.role === "recruiter") {
        payload.designation = formData.designation.trim();
        payload.agency = formData.agency.trim();
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Registration failed");

      // Token & User সঠিকভাবে নেওয়া
      const accessToken = data?.data?.accessToken || data?.accessToken || data?.token;
      const user = data?.data?.user || data?.user;

      if (accessToken) {
        localStorage.setItem("token", accessToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      }
      if (user) localStorage.setItem("user", JSON.stringify(user));

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        const role = user?.role || formData.role;
        if (role === "candidate") navigate("/candidate/dashboard");
        else if (role === "recruiter") navigate("/recruiter/dashboard");
        else if (role === "admin") navigate("/admin/dashboard");
        else navigate("/");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                <p className="text-blue-100 text-sm mt-1">Join our professional community</p>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
                {/* Alerts */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Select Role *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "candidate" as const, label: "Candidate", icon: User },
                      { value: "recruiter" as const, label: "Recruiter", icon: Building },
                    ].map((role) => (
                      <label
                        key={role.value}
                        className={`relative flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.role === role.value
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <role.icon className={`w-5 h-5 ${formData.role === role.value ? "text-blue-600" : "text-gray-400"}`} />
                        <span className={`text-sm font-medium ${formData.role === role.value ? "text-blue-600" : "text-gray-700"}`}>
                          {role.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full h-10 pl-10 pr-10 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Phone {formData.role === 'recruiter' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+8801712345678"
                      value={formData.phone}
                      onChange={handleChange}
                      required={formData.role === 'recruiter'}
                      className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Candidate Skills */}
                <AnimatePresence>
                  {formData.role === "candidate" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-sm font-semibold text-gray-700">
                        Skills *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="skillInput"
                            placeholder="JavaScript, React..."
                            value={formData.skillInput}
                            onChange={handleChange}
                            onKeyDown={handleAddSkill}
                            className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-gray-900"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.skillInput.trim()) {
                              const skill = formData.skillInput.trim();
                              if (!formData.skills.includes(skill)) {
                                setFormData(s => ({
                                  ...s,
                                  skills: [...s.skills, skill],
                                  skillInput: ""
                                }));
                              }
                            }
                          }}
                          className="px-4 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap"
                        >
                          Add
                        </button>
                      </div>
                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formData.skills.map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {skill}
                              <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:bg-blue-200 rounded-full p-0.5">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recruiter Fields */}
                <AnimatePresence>
                  {formData.role === "recruiter" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Designation *</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="designation"
                            placeholder="Senior Recruiter"
                            value={formData.designation}
                            onChange={handleChange}
                            required
                            className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-gray-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Agency ID *</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="agency"
                            placeholder="691ad2e2b60132687c6e8d87"
                            value={formData.agency}
                            onChange={handleChange}
                            required
                            className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono text-xs bg-white text-gray-900"
                          />
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Contact admin for your agency ID
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-full h-11 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Sign In Link */}
                <p className="text-center text-sm text-gray-600 pt-2">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 mt-4">
              By signing up, you agree to our{" "}
              <a href="#" className="text-blue-400 hover:underline">Terms</a> &{" "}
              <a href="#" className="text-blue-400 hover:underline">Privacy</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;