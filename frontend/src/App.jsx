import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { authApi, bookmarksApi, documentsApi, notesApi } from "./services/api";

const emptyNote = {
  title: "",
  content: "",
  tags: "",
};

const emptyResourceForm = {
  title: "",
  content: "",
  url: "",
  description: "",
  tags: "",
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const [showAuth, setShowAuth] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = isRegister
        ? await authApi.register({ name, email, password })
        : await authApi.login({ email, password });

      if (isRegister) {
        setMessage("Registration successful! You can now login. 🎉");
        setIsRegister(false);
        setName("");
        setPassword("");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage(error.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setMessage("");
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setShowAuth(false);
  };

  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return showAuth ? (
    <div className="auth-layout">
      <button className="ghost-button auth-back" onClick={() => setShowAuth(false)}>← Back to home</button>
      <div className="login-card">
        <div className="logo">🧠</div>
        <h1>Personal Second Brain</h1>
        <p className="subtitle">
          {isRegister
            ? "Create your personal knowledge space."
            : "Your personal knowledge, organized intelligently."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading
              ? isRegister ? "Creating account..." : "Logging in..."
              : isRegister ? "Create account" : "Login"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="register-text">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button type="button" className="inline-link" onClick={switchMode}>
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  ) : (
    <LandingPage
      onGetStarted={() => {
        setIsRegister(true);
        setShowAuth(true);
      }}
      onLogin={() => {
        setIsRegister(false);
        setShowAuth(true);
      }}
    />
  );
}

function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="app landing-page">
      <nav className="landing-nav">
        <div className="brand"><span className="brand-mark">🧠</span><span>Second Brain</span></div>
        <div className="landing-nav-actions">
          <button className="nav-login" onClick={onLogin}>Log in</button>
          <button className="nav-cta" onClick={onGetStarted}>Start for free</button>
        </div>
      </nav>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow">A calmer way to think</p>
            <h1>Your ideas deserve a place to <em>grow.</em></h1>
            <p>Second Brain turns scattered thoughts, useful links, and hard-won lessons into a personal knowledge space you can actually return to.</p>
            <div className="hero-actions">
              <button className="nav-cta" onClick={onGetStarted}>Build your second brain →</button>
              <button className="ghost-button" onClick={() => document.getElementById("features")?.scrollIntoView()}>Explore features ↓</button>
            </div>
          </div>
          <div className="hero-visual" aria-label="Example note preview">
            <article className="hero-note">
              <small>Friday, 9:42 AM · Daily note</small>
              <h2>Make room for the ideas that matter.</h2>
              <p>Capture the spark now. Organize it when the shape becomes clear. Your future self will thank you.</p>
              <div className="hero-note-tags"><span>#reflection</span><span>#ideas</span><span>#focus</span></div>
              <div className="hero-note-line" />
            </article>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="section-intro">
            <p className="eyebrow">Everything in one thoughtful place</p>
            <h2>Less hunting. More connecting.</h2>
            <p>A lightweight toolkit for collecting what you learn and making it useful later.</p>
          </div>
          <div className="feature-grid">
            <Feature icon="📝" title="Notes" text="Write freely, add tags, and keep your best thinking easy to find." />
            <Feature icon="📄" title="Documents" badge="Soon" text="Keep longer reading, references, and the context around them close at hand." />
            <Feature icon="🔗" title="Bookmarks" badge="Soon" text="Save useful links before they disappear into another browser tab." />
            <Feature icon="💻" title="Code" badge="Soon" text="Keep snippets and practical lessons alongside the ideas they support." />
            <Feature icon="🔎" title="Search" badge="Soon" text="Find the thread across your growing personal knowledge library." />
            <Feature icon="🤖" title="AI Assistant" badge="Soon" text="Get help making sense of your collection when you need a second perspective." />
          </div>
        </section>
      </main>

      <footer className="landing-footer"><span>Second Brain</span><span>Keep the good ideas close.</span></footer>
    </div>
  );
}

