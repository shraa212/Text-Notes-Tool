import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import NoteCanvas from './components/NoteCanvas';
import LabelManager from './components/LabelManager';
import Topbar from './components/Topbar';
import Trash from './components/Trash';
import Reminders from './components/Reminders';
import axios from 'axios';

function App() {
  const [activeLabel, setActiveLabel] = useState('Notes');
  const [showLabelsPopup, setShowLabelsPopup] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [labels, setLabels] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);

  const toggleSidebar = () => setSidebarVisible(prev => !prev);

  const fetchLabels = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/labels');
      setLabels(res.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error fetching labels:', err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notes');
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reminders');
      setReminders(res.data);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  };

  const handleMoveToTrash = async (note) => {
    try {
      if (!note.content?.trim()) {
        await axios.delete(`http://localhost:5000/api/notes/${note._id}?force=true`);
      } else {
        await axios.put(`http://localhost:5000/api/notes/${note._id}`, { deleted: true });
      }
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete/move note:', err);
    }
  };

  useEffect(() => {
    fetchLabels();
    fetchNotes();
    fetchReminders();
  }, []);

  const renderMainContent = () => {
    if (activeLabel === 'Reminders') {
      return (
        <Reminders
          reminders={reminders}
          setReminders={setReminders}
          fetchReminders={fetchReminders}
        />
      );
    }

    if (activeLabel === 'Trash') {
      return <Trash fetchNotes={fetchNotes} fetchLabels={fetchLabels} />;
    }

    return (
      <NoteCanvas
        activeLabel={activeLabel}
        labels={labels}
        setLabels={setLabels}
        notes={notes}
        setNotes={setNotes}
        fetchNotes={fetchNotes}
        moveToTrash={handleMoveToTrash}
      />
    );
  };

  return (
    <div className="app-container">
      <Topbar onToggleSidebar={toggleSidebar} />

      <div className="main-content">
        {sidebarVisible && (
          <Sidebar
            activeLabel={activeLabel}
            setActiveLabel={setActiveLabel}
            toggleLabels={setShowLabelsPopup}
            labels={labels}
          />
        )}

        <div className="note-canvas">
          {renderMainContent()}
        </div>
      </div>

      {showLabelsPopup && activeLabel === 'Labels' && (
        <LabelManager
          setActiveLabel={setActiveLabel}
          labels={labels}
          setLabels={setLabels}
          refreshNotes={fetchNotes}
        />
      )}
    </div>
  );
}

export default App;
