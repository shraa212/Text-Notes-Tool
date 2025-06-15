import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './LabelManager.css';

const LabelManager = ({ setActiveLabel, labels, setLabels, refreshNotes }) => {
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setActiveLabel('Notes');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveLabel]);

  const addLabel = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      setError('Label cannot be empty!');
      return;
    }

    if (labels.some(label => label.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Label already exists!');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/labels', { name: trimmed });
      setLabels(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewLabel('');
      setError('');
    } catch (err) {
      setError('Error adding label!');
      console.error(err);
    }
  };

  const deleteLabel = async (id) => {
    try {
      // 1. Get label name
      const labelToDelete = labels.find(l => l._id === id);
      if (!labelToDelete) return;

      // 2. Delete from DB
      await axios.delete(`http://localhost:5000/api/labels/${id}`);

      // 3. Remove from state
      setLabels(prev => prev.filter(label => label._id !== id));
      if (labels.length === 1) setActiveLabel('Notes');

      // 4. Get all notes with this label
      const notesRes = await axios.get('http://localhost:5000/api/notes');
      const notesWithLabel = notesRes.data.filter(note =>
        note.labels.includes(labelToDelete.name)
      );

      // 5. Update notes to remove the label
      await Promise.all(notesWithLabel.map(note => {
        const updatedLabels = note.labels.filter(l => l !== labelToDelete.name);
        return axios.put(`http://localhost:5000/api/notes/${note._id}`, {
          ...note,
          labels: updatedLabels
        });
      }));

      // 6. Refresh notes in UI
      if (typeof refreshNotes === 'function') refreshNotes();

    } catch (err) {
      console.error('Error deleting label and updating notes:', err);
    }
  };

  return (
    <div className="label-manager-overlay">
      <div className="label-manager-box" ref={modalRef}>
        <h3>Manage Labels 🏷️</h3>

        <div className="label-input">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setError('');
            }}
            placeholder="Enter label name"
            onKeyDown={(e) => e.key === 'Enter' && addLabel()}
          />
          <button onClick={addLabel}>Add</button>
        </div>

        {error && <p className="label-error">{error}</p>}

        <ul className="label-list">
          {labels.map((label) => (
            <li key={label._id}>
              <span
                onClick={() => setActiveLabel(label.name)}
                title="Click to filter by this label"
              >
                {label.name}
              </span>
              <button
                onClick={() => deleteLabel(label._id)}
                title="Delete label"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LabelManager;
