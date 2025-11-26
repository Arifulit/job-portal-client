import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <div>
            <Link to="/" className="text-2xl font-bold inline-flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">AI</span>
              Career-Code
            </Link>
            <p className="mt-3 text-sm text-gray-400 max-w-md">
              AI-assisted job portal connecting recruiters and candidates with smart matching,
              role-based dashboards and secure workflows.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">For Candidates</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><Link to="/jobs" className="hover:text-white">Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-white">Create Profile</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">For recruiters</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><Link to="/post-job" className="hover:text-white">Post Job</Link></li>
                <li><Link to="/login" className="hover:text-white">recruiter Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Company</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-gray-400 flex flex-col md:flex-row md:justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Career-Code. All rights reserved.</p>
          <p className="mt-3 md:mt-0">Built with React, TypeScript & Tailwind.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;