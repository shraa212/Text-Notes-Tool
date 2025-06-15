import React from 'react';
import './Topbar.css';

const Topbar = ({ onToggleSidebar }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          ☰
        </button>
        <h1 className="topbar-title">Sticky Notes 📝</h1>
      </div>

      <div className="topbar-actions">
        {/* Add note button, profile, search, etc. can go here */}
      </div>
    </header>
  );
};

export default Topbar;
