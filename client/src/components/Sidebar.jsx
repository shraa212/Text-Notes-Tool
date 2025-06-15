import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeLabel, setActiveLabel, toggleLabels, labels }) => {
  const menuItems = [
    { label: 'Notes', icon: '📁' },
    { label: 'Reminders', icon: '🔔' },
    { label: 'Trash', icon: '🗑️' },
  ];

  const handleClick = (label) => {
    setActiveLabel(label);
    toggleLabels(label === 'Labels');
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <ul>
          {menuItems.map(({ label, icon }) => (
            <li
              key={label}
              className={activeLabel === label ? 'active' : ''}
              onClick={() => handleClick(label)}
            >
              {icon} {label}
            </li>
          ))}
        </ul>
      </nav>

      <hr />

      <div className="label-section">
        <h4
          className={activeLabel === 'Labels' ? 'active' : ''}
          onClick={() => handleClick('Labels')}
        >
          🏷️ Manage Labels
        </h4>

        {labels.length > 0 && (
          <ul className="label-list">
            {labels.map((label) => (
              <li
                key={label._id || label.name}
                className={activeLabel === label.name ? 'active' : ''}
                onClick={() => handleClick(label.name)}
              >
                🏷️ {label.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
