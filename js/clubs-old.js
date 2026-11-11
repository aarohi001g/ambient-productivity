// College Clubs module: category -> club cards -> individual club workspace.
// Uses the app's existing state/save functions so all data remains in localStorage.
const DEFAULT_CATEGORIES = [
  'Technical Clubs',
  'Cultural Clubs',
  'Debating & Literary Clubs',
  'Social Service/NSS Clubs',
  'Other'
];

export function initClubs({ getState, saveState, escapeHTML, toast }) {
  let editingId = null;
  let activeCategory = null;
  let activeId = null;

  const root = document.getElementById('clubsContainer');
  const modal = document.getElementById('clubModal');
  const form = document.getElementById('clubForm');
  if (!root || !modal || !form) return;
  root.insertAdjacentHTML('afterend', `<div class="modal-backdrop club-category-modal" id="clubCategoryModal" aria-hidden="true">
    <div class="modal-box club-category-modal-box" role="dialog" aria-modal="true" aria-labelledby="clubCategoryModalTitle">
      <div class="modal-header"><h3 class="modal-title" id="clubCategoryModalTitle">Create category</h3><button class="icon-btn" type="button" id="closeCategoryModal" aria-label="Close">×</button></div>
      <form id="clubCategoryForm"><label class="form-field"><span class="form-label">Category name</span><input class="form-input" id="newClubCategoryName" maxlength="60" required placeholder="e.g. Sports Clubs"></label>
      <div class="modal-footer"><button class="btn-secondary" type="button" id="cancelCategoryModal">Cancel</button><button class="btn-primary" type="submit">Create category</button></div></form>
    </div>
  </div>`);
  const categoryModal = document.getElementById('clubCategoryModal');
  const categoryForm = document.getElementById('clubCategoryForm');

  const state = () => getState();
  const persist = () => saveState(state());
  const safe = value => escapeHTML(value == null ? '' : String(value));
  const lines = value => String(value || '').split('\n').map(s => s.trim()).filter(Boolean);
  const categories = () => {
    const saved = Array.isArray(state().clubCategories) ? state().clubCategories : [];
    const fromClubs = (state().clubs || []).map(c => c.category).filter(Boolean);
    return [...new Set([...DEFAULT_CATEGORIES, ...saved, ...fromClubs])];
  };
  const clubsIn = category => (state().clubs || []).filter(c => c.category === category);

  function syncCategoryOptions(selected = '') {
    const select = document.getElementById('clubCategory');
    if (!select) return;
    const list = categories();
    select.innerHTML = list.map(c => `<option value="${safe(c)}">${safe(c)}</option>`).join('');
    select.value = list.includes(selected) ? selected : (activeCategory && list.includes(activeCategory) ? activeCategory : list[0]);
  }

  function render() {
    if (activeId) return renderClubWorkspace();
    if (activeCategory) return renderCategory();
    return renderCategories();
  }

  function renderCategories() {
    const list = categories();
    const allClubs = state().clubs || [];
    root.innerHTML = `
      <div class="clubs-toolbar">
        <div><p class="club-eyebrow">CAMPUS LIFE</p><h2 class="section-title">College Clubs</h2>
        <p class="section-subtitle">Your memberships, roles, activities and achievements — organised in one place.</p></div>
        <div class="club-toolbar-actions">
          <button class="btn-secondary" id="addCategoryBtn" type="button">＋ Add Category</button>
        </div>
      </div>
      <div class="club-overview-meta"><span>${list.length} categories</span><span>${allClubs.length} clubs tracked</span></div>
      <div class="club-category-cards">
        ${list.map((category, index) => {
          const count = clubsIn(category).length;
          const accent = ['blue','violet','orange','green','slate'][index % 5];
          return `<button class="club-category-card ${accent}" type="button" data-open-category="${safe(category)}">
            <span class="club-category-icon">${['⌘','✦','文','♡','▧'][index % 5]}</span>
            <span class="club-category-card-copy"><strong>${safe(category)}</strong><small>${count} ${count === 1 ? 'club' : 'clubs'}</small></span>
            <span class="club-category-arrow">↗</span>
          </button>`;
        }).join('')}
        <button class="club-category-card add-category-tile" type="button" id="addCategoryTile">
          <span class="club-add-symbol">＋</span><span class="club-category-card-copy"><strong>Create a category</strong><small>Organise another campus group</small></span>
        </button>
      </div>`;
  }

  function renderCategory() {
    const clubs = clubsIn(activeCategory);
    root.innerHTML = `
      <div class="clubs-toolbar">
        <div class="club-heading-stack">
          <button class="club-back-link" type="button" id="backToCategories">← All categories</button>
          <p class="club-eyebrow">CATEGORY</p><h2 class="section-title">${safe(activeCategory)}</h2>
          <p class="section-subtitle">Every club has its own separate workspace and notes.</p>
        </div>
        <button class="btn-primary" id="addClubBtn" type="button">＋ Add Club</button>
      </div>
      <div class="club-overview-meta"><span>${clubs.length} ${clubs.length === 1 ? 'club' : 'clubs'}</span></div>
      ${clubs.length ? `<div class="club-card-grid">${clubs.map((club, index) => `
        <article class="club-card">
          <div class="club-card-top"><span class="club-card-index">${String(index + 1).padStart(2,'0')}</span><span class="club-status">${safe(club.status || 'Active')}</span></div>
          <h3>${safe(club.name)}</h3>
          <p>${safe(club.designation || 'Member')}${club.joinDate ? ` · Joined ${safe(club.joinDate)}` : ''}</p>
          <div class="club-card-footer">
            <button class="btn-primary" type="button" data-open-club="${safe(club.id)}">Open workspace <span>→</span></button>
            <div class="club-card-actions"><button class="icon-btn" type="button" data-edit-club="${safe(club.id)}" aria-label="Edit ${safe(club.name)}">Edit</button><button class="icon-btn" type="button" data-delete-club="${safe(club.id)}" aria-label="Delete ${safe(club.name)}">Delete</button></div>
          </div>
        </article>`).join('')}</div>` : `
        <div class="club-empty-state"><span class="club-empty-icon">＋</span><h3>No clubs here yet</h3><p>Add your first club to start keeping its details and notes together.</p><button class="btn-primary" id="addFirstClubBtn" type="button">Add your first club</button></div>`}`;
  }

     function renderClubWorkspace() {
    const club = (state().clubs || []).find(c => c.id === activeId);
    if (!club) { activeId = null; return render(); }

    // Preserve old notes and migrate them into the first page.
    if (!club.workspaceNotesMigrated) {
      const legacySections = [
        ['Responsibilities', club.responsibilities],
        ['Events & Activities', club.events],
        ['Upcoming Deadlines', club.deadlines],
        ['Participation Details', club.participation],
        ['Achievements & Certificates', club.achievements],
        ['Contributions & Skills', club.skills],
        ['Meeting Notes', club.meetingNotes],
        ['Important Links', club.links]
      ].filter(([, value]) => String(value || '').trim());

      if (!String(club.workspaceNotes || '').trim() && legacySections.length) {
        club.workspaceNotes = legacySections
          .map(([heading, value]) => `${heading}\n${value}`).join('\n\n');
      }

      club.workspaceNotesMigrated = true;
    }

    // Create independent note pages.
    if (!Array.isArray(club.workspacePages)) {
      club.workspacePages = [{
        id: 'note-' + Date.now(),
        title: 'My Notes',
        content: club.workspaceNotes || ''
      }];
    }

    if (club.workspacePages.length === 0) {
      club.workspacePages.push({
        id: 'note-' + Date.now(),
        title: 'My Notes',
        content: ''
      });
    }

    persist();

    root.innerHTML = `
      <div class="club-workspace-top">
        <button class="club-back-link" type="button" id="backToCategory">
          ← ${safe(activeCategory || club.category)}
        </button>
        <div class="club-workspace-actions">
          <button class="btn-secondary" id="editActiveClubBtn" type="button">
            Edit details
          </button>
        </div>
      </div>

      <section class="club-workspace-hero">
        <div>
          <span class="club-category-tag">${safe(club.category)}</span>
          <h2>${safe(club.name)}</h2>
          <p>${safe(club.designation || 'Member')}${club.joinDate ? ` · Joined ${safe(club.joinDate)}` : ''}</p>
        </div>
        <span class="club-hero-status">${safe(club.status || 'Active')}</span>
      </section>

      <div class="club-workspace-summary">
        <div><small>ROLE</small><strong>${safe(club.designation || 'Member')}</strong></div>
        <div><small>JOINED</small><strong>${safe(club.joinDate || 'Not added')}</strong></div>
        <div><small>STATUS</small><strong>${safe(club.status || 'Active')}</strong></div>
      </div>

      <section class="club-freewrite-card">
        <div class="club-freewrite-heading">
          <div>
            <p class="club-eyebrow">YOUR PERSONAL SPACE</p>
            <h3>My Club Workspace</h3>
            <p>Keep separate notes, plans, ideas and meeting records for this club.</p>
          </div>
          <span class="club-autosave-status">Saved automatically</span>
        </div>

        <div class="club-notes-list">
          ${club.workspacePages.map((note, index) => `
            <div class="club-note-page" data-note-id="${safe(note.id)}">

  <div class="club-note-page-heading">
    <h4>${safe(note.title || `Note ${index + 1}`)}</h4>

    ${
      note.isOpen === false
        ? `<button type="button" class="club-open-note" data-open-note="${safe(note.id)}">Open Note ↓</button>`
        : `<button type="button" class="club-close-note" data-close-note="${safe(note.id)}">Close Note ↑</button>`
    }

    <button type="button" class="club-delete-note"
      data-delete-note="${safe(note.id)}">
      Delete
    </button>
  </div>

  ${
    note.isOpen === false
      ? `
        <div class="club-note-collapsed-preview">
          <p>${safe((note.content || '').trim().slice(0, 120) || 'No content yet...')}</p>
          <small>Click Open Note to continue writing</small>
        </div>
      `
      : `
        <input
          class="form-input club-note-title"
          type="text"
          data-note-field="title"
          data-note-id="${safe(note.id)}"
          value="${safe(note.title || '')}"
          placeholder="Enter note title..."
        >

        <textarea
          class="club-freewrite-area club-note-content"
          data-note-field="content"
          data-note-id="${safe(note.id)}"
          placeholder="Start writing here..."
        >${safe(note.content || '')}</textarea>

        <span class="club-note-save-hint">Changes save automatically</span>
      `
  }

</div>
          `).join('')}
        </div>

        <button type="button" class="btn-primary club-add-note-btn" id="addClubNoteBtn">
          + Add New Note
        </button>
      </section>`;

    // Autosave each note independently.
    root.querySelectorAll('[data-note-field]').forEach(field => {
      field.addEventListener('input', () => {
        const note = club.workspacePages.find(
          item => item.id === field.dataset.noteId
        );
        if (!note) return;

        note[field.dataset.noteField] = field.value;
        note.updatedAt = Date.now();
        persist();
      });
    });
// Close a note manually.
root.querySelectorAll('[data-close-note]').forEach(button => {
  button.addEventListener('click', () => {
    const note = club.workspacePages.find(
      item => item.id === button.dataset.closeNote
    );

    if (!note) return;

    note.isOpen = false;
    persist();
    renderClubWorkspace();
  });
});

// Reopen a saved note.
root.querySelectorAll('[data-open-note]').forEach(button => {
  button.addEventListener('click', () => {
    const note = club.workspacePages.find(
      item => item.id === button.dataset.openNote
    );

    if (!note) return;

    note.isOpen = true;
    persist();
    renderClubWorkspace();
  });
});

    // Add a new blank note.
    root.querySelector('#addClubNoteBtn').addEventListener('click', () => {
      const newNote = {
        id: 'note-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        title: '',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      club.workspacePages.push(newNote);
      persist();
      renderClubWorkspace();

      const newTitle = root.querySelector(
        `[data-note-id="${newNote.id}"][data-note-field="title"]`
      );
      if (newTitle) newTitle.focus();
    });

    // Delete a note.
    root.querySelectorAll('[data-delete-note]').forEach(button => {
      button.addEventListener('click', () => {
        if (club.workspacePages.length === 1) {
          toast('Keep at least one note page.');
          return;
        }

        if (!confirm('Are you sure you want to delete this note?')) return;

        club.workspacePages = club.workspacePages.filter(
          note => note.id !== button.dataset.deleteNote
        );

        persist();
        renderClubWorkspace();
      });
    });
  
  }

  function openForm(club = null) {
    editingId = club?.id || null;
    document.getElementById('clubModalTitle').textContent = club ? 'Edit Club' : 'Add Club';
    const fields = {
      name:'clubName', category:'clubCategory', designation:'clubDesignation', joinDate:'clubJoinDate',
      status:'clubStatus'
    };
    syncCategoryOptions(club?.category || activeCategory || '');
    Object.entries(fields).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) el.value = club?.[key] || (key === 'status' ? 'Active' : key === 'category' ? (activeCategory || categories()[0]) : '');
    });
    modal.classList.add('open');
    document.getElementById('clubName').focus();
  }

  function closeForm() {
    modal.classList.remove('open');
    form.reset();
    editingId = null;
  }

  function openCategoryModal() {
    categoryModal.classList.add('open');
    document.getElementById('newClubCategoryName').value = '';
    document.getElementById('newClubCategoryName').focus();
  }
  function closeCategoryModal() { categoryModal.classList.remove('open'); }
  function addCategory(name) {
    const clean = String(name || '').trim().replace(/\\s+/g, ' ');
    if (!clean) return;
    if (categories().some(c => c.toLowerCase() === clean.toLowerCase())) {
      toast('This category already exists.');
      return;
    }
    if (!Array.isArray(state().clubCategories)) state().clubCategories = [];
    state().clubCategories.push(clean);
    persist();
    closeCategoryModal();
    render();
    toast('Category created.');
  }

 root.addEventListener('input', e => {
    const field = e.target.closest('[data-note-field]');
    if (!field) return;

    const club = (state().clubs || []).find(c => c.id === activeId);
    if (!club || !Array.isArray(club.workspacePages)) return;

    const note = club.workspacePages.find(
      item => item.id === field.dataset.noteId
    );

    if (!note) return;

    note[field.dataset.noteField] = field.value;
    note.updatedAt = Date.now();

    persist();

    const hint = field.closest('.club-note-page')
      ?.querySelector('.club-note-save-hint');

    if (hint) hint.textContent = 'All changes saved';
  });
  root.addEventListener('click', e => {
    const target = e.target.closest('button');
    if (!target) return;
    if (target.matches('#addCategoryBtn, #addCategoryTile')) return openCategoryModal();
    if (target.matches('[data-open-category]')) {
      activeCategory = target.dataset.openCategory;
      activeId = null;
      render();
      return;
    }
    if (target.matches('#backToCategories')) { activeCategory = null; activeId = null; render(); return; }
    if (target.matches('#addClubBtn, #addFirstClubBtn')) { openForm(); return; }
    if (target.matches('[data-open-club]')) { activeId = target.dataset.openClub; render(); return; }
    if (target.matches('[data-edit-club]')) {
      const club = (state().clubs || []).find(c => c.id === target.dataset.editClub);
      if (club) openForm(club);
      return;
    }
    if (target.matches('[data-delete-club]')) {
      const club = (state().clubs || []).find(c => c.id === target.dataset.deleteClub);
      if (club && window.confirm(`Delete "${club.name}"? This cannot be undone.`)) {
        state().clubs = (state().clubs || []).filter(c => c.id !== club.id);
        persist(); render(); toast('Club deleted.');
      }
      return;
    }
    if (target.matches('#backToCategory')) { activeId = null; render(); return; }
    if (target.matches('#editActiveClubBtn')) {
      const club = (state().clubs || []).find(c => c.id === activeId);
      if (club) openForm(club);
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const wasEditing = Boolean(editingId);
    const fields = {
      name:'clubName', category:'clubCategory', designation:'clubDesignation', joinDate:'clubJoinDate',
      status:'clubStatus'
    };
    const clubData = Object.fromEntries(Object.entries(fields).map(([key,id]) => [key, document.getElementById(id).value.trim()]));
    if (!clubData.name) return;
    if (!Array.isArray(state().clubs)) state().clubs = [];
    if (wasEditing) {
      const existing = state().clubs.find(c => c.id === editingId);
      if (existing) Object.assign(existing, clubData);
    } else {
      state().clubs.push({ id:`club-${Date.now()}`, createdAt:new Date().toISOString(), ...clubData });
    }
    activeCategory = clubData.category;
    persist();
    closeForm();
    render();
    toast(wasEditing ? 'Club updated.' : 'Club added.');
  });

  categoryForm.addEventListener('submit', e => { e.preventDefault(); addCategory(document.getElementById('newClubCategoryName').value); });
  document.getElementById('closeCategoryModal')?.addEventListener('click', closeCategoryModal);
  document.getElementById('cancelCategoryModal')?.addEventListener('click', closeCategoryModal);
  categoryModal.addEventListener('click', e => { if (e.target === categoryModal) closeCategoryModal(); });
  document.getElementById('closeClubModalBtn')?.addEventListener('click', closeForm);
  document.getElementById('cancelClubModalBtn')?.addEventListener('click', closeForm);
  modal.addEventListener('click', e => { if (e.target === modal) closeForm(); });

  render();
  return { render };
}
