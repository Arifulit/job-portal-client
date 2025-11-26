import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  return (
    <div className="bg-background text-foreground">
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10 bg-cover bg-center"></div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          >
            Find Your <span className="text-yellow-400">Dream Job</span> Today
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-lg md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto"
          >
            Empowering careers with AI-driven job matching and seamless hiring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto font-semibold shadow-lg">
                Get Started
              </Button>
            </Link>
            <Link to="/about">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-700"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { label: "Active Jobs", value: "10,000+" },
            { label: "Companies", value: "5,000+" },
            { label: "Candidates", value: "50,000+" },
            { label: "Success Rate", value: "95%" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="rounded-xl p-6 bg-gray-50 dark:bg-gray-800 shadow-sm"
            >
              <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Why Choose <span className="text-blue-600">Career-Code</span>?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Discover how our platform helps you grow your career with intelligent tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
              title: "Smart Job Matching",
              desc: "AI-powered algorithms match your skills with top opportunities.",
              color: "blue",
            },
            {
              icon: <Users className="w-6 h-6 text-green-600 dark:text-green-400" />,
              title: "One-Click Apply",
              desc: "Apply to multiple jobs instantly using your saved profile.",
              color: "green",
            },
            {
              icon: <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
              title: "Top Companies",
              desc: "Connect with reputable recruiters across multiple industries.",
              color: "purple",
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
              title: "Career Growth",
              desc: "Track your progress and receive insights to advance faster.",
              color: "orange",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-transform"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-${feature.color}-100 dark:bg-${feature.color}-900/40`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-lg mb-10 text-blue-100">
            Join thousands of professionals already using Career-Code to transform their future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto font-semibold shadow-md"
              >
                Create Account
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-700"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
