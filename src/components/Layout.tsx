import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { PageType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
      
      {/* Main content */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'ml-64' : 'ml-16'}
        pb-16
      `}>
        <main className="p-6 max-w-full">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;