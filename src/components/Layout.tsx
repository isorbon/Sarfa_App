import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <MobileHeader onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="app-layout">
        {children}
      </div>

      <style>{`
        .app-layout {
          margin-left: 0;
          min-height: 100vh;
          background-color: var(--color-bg-primary);
        }

        @media (min-width: 769px) {
          .app-layout {
            margin-left: 260px;
          }
        }

        @media (max-width: 768px) {
          .app-layout {
            padding-top: 48px; /* Match new mobile header height */
            /* Removed bottom padding since bottom nav is gone */
          }
        }
      `}</style>
    </>
  );
};

export default Layout;
