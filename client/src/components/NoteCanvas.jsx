import React from 'react';
import axios from 'axios';
import Note from './Note';
import './NoteCanvas.css';

const NoteCanvas = ({
  activeLabel,
  labels,
  setLabels,
  notes,
  setNotes,
  fetchNotes
}) => {
  const updateNote = async (updatedNote) => {
    const isBlank = !updatedNote.content;

    if (updatedNote.tempId && isBlank && !updatedNote._touched) {
      setNotes(prev => prev.filter(n => n.tempId !== updatedNote.tempId));
      return;
    }

    if (updatedNote._id && isBlank && !updatedNote._touched) {
      try {
        const res = await axios.put(`http://localhost:5000/api/notes/${updatedNote._id}`, {
          ...updatedNote,
          content: ''
        });
        setNotes(prev => prev.map(n => n._id === updatedNote._id ? res.data : n));
      } catch (err) {
        console.error('Failed to update blank note:', err);
      }
      return;
    }

    if (updatedNote.tempId && !updatedNote._id) {
      try {
        const res = await axios.post('http://localhost:5000/api/notes', {
          ...updatedNote,
          tempId: undefined
        });
        setNotes(prev =>
          prev.map(n =>
            n.tempId === updatedNote.tempId ? res.data : n
          )
        );
      } catch (err) {
        console.error('Failed to save new note:', err);
      }
      return;
    }

    if (updatedNote._id) {
      try {
        const res = await axios.put(
          `http://localhost:5000/api/notes/${updatedNote._id}`,
          updatedNote
        );
        setNotes(prev =>
          prev.map(n => n._id === updatedNote._id ? res.data : n)
        );

        const noteLabels = updatedNote.labels || [];
        const currentLabelNames = labels.map(l => l.name.toLowerCase());
        const newLabels = noteLabels.filter(
          l => !currentLabelNames.includes(l.toLowerCase())
        );

        if (newLabels.length > 0) {
          const addedLabels = await Promise.all(
            newLabels.map(name =>
              axios.post('http://localhost:5000/api/labels', { name }).then(res => res.data)
            )
          );
          setLabels(prev =>
            [...prev, ...addedLabels].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }
      } catch (err) {
        console.error('Error updating note:', err);
      }
    }
  };

  const handleDelete = async (note, force = false) => {
    try {
      if (force || !note.content?.trim()) {
        await axios.delete(`http://localhost:5000/api/notes/${note._id}?force=true`);
      } else {
        await axios.delete(`http://localhost:5000/api/notes/${note._id}`);
      }
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const togglePin = async (note) => {
    if (!note) return;
    const updated = { ...note, pinned: !note.pinned, _touched: true };
    await updateNote(updated);
  };

  const filterByLabel = (note) => {
    if (activeLabel === 'Trash') return false;
    return activeLabel === 'Notes' || !activeLabel || activeLabel === 'Labels'
      ? !note.deleted
      : note.labels?.includes(activeLabel) && !note.deleted;
  };

  const addTemporaryNote = () => {
    const hasEmptyNote = notes.some(n =>
      (!n.content || n.content.trim() === '') && !n.deleted
    );

    if (hasEmptyNote) {
      alert('Please fill or delete the empty note before adding a new one.');
      return;
    }

    const tempNote = {
      tempId: `temp-${Date.now()}`,
      content: '',
      x: Math.floor(Math.random() * 600),
      y: Math.floor(Math.random() * 400),
      color: '#ffff88',
      font: 'sans-serif',
      pinned: false,
      labels: [],
      deleted: false,
      _touched: false
    };
    setNotes(prev => [...prev, tempNote]);
  };

  const filteredNotes = notes.filter(filterByLabel);
  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.pinned);

  return (
    <div className="canvas-section">
      <div className="canvas-notes note-canvas">
        {[...pinnedNotes, ...unpinnedNotes].map((note) => (
          <Note
            key={note._id || note.tempId}
            note={note}
            onDelete={(noteObj, force) => {
              if (noteObj._id) handleDelete(noteObj, force);
              else if (noteObj.tempId) {
                setNotes(prev => prev.filter(n => n.tempId !== noteObj.tempId));
              }
            }}
            onPin={() => togglePin(note)}
            onUpdate={updateNote}
          />
        ))}
      </div>
      <button className="add-note-btn" onClick={addTemporaryNote} title="Add new note">
        ＋
      </button>
    </div>
  );
};

export default NoteCanvas;
