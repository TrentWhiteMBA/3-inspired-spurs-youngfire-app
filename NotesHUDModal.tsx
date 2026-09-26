import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Save, Search, BookOpen, FileText, Check, Tag } from 'lucide-react';

export interface StudyNote {
  id: string;
  title: string;
  scriptureRef: string;
  tag: string;
  content: string;
  timestamp: number;
  dateString: string;
}

interface NotesHUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScripture?: (bookId: string, chapter: number) => void;
}

export const NotesHUDModal: React.FC<NotesHUDModalProps> = ({
  isOpen,
  onClose,
  onNavigateToScripture
}) => {
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_study_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');
  const [tag, setTag] = useState('Discipleship');
  const [content, setContent] = useState('');

  // Sync with backend API
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.notes) && data.notes.length > 0) {
          setNotes(data.notes);
          try {
            localStorage.setItem('youngfire_study_notes', JSON.stringify(data.notes));
          } catch {}
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setActiveNoteId(null);
    setTitle('');
    setScriptureRef('');
    setTag('Discipleship');
    setContent('');
  };

  const handleSelectNote = (n: StudyNote) => {
    setIsCreatingNew(false);
    setActiveNoteId(n.id);
    setTitle(n.title);
    setScriptureRef(n.scriptureRef || '');
    setTag(n.tag || 'General');
    setContent(n.content);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const notePayload: StudyNote = {
      id: activeNoteId || `note_${Date.now()}`,
      title: title.trim(),
      scriptureRef: scriptureRef.trim(),
      tag: tag.trim(),
      content: content.trim(),
      timestamp: Date.now(),
      dateString
    };

    let updatedList: StudyNote[] = [];
    if (activeNoteId) {
      updatedList = notes.map(n => n.id === activeNoteId ? notePayload : n);
    } else {
      updatedList = [notePayload, ...notes];
      setActiveNoteId(notePayload.id);
    }

    setNotes(updatedList);
    setIsCreatingNew(false);

    try {
      localStorage.setItem('youngfire_study_notes', JSON.stringify(updatedList));
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notePayload)
      });
    } catch (err) {
      console.error('Error persisting note:', err);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    if (activeNoteId === id) {
      setActiveNoteId(null);
      setIsCreatingNew(false);
    }
    try {
      localStorage.setItem('youngfire_study_notes', JSON.stringify(updated));
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    } catch {}
  };

  if (!isOpen) return null;

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.scriptureRef && n.scriptureRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.tag && n.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-[#0B1329] border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#070C1C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase font-['Outfit'] text-white">
                STUDY NOTES & REVELATION HUD
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Generate, edit & persist personal scripture insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartCreate}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Note</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Notes List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#070C1C]/60">
            {/* Search Bar */}
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B1329] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-60 md:max-h-none">
              {filteredNotes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-serif">
                  No notes found. Tap <strong>New Note</strong> to create your first revelation entry.
                </div>
              ) : (
                filteredNotes.map((n) => {
                  const isSelected = n.id === activeNoteId && !isCreatingNew;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleSelectNote(n)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                          : 'bg-[#0B1329]/80 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white truncate font-['Outfit']">{n.title}</h4>
                        <button
                          onClick={(e) => handleDeleteNote(n.id, e)}
                          className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {n.scriptureRef && (
                        <span className="text-[10px] font-mono text-amber-400 font-bold block mt-0.5">
                          {n.scriptureRef}
                        </span>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300">{n.tag}</span>
                        <span>{n.dateString}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Editor / Detail */}
          <div className="flex-1 flex flex-col bg-[#0B1329] overflow-y-auto p-4 sm:p-6">
            {(isCreatingNew || activeNoteId) ? (
              <form onSubmit={handleSaveNote} className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-400">
                    {isCreatingNew ? 'Create New Revelation Note' : 'Edit Study Note'}
                  </h4>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Note Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Unpacking Ephesians 4:16 in Living Room"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Category / Tag</label>
                    <select
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Discipleship">Discipleship</option>
                      <option value="Open Bible">Open Bible</option>
                      <option value="Men on Fire">Men on Fire</option>
                      <option value="Women Ignited">Women Ignited</option>
                      <option value="Personal Prayer">Personal Prayer</option>
                      <option value="Sermon Notes">Sermon Notes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Scripture Reference Anchor</label>
                  <input
                    type="text"
                    placeholder="e.g., Ephesians 4:16 or Romans 12:1-2"
                    value={scriptureRef}
                    onChange={(e) => setScriptureRef(e.target.value)}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Revelation & Study Notes</label>
                  <textarea
                    placeholder="Write down personal notes, key takeaways, Greek/Hebrew word insights, and prayers..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full flex-1 bg-[#070C1C] border border-white/10 rounded-2xl p-4 text-xs text-white leading-relaxed font-serif focus:outline-none focus:border-amber-400 resize-none"
                    required
                  />
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
                <FileText className="w-12 h-12 text-slate-600" />
                <h4 className="text-sm font-bold text-white font-['Outfit']">No Note Selected</h4>
                <p className="text-xs font-serif max-w-sm">
                  Select a note from the list on the left to read or edit, or tap <strong>New Note</strong> above to capture fresh revelation.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Generate New Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
