// এই ফাইলটি app layout (navbar/sidebar/footer/outlet) structure নিয়ন্ত্রণ করে।
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-clip flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;