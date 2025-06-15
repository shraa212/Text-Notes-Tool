import React, { useState, useRef, useEffect } from 'react';
import './Note.css';

const fonts = [
  { label: 'Aa', size: '14px' },
  { label: 'H1', size: '24px' },
  { label: 'H2', size: '18px' },
];

const colorOptions = [
  '#fff475', '#f28b82', '#fbbc04', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8'
];

const Note = ({ note, onDelete, onPin, onUpdate }) => {
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content || '');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showFontToolbar, setShowFontToolbar] = useState(false);
  const [fontStyle, setFontStyle] = useState({ bold: false, italic: false, underline: false, strike: false });
  const [fontSize, setFontSize] = useState('14px');

  const noteRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (noteRef.current && !noteRef.current.contains(event.target)) {
        setShowFontToolbar(false);
        setShowColorPalette(false);
        if (isEditing) handleContentUpdate();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editedContent]);

  const handleAddLabel = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    onUpdate({ ...note, labels: [...(note.labels || []), trimmed], _touched: true });
    setNewLabel('');
    setShowLabelInput(false);
  };

  const handleRemoveLabel = (labelToRemove) => {
    const updatedLabels = note.labels.filter(label => label !== labelToRemove);
    onUpdate({ ...note, labels: updatedLabels, _touched: true });
  };

  const handleContentUpdate = () => {
    setIsEditing(false);
    onUpdate({ ...note, content: editedContent, _touched: true });
  };

  const handleDragEnd = (e) => {
    if (note.deleted) return;

    const canvas = document.querySelector('.note-canvas');
    if (!canvas || !noteRef.current) return;

    const noteEl = noteRef.current;
    const sidebar = document.querySelector('.sidebar');
    const topbar = document.querySelector('.topbar');

    const canvasRect = canvas.getBoundingClientRect();
    const noteWidth = noteEl.offsetWidth;
    const noteHeight = noteEl.offsetHeight;

    const sidebarVisible = sidebar && window.getComputedStyle(sidebar).display !== 'none';
    const sidebarWidth = sidebarVisible ? sidebar.offsetWidth : 0;
    const topbarHeight = topbar ? topbar.offsetHeight : 0;
    const margin = 10;

    const clientX = e.clientX;
    const clientY = e.clientY;

    let newX = clientX - canvasRect.left - noteWidth / 2;
    let newY = clientY - canvasRect.top - noteHeight / 2;

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    const minX = sidebarVisible ? sidebarWidth + margin : margin;
    const maxX = canvasWidth - noteWidth - margin;

    const minY = topbarHeight + margin;
    const maxY = canvasHeight - noteHeight - margin;

    const clampedX = Math.max(minX, Math.min(newX, maxX));
    const clampedY = Math.max(minY, Math.min(newY, maxY));

    onUpdate({ ...note, x: clampedX, y: clampedY, _touched: true });
  };

  const toggleStyle = (style) => {
    setFontStyle(prev => ({ ...prev, [style]: !prev[style] }));
  };

  const computedStyle = {
    fontWeight: fontStyle.bold ? 'bold' : 'normal',
    fontStyle: fontStyle.italic ? 'italic' : 'normal',
    textDecoration: `${fontStyle.underline ? 'underline ' : ''}${fontStyle.strike ? 'line-through' : ''}`.trim(),
    fontSize
  };

  const applyFontSize = (label) => {
    const selected = fonts.find(f => f.label === label);
    if (selected) setFontSize(selected.size);
  };

  return (
    <div
      className={`note${note.deleted ? ' deleted' : ''}`}
      style={{ backgroundColor: note.color || '#fff', fontFamily: 'inherit', left: note.x, top: note.y, position: 'absolute' }}
      draggable={!note.deleted}
      onDragEnd={handleDragEnd}
      ref={noteRef}
    >
      <div className="note-content">
        {note.deleted ? (
          <p>{note.content?.length ? note.content : <i className="placeholder">Empty note</i>}</p>
        ) : isEditing ? (
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            autoFocus
            style={computedStyle}
            placeholder="Write your note..."
          />
        ) : (
          <p onClick={() => setIsEditing(true)}>{note.content?.length ? note.content : <i className="placeholder">Click to edit...</i>}</p>
        )}
      </div>

      {note.labels?.length > 0 && (
        <div className="note-labels">
          {note.labels.map(label => (
            <span className="note-label" key={label}>
              {label}
              {!note.deleted && <button onClick={() => handleRemoveLabel(label)}>×</button>}
            </span>
          ))}
        </div>
      )}

      {!note.deleted && showLabelInput && (
        <div className="note-label-input">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Add label"
          />
          <button onClick={handleAddLabel}>Add</button>
        </div>
      )}

      {!note.deleted && (
        <div className="note-tools">
          <div className="toggle-icon" onClick={() => setShowFontToolbar(prev => !prev)}>🅰️</div>
          <div className="toggle-icon" onClick={() => setShowColorPalette(prev => !prev)}>🎨</div>

          {showFontToolbar && (
            <div className="font-toolbar">
              {fonts.map((f, index) => (
                <button key={index} onClick={() => applyFontSize(f.label)}>{f.label}</button>
              ))}
              <button onClick={() => toggleStyle('bold')}>B</button>
              <button onClick={() => toggleStyle('italic')}>I</button>
              <button onClick={() => toggleStyle('underline')}>U</button>
              <button onClick={() => toggleStyle('strike')}>S</button>
            </div>
          )}

          {showColorPalette && (
            <div className="color-toolbar">
              {colorOptions.map((color, index) => (
                <div
                  key={index}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onUpdate({ ...note, color, _touched: true });
                    setShowColorPalette(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="note-actions">
        {note.deleted ? (
          <>
            <button onClick={() => onUpdate({ ...note, deleted: false })}>♻️ Restore</button>
            <button onClick={() => onDelete(note, true)}>❌ Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => onPin(note._id)} title="Toggle Pin">{note.pinned ? '📌' : '📍'}</button>
            <button
              onClick={() => {
                if (!note.labels || note.labels.length === 0) {
                  setShowLabelInput(prev => !prev);
                }
              }}
              title={note.labels?.length > 0 ? 'Remove label first' : 'Add label'}
              disabled={note.labels?.length > 0}
            >
              🏷️
            </button>
            <button onClick={() => onDelete(note)} title="Delete">🗑️</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Note;
