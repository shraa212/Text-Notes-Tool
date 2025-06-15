import React, { useEffect, useState } from 'react';
import './Reminder.css';

const Reminder = ({ reminder, onDelete, onToggleDone }) => {
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const checkOverdue = () => {
      const now = new Date();
      const due = new Date(reminder.dueDate);
      setIsOverdue(!reminder.isDone && due <= now);
    };

    checkOverdue(); // Initial check
    const interval = setInterval(checkOverdue, 60 * 1000); // Refresh every minute

    return () => clearInterval(interval);
  }, [reminder]);

  const formattedDate = new Date(reminder.dueDate).toLocaleString();

  return (
    <div
      className={`reminder-card ${reminder.isDone ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}
      title={isOverdue ? 'This reminder is overdue' : ''}
    >
      <div className="reminder-header">
        <h3 className="reminder-title">{reminder.title}</h3>
        <span className="reminder-status">
          {reminder.isDone ? '✅ Done' : isOverdue ? '⏰ Overdue' : '🕒 Pending'}
        </span>
      </div>

      {reminder.description && (
        <p className="reminder-description">{reminder.description}</p>
      )}

      <p className="reminder-due">📅 {formattedDate}</p>

      <div className="reminder-actions">
        <button
          className={`toggle-btn`}
          onClick={() => onToggleDone(reminder._id)}
          aria-label={reminder.isDone ? 'Undo reminder' : 'Mark reminder as done'}
        >
          {reminder.isDone ? 'Undo' : 'Mark as Done'}
        </button>

        <button
          className="delete-btn"
          onClick={() => onDelete(reminder._id)}
          aria-label="Delete reminder"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Reminder;