function Feature({ icon, title, badge, text }) {
  return <article className="feature"><div className="feature-topline"><div className="feature-icon">{icon}</div>{badge && <span className="feature-badge">{badge}</span>}</div><h3>{title}</h3><p>{text}</p></article>;
}

function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteForm, setNoteForm] = useState(emptyNote);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [resourceEditor, setResourceEditor] = useState({ type: null, id: null, form: emptyResourceForm });
  const [isSavingResource, setIsSavingResource] = useState(false);
  const token = localStorage.getItem("token");

  const fetchNotes = useCallback(() => notesApi.getAll(token), [token]);

  const loadNotes = async () => {
    if (!token) {
      return;
    }

    setIsLoadingNotes(true);
    setNotesError("");

    try {
      const data = await fetchNotes();
      setNotes(data.notes || []);
    } catch (error) {
      setNotesError(error.message || "Unable to load your notes.");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const loadInitialNotes = async () => {
      try {
        const data = await fetchNotes();
        if (isCurrent) {
          setNotes(data.notes || []);
        }
      } catch (error) {
        if (isCurrent) {
          setNotesError(error.message || "Unable to load your notes.");
        }
      } finally {
        if (isCurrent) {
          setIsLoadingNotes(false);
        }
      }
    };

    loadInitialNotes();

    const loadResources = async () => {
      try {
        const [documentsData, bookmarksData] = await Promise.all([
          documentsApi.getAll(token),
          bookmarksApi.getAll(token),
        ]);
        if (isCurrent) {
          setDocuments(documentsData.items || []);
          setBookmarks(bookmarksData.items || []);
        }
      } catch (error) {
        if (isCurrent) {
          setNotesError(error.message || "Unable to load your documents and bookmarks.");
        }
      } finally {
        if (isCurrent) {
          setIsLoadingResources(false);
        }
      }
    };

    loadResources();

    return () => {
      isCurrent = false;
    };
  }, [fetchNotes, token]);

  const showDashboard = () => {
    setActiveView("dashboard");
    setIsEditorOpen(false);
    setResourceEditor({ type: null, id: null, form: emptyResourceForm });
  };

  const showNotes = () => {
    setActiveView("notes");
    setIsEditorOpen(false);
    setResourceEditor({ type: null, id: null, form: emptyResourceForm });
  };

  const showResource = (type) => {
    setActiveView(type);
    setIsEditorOpen(false);
    setResourceEditor({ type: null, id: null, form: emptyResourceForm });
  };

  const showSettings = () => {
    setActiveView("settings");
    setIsEditorOpen(false);
    setResourceEditor({ type: null, id: null, form: emptyResourceForm });
  };

  const openCreateNote = () => {
    setEditingNoteId(null);
    setNoteForm(emptyNote);
    setIsEditorOpen(true);
    setActiveView("notes");
    setResourceEditor({ type: null, id: null, form: emptyResourceForm });
  };

  const openCreateResource = (type) => {
    setResourceEditor({ type, id: null, form: emptyResourceForm });
    setActiveView(type);
    setIsEditorOpen(false);
  };

  const openEditResource = (type, item) => {
    setResourceEditor({
      type,
      id: item.id,
      form: {
        title: item.title || "",
        content: item.content || "",
        url: item.url || "",
        description: item.description || "",
        tags: (item.tags || []).join(", "),
      },
    });
    setActiveView(type);
    setIsEditorOpen(false);
  };

  const closeResourceEditor = () => {
    setResourceEditor({ type: null, id: null, form: emptyResourceForm });
  };

  const loadResources = async () => {
    setIsLoadingResources(true);
    try {
      const [documentsData, bookmarksData] = await Promise.all([
        documentsApi.getAll(token),
        bookmarksApi.getAll(token),
      ]);
      setDocuments(documentsData.items || []);
      setBookmarks(bookmarksData.items || []);
    } catch (error) {
      setNotesError(error.message || "Unable to load your documents and bookmarks.");
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleSaveResource = async (event) => {
    event.preventDefault();
    const { type, id, form } = resourceEditor;
    const payload = type === "documents"
      ? { title: form.title, content: form.content, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }
      : { title: form.title, url: form.url, description: form.description, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
    const api = type === "documents" ? documentsApi : bookmarksApi;

    setIsSavingResource(true);
    setNotesError("");
    try {
      if (id) {
        await api.update(token, id, payload);
      } else {
        await api.create(token, payload);
      }
      closeResourceEditor();
      await loadResources();
    } catch (error) {
      setNotesError(error.message || `Unable to save ${type}.`);
    } finally {
      setIsSavingResource(false);
    }
  };

  const handleDeleteResource = async (type, id) => {
    if (!window.confirm(`Delete this ${type === "documents" ? "document" : "bookmark"}? This cannot be undone.`)) return;
    try {
      const api = type === "documents" ? documentsApi : bookmarksApi;
      await api.remove(token, id);
      if (resourceEditor.id === id) closeResourceEditor();
      await loadResources();
    } catch (error) {
      setNotesError(error.message || `Unable to delete ${type}.`);
    }
  };

  const openEditNote = (note) => {
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: (note.tags || []).join(", "),
    });
    setIsEditorOpen(true);
    setActiveView("notes");
    setResourceEditor({ type: null, id: null, form: emptyResourceForm });
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingNoteId(null);
    setNoteForm(emptyNote);
  };

  const handleSaveNote = async (event) => {
    event.preventDefault();
    const note = {
      title: noteForm.title,
      content: noteForm.content,
      tags: noteForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    setIsSaving(true);
    setNotesError("");

    try {
      if (editingNoteId) {
        await notesApi.update(token, editingNoteId, note);
      } else {
        await notesApi.create(token, note);
      }

      closeEditor();
      await loadNotes();
    } catch (error) {
      setNotesError(error.message || "Unable to save your note.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) {
      return;
    }

    setNotesError("");

    try {
      await notesApi.remove(token, noteId);
      if (editingNoteId === noteId) {
        closeEditor();
      }
      await loadNotes();
    } catch (error) {
      setNotesError(error.message || "Unable to delete your note.");
    }
  };

  const recentNotes = notes.slice(0, 4);

  return (
    <div className="dashboard">
      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo"><span className="brain-icon">🧠</span><span>Second Brain</span></div>
        <button
          className="sidebar-toggle"
          type="button"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        >
          {isSidebarCollapsed ? "›" : "‹"}
        </button>
        <nav>
          <button
            className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
            onClick={showDashboard}
          >
            <span>🏠</span> Dashboard
          </button>
          <button
            className={`nav-item ${activeView === "notes" ? "active" : ""}`}
            onClick={showNotes}
          >
            <span>📝</span> Notes
          </button>
          <button
            className={`nav-item ${activeView === "settings" ? "active" : ""}`}
            onClick={showSettings}
          >
            <span>⚙️</span> Settings
          </button>
          <button className={`nav-item ${activeView === "documents" ? "active" : ""}`} onClick={() => showResource("documents")}><span>📄</span> Documents</button>
          <button className={`nav-item ${activeView === "bookmarks" ? "active" : ""}`} onClick={() => showResource("bookmarks")}><span>🔗</span> Bookmarks</button>
          <div className="nav-item disabled"><span>💻</span> Code <em>Soon</em></div>
          <div className="nav-item disabled"><span>🔎</span> Search <em>Soon</em></div>
          <div className="nav-item disabled"><span>🤖</span> AI Assistant <em>Soon</em></div>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h2>{activeView === "dashboard" ? "Dashboard" : activeView === "notes" ? "Notes" : activeView === "documents" ? "Documents" : activeView === "bookmarks" ? "Bookmarks" : "Profile & settings"}</h2>
            <p>{activeView === "dashboard" ? "Your personal knowledge at a glance." : activeView === "notes" ? "Capture and organize what matters to you." : activeView === "documents" ? "Keep your longer thoughts and references organized." : activeView === "bookmarks" ? "Save the links worth returning to." : "Make this space feel like yours."}</p>
          </div>
          <div className="profile">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase() || "?"}</div>
            <span>{user?.name || "Account"}</span>
            <div className="profile-menu">
              <button className={activeView === "settings" ? "active" : ""} onClick={showSettings}>Settings</button>
            </div>
            <button className="logout-button" onClick={onLogout}>Logout</button>
          </div>
        </header>

        {notesError && <div className="notice error">{notesError}</div>}

        {activeView === "dashboard" ? (
          <DashboardOverview
            user={user}
            noteCount={notes.length}
            documentCount={documents.length}
            bookmarkCount={bookmarks.length}
            recentNotes={recentNotes}
            isLoading={isLoadingNotes}
            onShowNotes={showNotes}
            onCreate={openCreateNote}
            onEdit={openEditNote}
            onDelete={handleDeleteNote}
          />
        ) : activeView === "notes" ? (
          <NotesWorkspace
            notes={notes}
            isLoading={isLoadingNotes}
            isEditorOpen={isEditorOpen}
            editingNoteId={editingNoteId}
            noteForm={noteForm}
            isSaving={isSaving}
            onCreate={openCreateNote}
            onEdit={openEditNote}
            onDelete={handleDeleteNote}
            onCloseEditor={closeEditor}
            onChangeForm={setNoteForm}
            onSave={handleSaveNote}
          />
        ) : activeView === "documents" || activeView === "bookmarks" ? (
          <ResourceWorkspace
            type={activeView}
            items={activeView === "documents" ? documents : bookmarks}
            isLoading={isLoadingResources}
            editor={resourceEditor}
            isSaving={isSavingResource}
            onCreate={() => openCreateResource(activeView)}
            onEdit={(item) => openEditResource(activeView, item)}
            onDelete={(id) => handleDeleteResource(activeView, id)}
            onCloseEditor={closeResourceEditor}
            onChangeForm={(form) => setResourceEditor((current) => ({ ...current, form }))}
            onSave={handleSaveResource}
          />
        ) : (
          <SettingsPanel user={user} />
        )}
      </main>
    </div>
  );
}

function DashboardOverview({ user, noteCount, documentCount, bookmarkCount, recentNotes, isLoading, onShowNotes, onCreate, onEdit, onDelete }) {
  return (
    <>
      <section className="welcome-section">
        <h1>Welcome back, {user?.name || "there"} 👋</h1>
        <p>Capture, organize, and rediscover your knowledge.</p>
      </section>

      <section className="stats">
        <StatCard icon="📝" label="Notes" value={noteCount} />
        <StatCard icon="📄" label="Documents" value={documentCount} />
        <StatCard icon="🔗" label="Bookmarks" value={bookmarkCount} />
        <StatCard icon="💻" label="Code snippets" value="0" />
      </section>

      <section className="recent-section">
        <div className="section-header">
          <div>
            <h2>Recent notes</h2>
            <p>Your latest knowledge entries</p>
          </div>
          <div className="header-actions">
            <button className="secondary-button" onClick={onShowNotes}>View all</button>
            <button className="primary-action" onClick={onCreate}>+ New note</button>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state"><p>Loading your notes…</p></div>
        ) : recentNotes.length ? (
          <div className="note-grid">
            {recentNotes.map((note) => <NoteCard key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        ) : (
          <EmptyNotes onCreate={onCreate} />
        )}
      </section>
    </>
  );
}

function SettingsPanel({ user }) {
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({
    dailyReminder: true,
    compactCards: false,
  });

  const saveProfile = (event) => {
    event.preventDefault();
    const updatedUser = { ...user, name: displayName, email };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const togglePreference = (key) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <section className="settings-panel">
      <div className="settings-profile">
        <div className="avatar">{displayName?.charAt(0).toUpperCase() || "?"}</div>
        <div>
          <h2>{displayName || "Your profile"}</h2>
          <p>Personal workspace member</p>
        </div>
      </div>
      <form className="settings-form" onSubmit={saveProfile}>
        <h3>Profile details</h3>
        <div className="input-group">
          <label htmlFor="profile-name">Display name</label>
          <input id="profile-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="profile-email">Email address</label>
          <input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="settings-actions">
          <button type="submit" className="primary-action">Save profile</button>
          {saved && <span className="saved-message">Profile saved</span>}
        </div>
      </form>
      <div className="settings-form">
        <h3>Preferences</h3>
        <div className="setting-row">
          <div><strong>Daily reflection reminder</strong><p>Keep a gentle nudge to capture what you learned.</p></div>
          <button type="button" className={`toggle ${preferences.dailyReminder ? "on" : ""}`} aria-label="Toggle daily reflection reminder" onClick={() => togglePreference("dailyReminder")} />
        </div>
        <div className="setting-row">
          <div><strong>Compact note cards</strong><p>Fit more of your knowledge on screen at once.</p></div>
          <button type="button" className={`toggle ${preferences.compactCards ? "on" : ""}`} aria-label="Toggle compact note cards" onClick={() => togglePreference("compactCards")} />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <div>
        <h3>{label}</h3>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function NotesWorkspace({
  notes,
  isLoading,
  isEditorOpen,
  editingNoteId,
  noteForm,
  isSaving,
  onCreate,
  onEdit,
  onDelete,
  onCloseEditor,
  onChangeForm,
  onSave,
}) {
  return (
    <section className="notes-workspace">
      <div className="section-header">
        <div>
          <h2>My notes</h2>
          <p>{notes.length} {notes.length === 1 ? "note" : "notes"} in your second brain</p>
        </div>
        <button className="primary-action" onClick={onCreate}>+ New note</button>
      </div>

      {isEditorOpen && (
        <form className="note-editor" onSubmit={onSave}>
          <div className="editor-heading">
            <h3>{editingNoteId ? "Edit note" : "Create a new note"}</h3>
            <button type="button" className="text-button" onClick={onCloseEditor}>Cancel</button>
          </div>
          <label>
            Title
            <input
              type="text"
              value={noteForm.title}
              onChange={(event) => onChangeForm({ ...noteForm, title: event.target.value })}
              placeholder="What do you want to remember?"
              maxLength="255"
              required
            />
          </label>
          <label>
            Content
            <textarea
              value={noteForm.content}
              onChange={(event) => onChangeForm({ ...noteForm, content: event.target.value })}
              placeholder="Write your thought, idea, or learning here…"
              rows="7"
              required
            />
          </label>
          <label>
            Tags <span>Separate tags with commas</span>
            <input
              type="text"
              value={noteForm.tags}
              onChange={(event) => onChangeForm({ ...noteForm, tags: event.target.value })}
              placeholder="e.g. learning, productivity"
            />
          </label>
          <div className="editor-actions">
            <button type="button" className="secondary-button" onClick={onCloseEditor}>Cancel</button>
            <button type="submit" className="primary-action" disabled={isSaving}>
              {isSaving ? "Saving…" : editingNoteId ? "Save changes" : "Create note"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="empty-state"><p>Loading your notes…</p></div>
      ) : notes.length ? (
        <div className="note-grid all-notes">
          {notes.map((note) => <NoteCard key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      ) : !isEditorOpen ? (
        <EmptyNotes onCreate={onCreate} />
      ) : null}
    </section>
  );
}

function ResourceWorkspace({ type, items, isLoading, editor, isSaving, onCreate, onEdit, onDelete, onCloseEditor, onChangeForm, onSave }) {
  const isDocument = type === "documents";
  const label = isDocument ? "document" : "bookmark";

  return (
    <section className="notes-workspace">
      <div className="section-header">
        <div>
          <h2>My {type}</h2>
          <p>{items.length} {items.length === 1 ? label : `${label}s`} in your second brain</p>
        </div>
        <button className="primary-action" onClick={onCreate}>+ New {label}</button>
      </div>

      {editor.type && (
        <form className="note-editor" onSubmit={onSave}>
          <div className="editor-heading">
            <h3>{editor.id ? `Edit ${label}` : `Create a new ${label}`}</h3>
            <button type="button" className="text-button" onClick={onCloseEditor}>Cancel</button>
          </div>
          <label>
            Title
            <input type="text" value={editor.form.title} onChange={(event) => onChangeForm({ ...editor.form, title: event.target.value })} maxLength="255" required />
          </label>
          {isDocument ? (
            <label>
              Content
              <textarea value={editor.form.content} onChange={(event) => onChangeForm({ ...editor.form, content: event.target.value })} placeholder="Write or paste your document here…" rows="8" required />
            </label>
          ) : (
            <>
              <label>
                URL
                <input type="url" value={editor.form.url} onChange={(event) => onChangeForm({ ...editor.form, url: event.target.value })} placeholder="https://example.com" required />
              </label>
              <label>
                Description
                <textarea value={editor.form.description} onChange={(event) => onChangeForm({ ...editor.form, description: event.target.value })} placeholder="What makes this worth keeping?" rows="4" />
              </label>
            </>
          )}
          <label>
            Tags <span>Separate tags with commas</span>
            <input type="text" value={editor.form.tags} onChange={(event) => onChangeForm({ ...editor.form, tags: event.target.value })} placeholder="e.g. research, work" />
          </label>
          <div className="editor-actions">
            <button type="button" className="secondary-button" onClick={onCloseEditor}>Cancel</button>
            <button type="submit" className="primary-action" disabled={isSaving}>{isSaving ? "Saving…" : editor.id ? "Save changes" : `Create ${label}`}</button>
          </div>
        </form>
      )}

      {isLoading ? <div className="empty-state"><p>Loading your {type}…</p></div> : items.length ? (
        <div className="note-grid all-notes">
          {items.map((item) => (
            <article className="note-card" key={item.id}>
              <div className="note-card-heading"><h3>{item.title}</h3><span>{formatDate(item.updated_at)}</span></div>
              {isDocument ? <p>{item.content}</p> : <><a className="resource-link" href={item.url} target="_blank" rel="noreferrer">{item.url}</a><p>{item.description || "No description added."}</p></>}
              {item.tags?.length > 0 && <div className="tag-list">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
              <div className="note-actions"><button className="text-button" onClick={() => onEdit(item)}>Edit</button><button className="text-button delete-text" onClick={() => onDelete(item.id)}>Delete</button></div>
            </article>
          ))}
        </div>
      ) : !editor.type ? (
        <div className="empty-state"><div>{isDocument ? "📄" : "🔗"}</div><h3>No {type} yet</h3><p>Start collecting your {isDocument ? "long-form knowledge" : "most useful links"} here.</p><button className="primary-action" onClick={onCreate}>Create your first {label}</button></div>
      ) : null}
    </section>
  );
}

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <article className="note-card">
      <div className="note-card-heading">
        <h3>{note.title}</h3>
        <span>{formatDate(note.updated_at)}</span>
      </div>
      <p>{note.content}</p>
      {note.tags?.length > 0 && (
        <div className="tag-list">
          {note.tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      )}
      <div className="note-actions">
        <button className="text-button" onClick={() => onEdit(note)}>Edit</button>
        <button className="text-button delete-text" onClick={() => onDelete(note.id)}>Delete</button>
      </div>
    </article>
  );
}

function EmptyNotes({ onCreate }) {
  return (
    <div className="empty-state">
      <div>📝</div>
      <h3>No notes yet</h3>
      <p>Start building your second brain by creating your first note.</p>
      <button className="primary-action" onClick={onCreate}>Create your first note</button>
    </div>
  );
}

function formatDate(date) {
  if (!date) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default App;
