import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Trash.css';

const Trash = ({ fetchNotes }) => {
  const [deletedNotes, setDeletedNotes] = useState([]);

  const fetchDeletedNotes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notes/trash');
      setDeletedNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch trashed notes:', err);
    }
  };

  const restoreNote = async (noteId) => {
    try {
      await axios.put(`http://localhost:5000/api/notes/${noteId}/restore`);
      fetchDeletedNotes();
      fetchNotes(); // refresh active notes
    } catch (err) {
      console.error('Failed to restore note:', err);
    }
  };

  const permanentlyDeleteNote = async (noteId) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${noteId}?force=true`);
      fetchDeletedNotes();
      fetchNotes(); // also update active notes
    } catch (err) {
      console.error('Failed to permanently delete note:', err);
    }
  };

  useEffect(() => {
    fetchDeletedNotes();
  }, []);

  return (
    <div className="trash-container">
      {deletedNotes.length === 0 ? (
        <p className="empty-msg">No deleted notes.</p>
      ) : (
        <div className="trash-grid">
          {deletedNotes.map(note => (
            <div
              key={note._id}
              className="trash-note"
              style={{
                backgroundColor: note.color || '#fff',
                fontFamily: note.font || 'inherit'
              }}
            >
              <div className="trash-content">
                {note.content?.trim() || <i className="placeholder">Empty note</i>}
              </div>

              {note.labels?.length > 0 && (
                <div className="trash-labels">
                  {note.labels.map((label, index) => (
                    <span key={index} className="trash-label">{label}</span>
                  ))}
                </div>
              )}

              <div className="trash-actions">
                <button title="Restore note" onClick={() => restoreNote(note._id)}>♻️</button>
                <button title="Delete permanently" className="delete-btn" onClick={() => permanentlyDeleteNote(note._id)}>❌</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trash;
