import React, { useEffect, useState, useRef } from 'react';
import Reminder from './Reminder';
import './Reminders.css';
import axios from 'axios';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const timeoutIdsRef = useRef({});
  const inputRef = useRef(null);

  // Fetch reminders on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/reminders')
      .then(res => setReminders(res.data))
      .catch(err => console.error('Error fetching reminders:', err));
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  // Handle notifications
  useEffect(() => {
    Object.values(timeoutIdsRef.current).forEach(clearTimeout);
    timeoutIdsRef.current = {};

    const now = new Date();

    reminders.forEach(reminder => {
      const due = new Date(reminder.dueDate);
      const delay = due.getTime() - now.getTime();

      if (delay > 0 && !reminder.isDone) {
        const timeoutId = setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('⏰ Reminder Due', {
              body: `${reminder.title}\n${reminder.description || ''}`,
            });
          }
        }, delay);
        timeoutIdsRef.current[reminder._id] = timeoutId;
      }
    });
  }, [reminders]);

  const handleChange = (e) => {
    setNewReminder({ ...newReminder, [e.target.name]: e.target.value });
  };

  const addReminder = () => {
    const { title, dueDate } = newReminder;
    const due = new Date(dueDate);
    const now = new Date();

    if (!title || !dueDate) {
      return alert('Please fill in both Title and Due Date.');
    }

    if (due <= now) {
      return alert('Due Date must be in the future.');
    }

    axios.post('http://localhost:5000/api/reminders', newReminder)
      .then(res => {
        setReminders(prev => [...prev, res.data]);
        setNewReminder({ title: '', description: '', dueDate: '' });
        inputRef.current?.focus();
      })
      .catch(err => console.error('Error adding reminder:', err));
  };

  const deleteReminder = (id) => {
    axios.delete(`http://localhost:5000/api/reminders/${id}`)
      .then(() => {
        setReminders(prev => prev.filter(rem => rem._id !== id));
        clearTimeout(timeoutIdsRef.current[id]);
        delete timeoutIdsRef.current[id];
      })
      .catch(err => console.error('Error deleting reminder:', err));
  };

  const toggleDone = (id) => {
    const reminder = reminders.find(r => r._id === id);
    if (!reminder) return;

    axios.put(`http://localhost:5000/api/reminders/${id}`, {
      ...reminder,
      isDone: !reminder.isDone
    }).then(res => {
      setReminders(prev => prev.map(r => (r._id === id ? res.data : r)));
    }).catch(err => console.error('Error updating reminder:', err));
  };

  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  return (
    <div className="reminders-page">

      <div className="reminder-form">
        <input
          ref={inputRef}
          type="text"
          name="title"
          placeholder="Reminder title"
          value={newReminder.title}
          onChange={handleChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          value={newReminder.description}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="dueDate"
          value={newReminder.dueDate}
          onChange={handleChange}
        />
        <button onClick={addReminder}>Add</button>
      </div>

      <div className="reminder-list">
        {reminders.length === 0 ? (
          <p className="empty-text">No reminders yet. Add one above!</p>
        ) : (
          sortedReminders.map(reminder => (
            <Reminder
              key={reminder._id}
              reminder={reminder}
              onDelete={deleteReminder}
              onToggleDone={toggleDone}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Reminders;
