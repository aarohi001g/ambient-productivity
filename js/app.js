// app.js - Core UI Controller and Application Lifecycle Engine

import {
  getSavedState,
  saveState,
  exportStateAsJSON,
  importStateFromJSON,
  resetToDemoData,
  clearAllUserData,
  calculateNearestDeadline,
  formatDeadlineRelative
} from './data.js';

import { audioEngine, ReminderManager, computeReminderTriggerTime } from './reminders.js';
import { initClubs } from './clubs.js';

// SVG Icons Registry for Crisp, Offline-First Rendering
const ICONS = {
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>`,
  briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  'graduation-cap': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path><path d="M22 10v6"></path><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"></rect><rect width="6" height="6" x="9" y="9" rx="1"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M2 9h2"></path><path d="M20 15h2"></path><path d="M20 9h2"></path><path d="M9 2v2"></path><path d="M9 20v2"></path></svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`
};

// Application State
let appState = getSavedState();
let currentFilter = 'all'; // 'all' | 'pending' | 'completed'
let currentSort = 'priority'; // 'priority' | 'time' | 'creation'
let workspaceSearchQuery = '';

// Dedicated Workspace View State (Change 1)
let currentDedicatedWorkspaceId = null;
let dedicatedWorkspaceSearchQuery = '';
let dedicatedWorkspaceStatusFilter = 'all';
let dedicatedWorkspaceSort = 'deadline';

// Future Notes State (Change 2)
let futureNotesSearchQuery = '';

// Active modal tracking
let activeEditingWorkspaceId = null;
let activeEditingEntryId = null;
let activePlanToMove = null;
let activeEditingPlanId = null;
let clubsController = null;

// Initialize Reminder Manager
const reminderManager = new ReminderManager(
  () => appState,
  (reminderItem) => triggerNotificationUI(reminderItem)
);

// ==========================================================================
// 1. SLIDE NAVIGATION & AMBIENT TRANSITION ENGINE
// ==========================================================================

function switchSlide(slideNumber) {
  slideNumber = parseInt(slideNumber, 10);
  if (slideNumber < 1 || slideNumber > 4) return;

  appState.activeSlide = slideNumber;
  saveState(appState);

  // Update theme attribute on root element for smooth ambient glow morphing
  const htmlEl = document.documentElement;
  htmlEl.setAttribute('data-theme', `slide-${slideNumber}`);

  // Update Navigation Tab Active States
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-slide'), 10);
    btn.classList.toggle('active', s === slideNumber);
  });

  // Update Top Badge
  const badgeEl = document.getElementById('slideIndicatorBadge');
  if (badgeEl) {
    if (slideNumber === 1) badgeEl.textContent = 'Daily';
    else if (slideNumber === 2) badgeEl.textContent = 'Workspaces';
    else if (slideNumber === 3) badgeEl.textContent = 'Planning';
    else if (slideNumber === 4) badgeEl.textContent = 'Clubs';
  }

  // Update Slide Visibility
  document.querySelectorAll('.slide-section').forEach(sec => {
    const s = parseInt(sec.getAttribute('data-slide-index'), 10);
    sec.classList.toggle('active', s === slideNumber);
  });

  // Re-render relevant view if needed
  if (slideNumber === 1) {
    renderSlide1();
  } else if (slideNumber === 2) {
    if (currentDedicatedWorkspaceId) {
      renderDedicatedWorkspacePage(currentDedicatedWorkspaceId);
    } else {
      renderSlide2();
    }
  } else if (slideNumber === 3) {
    renderSlide3();
  } else if (slideNumber === 4) {
    if (clubsController) clubsController.render();
  }
}

// ==========================================================================
// 2. SLIDE 1: DAILY TO-DO LIST & TIMELINE SCHEDULE
// ==========================================================================

function renderSlide1() {
  renderDateDisplay();
  renderDailyStats();
  renderTasksList();
  renderTimeSchedule();
}

function renderDateDisplay() {
  const el = document.getElementById('currentDateDisplay');
  if (!el) return;
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = new Date().toLocaleDateString(undefined, options);
}

function renderDailyStats() {
  const tasks = appState.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('totalTasksCount').textContent = total;
  document.getElementById('completedTasksCount').textContent = completed;
  document.getElementById('pendingTasksCount').textContent = pending;
  document.getElementById('progressPercentDisplay').textContent = `${percent}%`;
  document.getElementById('dailyProgressBar').style.width = `${percent}%`;
}

function getSortedAndFilteredTasks() {
  let list = [...(appState.tasks || [])];

  // Filter
  if (currentFilter === 'pending') {
    list = list.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    list = list.filter(t => t.completed);
  }

  // Sort
  if (currentSort === 'priority') {
    const pWeight = { High: 3, Medium: 2, Low: 1 };
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
    });
  } else if (currentSort === 'time') {
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  } else if (currentSort === 'creation') {
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  return list;
}

function renderTasksList() {
  const container = document.getElementById('dailyTasksContainer');
  if (!container) return;

  const tasks = getSortedAndFilteredTasks();

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${ICONS.check}
        <p>No tasks found in this view. Enjoy your focus time or add a new focus item above!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tasks.map(task => {
    const isChecked = task.completed ? 'checked' : '';
    const completedClass = task.completed ? 'completed' : '';
    const priorityClass = `priority-${task.priority.toLowerCase()}`;

    const timeBadge = task.time ? `
      <span class="badge-tag time-tag" title="Scheduled time">
        ${ICONS.clock} ${task.time}
      </span>
    ` : '';

    const reminderBadge = (task.reminder && task.reminder.enabled) ? `
      <span class="badge-tag reminder-tag" title="Reminder: ${task.reminder.timing || 'set'}">
        ${ICONS.bell} ${task.reminder.timing || 'Reminder'}
      </span>
    ` : '';

    const carriedBadge = task.carriedForward ? `
      <span class="badge-tag" style="background: rgba(105, 191, 255, 0.12); color: #69BFFF;">
        Carried Forward
      </span>
    ` : '';

    return `
      <div class="task-item ${completedClass}" data-task-id="${task.id}">
        <div class="task-checkbox-wrap">
          <input 
            type="checkbox" 
            class="custom-checkbox task-check-btn" 
            data-id="${task.id}" 
            ${isChecked}
            aria-label="Toggle complete"
          />
        </div>
        <div class="task-content">
          <div class="task-title">${escapeHTML(task.title)}</div>
          ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
          <div class="task-meta-row">
            <span class="badge-tag ${priorityClass}">${task.priority}</span>
            ${timeBadge}
            ${reminderBadge}
            ${carriedBadge}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-ghost edit-task-btn" data-id="${task.id}" title="Edit Task">
            ${ICONS.edit}
          </button>
          <button class="btn-ghost btn-danger delete-task-btn" data-id="${task.id}" title="Delete Task">
            ${ICONS.trash}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderTimeSchedule() {
  const container = document.getElementById('scheduleTimelineContainer');
  const countEl = document.getElementById('scheduledTasksCount');
  if (!container) return;

  const timedTasks = (appState.tasks || [])
    .filter(t => Boolean(t.time))
    .sort((a, b) => a.time.localeCompare(b.time));

  if (countEl) countEl.textContent = `${timedTasks.length} scheduled`;

  if (timedTasks.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.88rem; color: var(--text-dim); padding: 1rem 0;">
        No tasks with specified times for today. Add a time to any task to plan your day.
      </div>
    `;
    return;
  }

  container.innerHTML = timedTasks.map(task => {
    const isCompleted = task.completed ? 'completed' : '';
    return `
      <div class="timeline-slot ${isCompleted}">
        <div class="timeline-dot"></div>
        <div class="timeline-time-col">${task.time}</div>
        <div class="timeline-task-card">
          <div>
            <div style="font-weight: 600; font-size: 0.92rem; ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
              ${escapeHTML(task.title)}
            </div>
            ${task.description ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${escapeHTML(task.description)}</div>` : ''}
          </div>
          <span class="badge-tag priority-${task.priority.toLowerCase()}">${task.priority}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// 3. SLIDE 2: WORKSPACE OVERVIEW & DEDICATED FULL-SCREEN WORKSPACE (CHANGE 1)
// ==========================================================================

function renderSlide2() {
  currentDedicatedWorkspaceId = null;
  const overviewView = document.getElementById('workspaceOverviewView');
  const dedicatedView = document.getElementById('workspaceDedicatedView');
  if (overviewView) overviewView.style.display = 'block';
  if (dedicatedView) dedicatedView.style.display = 'none';

  const container = document.getElementById('workspaceCardsContainer');
  if (!container) return;

  const workspaces = appState.workspaces || [];

  const cardsHTML = workspaces.map(ws => {
    const entries = ws.entries || [];
    const iconSvg = ICONS[ws.icon] || ICONS.folder;

    // Filter entries if search query exists
    let filteredEntries = [...entries];
    if (workspaceSearchQuery.trim()) {
      const q = workspaceSearchQuery.toLowerCase();
      filteredEntries = filteredEntries.filter(e => {
        const titleMatch = (e.name || e.title || '').toLowerCase().includes(q);
        const notesMatch = (e.notes || '').toLowerCase().includes(q);
        const orgMatch = (e.organizer || e.company || e.goal || '').toLowerCase().includes(q);
        return titleMatch || notesMatch || orgMatch;
      });
    }

    // Default sort entries by nearest deadline
    filteredEntries.sort((a, b) => {
      const dateA = a.deadline || a.regDeadline || a.targetDate || '9999';
      const dateB = b.deadline || b.regDeadline || b.targetDate || '9999';
      return dateA.localeCompare(dateB);
    });

    // Compute summary metrics
    const nearest = calculateNearestDeadline(entries);
    let deadlineChip = `<span class="chip-deadline">No deadlines</span>`;
    if (nearest) {
      const relStr = formatDeadlineRelative(nearest.date);
      const isUrgent = relStr.includes('Today') || relStr.includes('Tomorrow') || relStr.includes('overdue');
      deadlineChip = `
        <span class="chip-deadline ${isUrgent ? 'urgent' : ''}" title="${nearest.date}">
          ${ICONS.clock} ${relStr}
        </span>
      `;
    }

    return `
      <div class="workspace-card" data-ws-id="${ws.id}" title="Click to open dedicated ${escapeHTML(ws.name)} workspace">
        <div class="workspace-card-header">
          <div class="workspace-title-row">
            <div class="workspace-badge-group">
              <div class="workspace-icon-wrap">${iconSvg}</div>
              <div class="workspace-name">${escapeHTML(ws.name)}</div>
            </div>
            ${ws.isCustom ? `
              <button class="btn-ghost btn-danger delete-ws-btn" data-ws-id="${ws.id}" title="Delete Custom Workspace">
                ${ICONS.trash}
              </button>
            ` : ''}
          </div>
          <div class="workspace-summary-chips">
            <span class="chip-deadline">${entries.length} items</span>
            ${deadlineChip}
          </div>
        </div>

        <div class="workspace-card-actions">
          <span style="font-size: 0.8rem; color: var(--text-dim);">Sorted by nearest deadline</span>
          <button class="btn-secondary add-ws-entry-btn" data-ws-id="${ws.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
            + Add Entry
          </button>
        </div>

        <div class="workspace-entries-list">
          ${filteredEntries.length === 0 ? `
            <div style="text-align: center; color: var(--text-dim); padding: 2.5rem 1rem; font-size: 0.85rem;">
              No entries found. Click to open and add your first entry.
            </div>
          ` : filteredEntries.slice(0, 4).map(entry => renderEntryOverviewCard(ws, entry)).join('')}
          ${filteredEntries.length > 4 ? `
            <div style="text-align: center; font-size: 0.78rem; color: var(--accent); padding: 0.4rem 0;">
              + ${filteredEntries.length - 4} more entries. Click card to open full workspace.
            </div>
          ` : ''}
        </div>

        <!-- Open Workspace Prompt Banner -->
        <div class="open-workspace-banner">
          <span>Open Full Workspace</span>
          ${ICONS.arrowRight}
        </div>
      </div>
    `;
  }).join('');

  // Add the "+ Add New Card" placeholder card at the end of the horizontal row
  const addSlotHTML = `
    <div class="add-workspace-slot" id="addWorkspaceSlotCard" title="Create a new custom category">
      <div class="add-slot-circle">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <span style="font-weight: 600; font-size: 0.95rem;">Add New Card</span>
      <span style="font-size: 0.8rem; color: var(--text-dim); text-align: center; padding: 0 1rem;">
        Create unlimited custom workspace categories with tailored fields.
      </span>
    </div>
  `;

  container.innerHTML = cardsHTML + addSlotHTML;
}

// Mini preview on overview card
function renderEntryOverviewCard(ws, entry) {
  const title = entry.name || entry.company || entry.title || 'Untitled Entry';
  const subtitle = entry.role || entry.organizer || entry.goal || '';
  const status = entry.status || (entry.progress !== undefined ? `${entry.progress}%` : '');
  const deadline = entry.deadline || entry.regDeadline || entry.targetDate || '';
  const deadlineStr = deadline ? formatDeadlineRelative(deadline) : '';

  return `
    <div class="entry-card" data-entry-id="${entry.id}">
      <div class="entry-top-row">
        <div class="entry-name" style="font-size: 0.9rem;">${escapeHTML(title)}</div>
        ${status ? `<span class="entry-status-badge">${escapeHTML(status)}</span>` : ''}
      </div>
      ${subtitle ? `<div class="entry-meta-line" style="font-size: 0.78rem; color: var(--text-dim);">${escapeHTML(subtitle)}</div>` : ''}
      <div class="entry-footer-row">
        <span style="font-size: 0.72rem; color: var(--text-muted);">
          ${deadlineStr ? `${ICONS.clock} ${deadlineStr}` : ''}
        </span>
        <div class="entry-actions">
          <button class="btn-ghost edit-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}" title="Edit">${ICONS.edit}</button>
          <button class="btn-ghost btn-danger delete-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}" title="Delete">${ICONS.trash}</button>
        </div>
      </div>
    </div>
  `;
}

// Open Dedicated Full-Screen Page for a Workspace (Change 1)
function openDedicatedWorkspacePage(wsId) {
  currentDedicatedWorkspaceId = wsId;
  dedicatedWorkspaceSearchQuery = '';
  dedicatedWorkspaceStatusFilter = 'all';
  dedicatedWorkspaceSort = 'deadline';

  const overviewView = document.getElementById('workspaceOverviewView');
  const dedicatedView = document.getElementById('workspaceDedicatedView');
  if (overviewView) overviewView.style.display = 'none';
  if (dedicatedView) dedicatedView.style.display = 'block';

  renderDedicatedWorkspacePage(wsId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeDedicatedWorkspacePage() {
  currentDedicatedWorkspaceId = null;
  const overviewView = document.getElementById('workspaceOverviewView');
  const dedicatedView = document.getElementById('workspaceDedicatedView');
  if (overviewView) overviewView.style.display = 'block';
  if (dedicatedView) dedicatedView.style.display = 'none';

  renderSlide2();
}

function renderDedicatedWorkspacePage(wsId) {
  const container = document.getElementById('workspaceDedicatedView');
  if (!container) return;

  const ws = (appState.workspaces || []).find(w => w.id === wsId);
  if (!ws) {
    closeDedicatedWorkspacePage();
    return;
  }

  const entries = ws.entries || [];
  const iconSvg = ICONS[ws.icon] || ICONS.folder;

  // Compute stats
  const totalCount = entries.length;
  let activeCount = 0;
  if (ws.id === 'hackathons') {
    activeCount = entries.filter(e => e.status !== 'Completed').length;
  } else if (ws.id === 'internships') {
    activeCount = entries.filter(e => e.status !== 'Rejected' && e.status !== 'Selected').length;
  } else if (ws.id === 'projects') {
    activeCount = entries.filter(e => e.status !== 'Completed').length;
  } else if (ws.id === 'learning') {
    activeCount = entries.filter(e => (e.progress || 0) < 100).length;
  } else {
    activeCount = entries.length;
  }

  const nearest = calculateNearestDeadline(entries);
  const nearestStr = nearest ? formatDeadlineRelative(nearest.date) : 'No upcoming deadlines';

  // Filter entries
  let filtered = [...entries];
  if (dedicatedWorkspaceSearchQuery.trim()) {
    const q = dedicatedWorkspaceSearchQuery.toLowerCase();
    filtered = filtered.filter(e => {
      const matchName = (e.name || e.company || e.title || '').toLowerCase().includes(q);
      const matchNotes = (e.notes || '').toLowerCase().includes(q);
      const matchRole = (e.role || e.organizer || e.goal || e.description || '').toLowerCase().includes(q);
      return matchName || matchNotes || matchRole;
    });
  }

  if (dedicatedWorkspaceStatusFilter !== 'all') {
    filtered = filtered.filter(e => e.status === dedicatedWorkspaceStatusFilter);
  }

  // Sort entries
  if (dedicatedWorkspaceSort === 'deadline') {
    filtered.sort((a, b) => {
      const dateA = a.deadline || a.regDeadline || a.targetDate || '9999';
      const dateB = b.deadline || b.regDeadline || b.targetDate || '9999';
      return dateA.localeCompare(dateB);
    });
  } else if (dedicatedWorkspaceSort === 'name') {
    filtered.sort((a, b) => {
      const nameA = (a.name || a.company || a.title || '').toLowerCase();
      const nameB = (b.name || b.company || b.title || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } else if (dedicatedWorkspaceSort === 'status') {
    filtered.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
  }

  // Status Filter options depending on category
  let statusOptions = ['all'];
  if (ws.id === 'hackathons') {
    statusOptions = ['all', 'Interested', 'Registered', 'Participating', 'Completed'];
  } else if (ws.id === 'internships') {
    statusOptions = ['all', 'Not Applied', 'Applied', 'Assessment Pending', 'Interview Scheduled', 'Selected', 'Rejected'];
  } else if (ws.id === 'projects') {
    statusOptions = ['all', 'Planning', 'In Progress', 'Review', 'Completed'];
  } else if (ws.id === 'learning') {
    statusOptions = ['all', 'In Progress', 'Completed'];
  }

  const addBtnLabel = ws.id === 'hackathons' ? 'Add Hackathon' 
                    : ws.id === 'internships' ? 'Add Internship' 
                    : ws.id === 'projects' ? 'Add Project' 
                    : ws.id === 'learning' ? 'Add Course / Skill' 
                    : 'Add Entry';

  container.innerHTML = `
    <!-- Top Navigation Bar -->
    <div class="dedicated-nav-bar">
      <button class="btn-back-workspaces" id="backToWorkspacesBtn">
        ${ICONS.arrowLeft} Back to Workspaces
      </button>
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <button class="btn-primary add-dedicated-entry-btn" data-ws-id="${ws.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          + ${addBtnLabel}
        </button>
      </div>
    </div>

    <!-- Hero Card with Metrics -->
    <div class="dedicated-hero-card">
      <div class="dedicated-hero-top">
        <div class="dedicated-hero-identity">
          <div class="dedicated-hero-icon">${iconSvg}</div>
          <div>
            <h1 class="dedicated-hero-title">${escapeHTML(ws.name)}</h1>
            <p class="dedicated-hero-desc">${escapeHTML(ws.description || `Manage and track all ${ws.name.toLowerCase()} in one place.`)}</p>
          </div>
        </div>
      </div>

      <div class="dedicated-stats-row">
        <div class="dedicated-stat-pill">
          <span class="dedicated-stat-label">Total Entries</span>
          <span class="dedicated-stat-val">${totalCount}</span>
        </div>
        <div class="dedicated-stat-pill">
          <span class="dedicated-stat-label">Active / Pending</span>
          <span class="dedicated-stat-val accent">${activeCount}</span>
        </div>
        <div class="dedicated-stat-pill">
          <span class="dedicated-stat-label">Nearest Deadline</span>
          <span class="dedicated-stat-val" style="font-size: 1.1rem; color: #69BFFF;">${nearestStr}</span>
        </div>
      </div>
    </div>

    <!-- Filter & Sort Toolbar -->
    <div class="dedicated-toolbar">
      <div class="dedicated-toolbar-left">
        <div class="search-input-wrap" style="max-width: 320px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            id="dedicatedSearchInput" 
            value="${escapeHTML(dedicatedWorkspaceSearchQuery)}" 
            placeholder="Search in ${escapeHTML(ws.name)}..."
          />
        </div>

        ${statusOptions.length > 1 ? `
          <div class="status-pills-filter" id="dedicatedStatusFilterBar">
            ${statusOptions.map(opt => `
              <button class="status-pill-btn ${dedicatedWorkspaceStatusFilter === opt ? 'active' : ''}" data-status="${opt}">
                ${opt === 'all' ? 'All' : opt}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="field-group">
        <span style="font-size: 0.78rem; color: var(--text-dim);">Sort:</span>
        <select id="dedicatedSortSelect">
          <option value="deadline" ${dedicatedWorkspaceSort === 'deadline' ? 'selected' : ''}>Nearest Deadline</option>
          <option value="name" ${dedicatedWorkspaceSort === 'name' ? 'selected' : ''}>Name (A to Z)</option>
          <option value="status" ${dedicatedWorkspaceSort === 'status' ? 'selected' : ''}>Status</option>
        </select>
      </div>
    </div>

    <!-- Expansive Entries Grid -->
    <div class="dedicated-entries-grid" id="dedicatedEntriesContainer">
      ${filtered.length === 0 ? `
        <div class="empty-state" style="grid-column: 1 / -1;">
          ${iconSvg}
          <h3 style="color: var(--text-main); margin-bottom: 0.4rem; font-size: 1.15rem;">No entries found</h3>
          <p>No ${escapeHTML(ws.name.toLowerCase())} match your current filter. Click below to add one.</p>
          <button class="btn-primary add-dedicated-entry-btn" data-ws-id="${ws.id}">
            + ${addBtnLabel}
          </button>
        </div>
      ` : filtered.map(entry => renderDedicatedEntryCard(ws, entry)).join('')}
    </div>
  `;

  // Attach search listener
  const searchInput = document.getElementById('dedicatedSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      dedicatedWorkspaceSearchQuery = e.target.value;
      renderDedicatedWorkspacePage(wsId);
    });
  }

  // Attach sort listener
  const sortSelect = document.getElementById('dedicatedSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      dedicatedWorkspaceSort = e.target.value;
      renderDedicatedWorkspacePage(wsId);
    });
  }

  // Attach status filter buttons
  const statusFilterBar = document.getElementById('dedicatedStatusFilterBar');
  if (statusFilterBar) {
    statusFilterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.status-pill-btn');
      if (!btn) return;
      dedicatedWorkspaceStatusFilter = btn.getAttribute('data-status');
      renderDedicatedWorkspacePage(wsId);
    });
  }

  // Attach Back button
  const backBtn = document.getElementById('backToWorkspacesBtn');
  if (backBtn) {
    backBtn.addEventListener('click', closeDedicatedWorkspacePage);
  }
}

// Expansive full-detail card inside dedicated view
function renderDedicatedEntryCard(ws, entry) {
  const reminderBadge = (entry.reminder && entry.reminder.enabled) ? `
    <span class="badge-tag reminder-tag" title="Reminder: ${entry.reminder.timing || 'set'}">
      ${ICONS.bell} ${entry.reminder.timing || 'Reminder'}
    </span>
  ` : '';

  // 1. Hackathons Full Card
  if (ws.id === 'hackathons') {
    const deadlineStr = entry.regDeadline ? formatDeadlineRelative(entry.regDeadline) : 'TBD';
    return `
      <div class="dedicated-entry-card" data-entry-id="${entry.id}">
        <div class="dedicated-entry-header">
          <div>
            <div class="dedicated-entry-name">${escapeHTML(entry.name)}</div>
            ${entry.organizer ? `<div class="dedicated-entry-sub">Organized by: <strong style="color: var(--text-soft);">${escapeHTML(entry.organizer)}</strong></div>` : ''}
          </div>
          <span class="entry-status-badge" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">${escapeHTML(entry.status || 'Interested')}</span>
        </div>

        <div class="dedicated-entry-body">
          <div class="dedicated-detail-row">
            <span class="dedicated-detail-label">Reg. Deadline:</span>
            <span style="font-weight: 600; color: #69BFFF;">${entry.regDeadline || 'TBD'} (${deadlineStr})</span>
          </div>
          ${entry.eventDate ? `
            <div class="dedicated-detail-row">
              <span class="dedicated-detail-label">Event Date:</span>
              <span>${entry.eventDate}</span>
            </div>
          ` : ''}
          ${entry.teamDetails ? `
            <div class="dedicated-detail-row">
              <span class="dedicated-detail-label">Team:</span>
              <span>${escapeHTML(entry.teamDetails)}</span>
            </div>
          ` : ''}
          ${entry.regLink ? `
            <div class="dedicated-detail-row">
              <span class="dedicated-detail-label">Link:</span>
              <a href="${escapeHTML(entry.regLink)}" target="_blank" rel="noopener" style="color: var(--accent); display: inline-flex; align-items: center; gap: 0.3rem;">
                Registration / DevPost Page ${ICONS.externalLink}
              </a>
            </div>
          ` : ''}
          ${entry.notes ? `
            <div class="dedicated-notes-box">
              <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--accent);">Project Idea & Notes:</div>
              ${escapeHTML(entry.notes)}
            </div>
          ` : ''}
        </div>

        <div class="dedicated-entry-footer">
          <div>${reminderBadge}</div>
          <div class="entry-actions">
            <button class="btn-secondary edit-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
              ${ICONS.edit} Edit
            </button>
            <button class="btn-ghost btn-danger delete-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
              ${ICONS.trash} Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Internships Full Card
  if (ws.id === 'internships') {
    const deadlineStr = entry.deadline ? formatDeadlineRelative(entry.deadline) : 'TBD';
    return `
      <div class="dedicated-entry-card" data-entry-id="${entry.id}">
        <div class="dedicated-entry-header">
          <div>
            <div class="dedicated-entry-name">${escapeHTML(entry.company || entry.name)}</div>
            <div class="dedicated-entry-sub">${escapeHTML(entry.role || 'Software Engineering')}</div>
          </div>
          <span class="entry-status-badge" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">${escapeHTML(entry.status || 'Applied')}</span>
        </div>

        <div class="dedicated-entry-body">
          <div class="dedicated-detail-row">
            <span class="dedicated-detail-label">Deadline:</span>
            <span style="font-weight: 600; color: #69BFFF;">${entry.deadline || 'TBD'} (${deadlineStr})</span>
          </div>
          ${entry.startDate || entry.endDate ? `
            <div class="dedicated-detail-row">
              <span class="dedicated-detail-label">Duration:</span>
              <span>${entry.startDate || 'TBD'} &rarr; ${entry.endDate || 'TBD'}</span>
            </div>
          ` : ''}
          ${entry.link ? `
            <div class="dedicated-detail-row">
              <span class="dedicated-detail-label">Job Portal:</span>
              <a href="${escapeHTML(entry.link)}" target="_blank" rel="noopener" style="color: var(--accent); display: inline-flex; align-items: center; gap: 0.3rem;">
                Application Portal ${ICONS.externalLink}
              </a>
            </div>
          ` : ''}
          ${entry.notes ? `
            <div class="dedicated-notes-box">
              <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--accent);">Preparation & Strategy:</div>
              ${escapeHTML(entry.notes)}
            </div>
          ` : ''}
        </div>

        <div class="dedicated-entry-footer">
          <div>${reminderBadge}</div>
          <div class="entry-actions">
            <button class="btn-secondary edit-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
              ${ICONS.edit} Edit
            </button>
            <button class="btn-ghost btn-danger delete-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
              ${ICONS.trash} Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 3. Projects Full Card
  if (ws.id === 'projects') {
    const subtasks = entry.subtasks || [];
    const doneSubtasks = subtasks.filter(st => st.completed).length;
    const autoProgress = subtasks.length > 0 ? Math.round((doneSubtasks / subtasks.length) * 100) : (entry.progress || 0);

    const subtasksListHTML = subtasks.length > 0 ? `
      <div style="margin: 0.5rem 0;">
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase;">Tasks & Milestones (${doneSubtasks}/${subtasks.length}):</span>
        <div class="subtasks-checklist" style="margin-top: 0.4rem;">
          ${subtasks.map(st => `
            <div class="subtask-row ${st.completed ? 'done' : ''}">
              <input 
                type="checkbox" 
                class="dedicated-subtask-toggle" 
                data-proj-id="${entry.id}" 
                data-subtask-id="${st.id}" 
                ${st.completed ? 'checked' : ''} 
              />
              <span>${escapeHTML(st.title)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div class="dedicated-entry-card" data-entry-id="${entry.id}">
        <div class="dedicated-entry-header">
          <div>
            <div class="dedicated-entry-name">${escapeHTML(entry.name)}</div>
          </div>
          <span class="entry-status-badge" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">${escapeHTML(entry.status || 'In Progress')}</span>
        </div>

        <div class="dedicated-entry-body">
          ${entry.description ? `<p style="font-size: 0.88rem; color: var(--text-soft); line-height: 1.45;">${escapeHTML(entry.description)}</p>` : ''}
          
          <div style="margin: 0.5rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
              <span style="color: var(--text-dim);">Completion Progress:</span>
              <strong style="color: var(--accent);">${autoProgress}%</strong>
            </div>
            <div class="progress-track" style="height: 7px;">
              <div class="progress-fill" style="width: ${autoProgress}%;"></div>
            </div>
          </div>

          ${subtasksListHTML}

          <div class="dedicated-detail-row" style="margin-top: 0.4rem;">
            <span class="dedicated-detail-label">Deadline:</span>
            <span>${entry.deadline ? `${entry.deadline} (${formatDeadlineRelative(entry.deadline)})` : 'No deadline'}</span>
          </div>

          ${entry.notes ? `
            <div class="dedicated-notes-box">
              <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--accent);">Architecture & Implementation Notes:</div>
              ${escapeHTML(entry.notes)}
            </div>
          ` : ''}
        </div>

        <div class="dedicated-entry-footer">
          <div>${reminderBadge}</div>
          <div class="entry-actions">
            <button class="btn-secondary edit-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
              ${ICONS.edit} Edit
            </button>
            <button class="btn-ghost btn-danger delete-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
              ${ICONS.trash} Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Learning Full Card
  if (ws.id === 'learning') {
    const progress = entry.progress || 0;
    return `
      <div class="dedicated-entry-card" data-entry-id="${entry.id}">
        <div class="dedicated-entry-header">
          <div>
            <div class="dedicated-entry-name">${escapeHTML(entry.name)}</div>
          </div>
          <span class="entry-status-badge" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">${progress}%</span>
        </div>

        <div class="dedicated-entry-body">
          ${entry.goal ? `
            <div class="dedicated-detail-row">
              <span class="dedicated-detail-label">Goal:</span>
              <span style="color: var(--text-main);">${escapeHTML(entry.goal)}</span>
            </div>
          ` : ''}

          <div style="margin: 0.5rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
              <span style="color: var(--text-dim);">Mastery Progress:</span>
              <strong style="color: var(--accent);">${progress}%</strong>
            </div>
            <div class="progress-track" style="height: 7px;">
              <div class="progress-fill" style="width: ${progress}%;"></div>
            </div>
          </div>

          <div class="dedicated-detail-row">
            <span class="dedicated-detail-label">Target Date:</span>
            <span>${entry.targetDate ? `${entry.targetDate} (${formatDeadlineRelative(entry.targetDate)})` : 'Self-paced'}</span>
          </div>

          ${entry.link ? `
            <div class="dedicated-detail-row">
              <span class="dedicated-detail-label">Course Link:</span>
              <a href="${escapeHTML(entry.link)}" target="_blank" rel="noopener" style="color: var(--accent); display: inline-flex; align-items: center; gap: 0.3rem;">
                Learning Resource ${ICONS.externalLink}
              </a>
            </div>
          ` : ''}

          ${entry.notes ? `
            <div class="dedicated-notes-box">
              <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--accent);">Key Takeaways:</div>
              ${escapeHTML(entry.notes)}
            </div>
          ` : ''}
        </div>

        <div class="dedicated-entry-footer">
          <div>${reminderBadge}</div>
          <div class="entry-actions">
            <button class="btn-secondary edit-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
              ${ICONS.edit} Edit
            </button>
            <button class="btn-ghost btn-danger delete-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
              ${ICONS.trash} Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 5. Custom Workspace Full Card
  const customFields = ws.customFields || [];
  return `
    <div class="dedicated-entry-card" data-entry-id="${entry.id}">
      <div class="dedicated-entry-header">
        <div class="dedicated-entry-name">${escapeHTML(entry.name || entry.title || 'Untitled Entry')}</div>
      </div>

      <div class="dedicated-entry-body">
        ${customFields.map(f => {
          const val = entry[f.id];
          if (val === undefined || val === '') return '';
          return `
            <div class="dedicated-detail-row">
              <span class="dedicated-detail-label">${escapeHTML(f.label)}:</span>
              <span>
                ${f.type === 'url' ? `<a href="${escapeHTML(val)}" target="_blank" rel="noopener" style="color: var(--accent);">${escapeHTML(val)} ${ICONS.externalLink}</a>`
                  : f.type === 'checkbox' ? (val ? '<strong style="color: var(--accent);">✓ Yes</strong>' : 'No')
                  : escapeHTML(String(val))}
              </span>
            </div>
          `;
        }).join('')}

        ${entry.notes ? `
          <div class="dedicated-notes-box">
            <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--accent);">Notes:</div>
            ${escapeHTML(entry.notes)}
          </div>
        ` : ''}
      </div>

      <div class="dedicated-entry-footer">
        <div>${reminderBadge}</div>
        <div class="entry-actions">
          <button class="btn-secondary edit-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
            ${ICONS.edit} Edit
          </button>
          <button class="btn-ghost btn-danger delete-dedicated-entry-btn" data-ws-id="${ws.id}" data-id="${entry.id}">
            ${ICONS.trash} Delete
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 4. SLIDE 3: FUTURE PLANNING (DIGITAL STICKY CHEAT-SHEET NOTES - CHANGE 2)
// ==========================================================================

function renderSlide3() {
  const container = document.getElementById('futureNotesContainer');
  const countBadge = document.getElementById('futureNotesCountBadge');
  if (!container) return;

  const notes = appState.futurePlans || [];

  // Filter if search input has query
  let filtered = [...notes];
  if (futureNotesSearchQuery.trim()) {
    const q = futureNotesSearchQuery.toLowerCase();
    filtered = filtered.filter(n => {
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchDesc = (n.description || n.notes || '').toLowerCase().includes(q);
      return matchTitle || matchDesc;
    });
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'note' : 'notes'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 4rem 1.5rem;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 44px; height: 44px; margin-bottom: 1rem; color: #75E5B0;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <h3 style="color: var(--text-main); font-size: 1.15rem; margin-bottom: 0.4rem;">No sticky notes yet</h3>
        <p style="color: var(--text-muted); max-width: 380px; margin: 0 auto 1.25rem auto;">
          Capture your thoughts, formulas, cheat-sheet reminders, and future ideas freely.
        </p>
        <button class="btn-primary" id="emptyAddNoteBtn">
          + Add Your First Note
        </button>
      </div>
    `;

    const emptyBtn = document.getElementById('emptyAddNoteBtn');
    if (emptyBtn) emptyBtn.addEventListener('click', () => openFutureNoteModal(null));
    return;
  }

  container.innerHTML = filtered.map((note, idx) => {
    const colorKey = note.color || ['orange', 'blue', 'lavender', 'mint', 'pink', 'yellow'][idx % 6];
    const textContent = note.description || note.notes || '';
    const dateFormatted = note.targetDate ? formatDeadlineRelative(note.targetDate) : '';

    return `
      <div class="future-note-card color-${colorKey}" data-note-id="${note.id}">
        <div>
          <div class="future-note-title">${escapeHTML(note.title)}</div>
          ${textContent ? `<div class="future-note-content">${escapeHTML(textContent)}</div>` : ''}
        </div>

        <div class="future-note-footer">
          <div>
            ${dateFormatted ? `
              <span class="future-note-date" title="${note.targetDate}">
                ${ICONS.clock} ${dateFormatted}
              </span>
            ` : '<span></span>'}
          </div>

          <div class="future-note-actions">
            <button class="note-btn-move" data-note-id="${note.id}" title="Move to Workspace">
              ${ICONS.arrowRight} Move
            </button>
            <button class="note-icon-btn edit-note-btn" data-note-id="${note.id}" title="Edit Note">
              ${ICONS.edit}
            </button>
            <button class="note-icon-btn delete-note-btn" data-note-id="${note.id}" title="Delete Note">
              ${ICONS.trash}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Open Future Note Add/Edit Modal
function openFutureNoteModal(noteId = null) {
  activeEditingPlanId = noteId || null;
  const modal = document.getElementById('futurePlanModal');
  const titleEl = document.getElementById('futurePlanModalTitle');
  const saveBtn = document.getElementById('saveFuturePlanBtn');
  if (!modal) return;

  const note = noteId ? (appState.futurePlans || []).find(p => p.id === noteId) : null;

  if (titleEl) {
    titleEl.textContent = note ? 'Edit Future Note' : 'Add Future Note';
  }
  if (saveBtn) {
    saveBtn.textContent = note ? 'Update Note' : 'Save Note';
  }

  const nameInput = document.getElementById('fpName');
  const descInput = document.getElementById('fpDesc');
  const targetDateInput = document.getElementById('fpTargetDate');
  const reminderTimingInput = document.getElementById('fpReminderTiming');
  const colorInput = document.getElementById('fpColor');

  if (nameInput) nameInput.value = note?.title || '';
  if (descInput) descInput.value = note?.description || note?.notes || '';
  if (targetDateInput) targetDateInput.value = note?.targetDate || '';
  if (reminderTimingInput) reminderTimingInput.value = note?.reminder?.timing || 'none';

  // Selected Color
  const palette = ['orange', 'blue', 'lavender', 'mint', 'pink', 'yellow'];
  const defaultColor = palette[(appState.futurePlans || []).length % palette.length];
  const chosenColor = note?.color || defaultColor;
  if (colorInput) colorInput.value = chosenColor;

  document.querySelectorAll('#noteColorPicker .color-swatch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-color') === chosenColor);
  });

  modal.classList.add('open');

  if (nameInput) {
    setTimeout(() => nameInput.focus(), 50);
  }
}

// Close Future Note Modal without saving
function closeFutureNoteModal() {
  const modal = document.getElementById('futurePlanModal');
  if (modal) {
    modal.classList.remove('open');
  }
  activeEditingPlanId = null;
  const form = document.getElementById('futurePlanForm');
  if (form) form.reset();
}

// ==========================================================================
// 5. NOTIFICATION & ALARM TOAST UI
// ==========================================================================

function triggerNotificationUI(item) {
  if (appState.settings && appState.settings.soundEnabled) {
    audioEngine.playAmbientChime();
  }

  if (appState.settings && appState.settings.browserNotifications) {
    reminderManager.showBrowserNotification(item);
  }

  if (!appState.notificationsHistory) appState.notificationsHistory = [];
  appState.notificationsHistory.unshift({
    id: `notif-${Date.now()}`,
    title: item.title,
    section: item.section,
    details: item.details,
    time: new Date().toISOString(),
    read: false
  });
  saveState(appState);
  updateNotificationBadge();

  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  toast.className = 'ambient-toast';
  toast.id = toastId;

  toast.innerHTML = `
    <div class="toast-top">
      <div>
        <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); font-weight: 600;">
          ${escapeHTML(item.section)}
        </div>
        <div class="toast-title">${escapeHTML(item.title)}</div>
      </div>
      <button class="btn-ghost close-toast-btn" style="padding: 0.2rem;">&times;</button>
    </div>
    <div class="toast-body">${escapeHTML(item.details)}</div>
    <div class="toast-actions">
      <button class="btn-secondary snooze-toast-btn" data-duration="5" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">Snooze 5m</button>
      <button class="btn-secondary snooze-toast-btn" data-duration="15" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">15m</button>
      <button class="btn-primary dismiss-toast-btn" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;">Done</button>
    </div>
  `;

  toast.querySelector('.close-toast-btn').onclick = () => {
    reminderManager.dismiss(item.id);
    toast.remove();
  };

  toast.querySelector('.dismiss-toast-btn').onclick = () => {
    reminderManager.dismiss(item.id);
    toast.remove();
  };

  toast.querySelectorAll('.snooze-toast-btn').forEach(btn => {
    btn.onclick = () => {
      const mins = parseInt(btn.getAttribute('data-duration'), 10);
      reminderManager.snooze(item.id, mins);
      showSimpleToast(`Reminder snoozed for ${mins} minutes.`);
      toast.remove();
    };
  });

  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (document.getElementById(toastId)) {
      toast.remove();
    }
  }, 25000);
}

function updateNotificationBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const items = reminderManager.getAllReminderItems().filter(i => Boolean(i.triggerTime));
  if (items.length > 0) {
    badge.textContent = items.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderNotificationPopoverList() {
  const listEl = document.getElementById('notifList');
  if (!listEl) return;

  const items = reminderManager.getAllReminderItems()
    .filter(i => Boolean(i.triggerTime))
    .sort((a, b) => a.triggerTime - b.triggerTime);

  if (items.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; color: var(--text-dim); padding: 1.5rem 1rem; font-size: 0.85rem;">
        No active reminders scheduled.
      </div>
    `;
    return;
  }

  listEl.innerHTML = items.map(item => {
    const dateFormatted = new Date(item.triggerTime).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="popover-item">
        <div style="font-size: 0.7rem; color: var(--accent); font-weight: 600;">${escapeHTML(item.section)}</div>
        <div class="popover-item-title">${escapeHTML(item.title)}</div>
        <div class="popover-item-desc">${escapeHTML(item.details)}</div>
        <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 0.3rem;">
          Trigger: ${dateFormatted}
        </div>
      </div>
    `;
  }).join('');
}

function showSimpleToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'ambient-toast';
  t.style.padding = '0.75rem 1.15rem';
  t.innerHTML = `<div style="font-size: 0.88rem; color: var(--text-main);">${escapeHTML(message)}</div>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ==========================================================================
// 6. EVENT LISTENERS & DELEGATION CONTROLLERS
// ==========================================================================

function setupEventListeners() {
  // Navigation Tabs Switching
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slide = btn.getAttribute('data-slide');
      switchSlide(slide);
    });
  });

  // Brand click resets to slide 1
  document.getElementById('brandBtn').addEventListener('click', () => switchSlide(1));

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      if (e.key === 'Escape') closeAllModals();
      return;
    }

    if (e.key === '1') switchSlide(1);
    else if (e.key === '2') switchSlide(2);
    else if (e.key === '3') switchSlide(3);
    else if (e.key === '4') switchSlide(4);
    else if (e.key === 'Escape') closeAllModals();
  });

  // --- Slide 1 Listeners ---
  const priorityGroup = document.getElementById('newTaskPriorityGroup');
  priorityGroup.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill-btn');
    if (!pill) return;
    priorityGroup.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    pill.classList.add('active');
  });

  const titleInput = document.getElementById('newTaskTitle');
  const addTask = () => {
    const title = titleInput.value.trim();
    if (!title) return;

    const desc = document.getElementById('newTaskDesc').value.trim();
    const activePill = priorityGroup.querySelector('.pill-btn.active');
    const priority = activePill ? activePill.getAttribute('data-priority') : 'Medium';
    const time = document.getElementById('newTaskTime').value;
    const reminderTiming = document.getElementById('newTaskReminderTiming').value;

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: desc,
      priority,
      time,
      deadline: new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: new Date().toISOString(),
      carriedForward: false,
      reminder: {
        enabled: reminderTiming !== 'none',
        timing: reminderTiming,
        targetTime: ''
      }
    };

    if (!appState.tasks) appState.tasks = [];
    appState.tasks.unshift(newTask);
    saveState(appState);

    titleInput.value = '';
    document.getElementById('newTaskDesc').value = '';
    document.getElementById('newTaskTime').value = '';
    document.getElementById('newTaskReminderTiming').value = 'none';

    renderSlide1();
    updateNotificationBadge();
    showSimpleToast('Task added to Today\'s list.');
  };

  document.getElementById('addTaskSubmitBtn').addEventListener('click', addTask);
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });

  document.getElementById('taskStatusFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#taskStatusFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    renderTasksList();
  });

  document.getElementById('taskSortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasksList();
  });

  document.getElementById('dailyTasksContainer').addEventListener('click', (e) => {
    const checkBtn = e.target.closest('.task-check-btn');
    if (checkBtn) {
      const id = checkBtn.getAttribute('data-id');
      const t = appState.tasks.find(x => x.id === id);
      if (t) {
        t.completed = checkBtn.checked;
        saveState(appState);
        renderSlide1();
      }
      return;
    }

    const editBtn = e.target.closest('.edit-task-btn');
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      openEditTaskModal(id);
      return;
    }

    const deleteBtn = e.target.closest('.delete-task-btn');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      appState.tasks = appState.tasks.filter(x => x.id !== id);
      saveState(appState);
      renderSlide1();
      updateNotificationBadge();
      return;
    }
  });

  document.getElementById('carryForwardBtn').addEventListener('click', () => {
    const incomplete = (appState.tasks || []).filter(t => !t.completed);
    if (incomplete.length === 0) {
      showSimpleToast('All tasks are completed! Nothing to carry forward.');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    incomplete.forEach(t => {
      t.carriedForward = true;
      t.deadline = tomorrowStr;
    });

    saveState(appState);
    renderSlide1();
    showSimpleToast(`Carried forward ${incomplete.length} incomplete tasks to tomorrow.`);
  });

  // --- Slide 2: Workspace Listeners ---
  document.getElementById('workspaceSearchInput').addEventListener('input', (e) => {
    workspaceSearchQuery = e.target.value;
    renderSlide2();
  });

  const rowEl = document.getElementById('workspaceCardsContainer');
  document.getElementById('scrollWorkspacesLeftBtn').addEventListener('click', () => {
    rowEl.scrollBy({ left: -380, behavior: 'smooth' });
  });
  document.getElementById('scrollWorkspacesRightBtn').addEventListener('click', () => {
    rowEl.scrollBy({ left: 380, behavior: 'smooth' });
  });

  // Workspace Row Delegated clicks (CHANGE 1: Clicking any card opens full dedicated workspace)
  rowEl.addEventListener('click', (e) => {
    // Add workspace slot card
    if (e.target.closest('#addWorkspaceSlotCard')) {
      openNewWorkspaceModal();
      return;
    }

    // Add entry button
    const addEntryBtn = e.target.closest('.add-ws-entry-btn');
    if (addEntryBtn) {
      e.stopPropagation();
      const wsId = addEntryBtn.getAttribute('data-ws-id');
      openEntryModal(wsId, null);
      return;
    }

    // Delete workspace button
    const delWsBtn = e.target.closest('.delete-ws-btn');
    if (delWsBtn) {
      e.stopPropagation();
      const wsId = delWsBtn.getAttribute('data-ws-id');
      if (confirm('Are you sure you want to delete this workspace and all its entries?')) {
        appState.workspaces = appState.workspaces.filter(w => w.id !== wsId);
        saveState(appState);
        renderSlide2();
        updateNotificationBadge();
      }
      return;
    }

    // Edit entry inside card
    const editEntryBtn = e.target.closest('.edit-entry-btn');
    if (editEntryBtn) {
      e.stopPropagation();
      const wsId = editEntryBtn.getAttribute('data-ws-id');
      const entryId = editEntryBtn.getAttribute('data-id');
      openEntryModal(wsId, entryId);
      return;
    }

    // Delete entry inside card
    const deleteEntryBtn = e.target.closest('.delete-entry-btn');
    if (deleteEntryBtn) {
      e.stopPropagation();
      const wsId = deleteEntryBtn.getAttribute('data-ws-id');
      const entryId = deleteEntryBtn.getAttribute('data-id');
      const ws = appState.workspaces.find(w => w.id === wsId);
      if (ws) {
        ws.entries = ws.entries.filter(x => x.id !== entryId);
        saveState(appState);
        renderSlide2();
        updateNotificationBadge();
      }
      return;
    }

    // CLICKING THE CARD ITSELF OPENS DEDICATED WORKSPACE PAGE!
    const wsCard = e.target.closest('.workspace-card');
    if (wsCard) {
      const wsId = wsCard.getAttribute('data-ws-id');
      if (wsId) {
        openDedicatedWorkspacePage(wsId);
      }
    }
  });

  // Dedicated Workspace View Delegated actions
  const dedicatedContainer = document.getElementById('workspaceDedicatedView');
  dedicatedContainer.addEventListener('click', (e) => {
    // Add entry in dedicated view
    const addBtn = e.target.closest('.add-dedicated-entry-btn');
    if (addBtn) {
      const wsId = addBtn.getAttribute('data-ws-id');
      openEntryModal(wsId, null);
      return;
    }

    // Edit entry in dedicated view
    const editBtn = e.target.closest('.edit-dedicated-entry-btn');
    if (editBtn) {
      const wsId = editBtn.getAttribute('data-ws-id');
      const entryId = editBtn.getAttribute('data-id');
      openEntryModal(wsId, entryId);
      return;
    }

    // Delete entry in dedicated view
    const delBtn = e.target.closest('.delete-dedicated-entry-btn');
    if (delBtn) {
      const wsId = delBtn.getAttribute('data-ws-id');
      const entryId = delBtn.getAttribute('data-id');
      const ws = appState.workspaces.find(w => w.id === wsId);
      if (ws && confirm('Delete this entry?')) {
        ws.entries = ws.entries.filter(x => x.id !== entryId);
        saveState(appState);
        renderDedicatedWorkspacePage(wsId);
        updateNotificationBadge();
        showSimpleToast('Entry deleted.');
      }
      return;
    }

    // Project subtask interactive toggle in dedicated view
    const subtaskCheck = e.target.closest('.dedicated-subtask-toggle');
    if (subtaskCheck) {
      const projId = subtaskCheck.getAttribute('data-proj-id');
      const subtaskId = subtaskCheck.getAttribute('data-subtask-id');
      const ws = appState.workspaces.find(w => w.id === 'projects');
      if (ws) {
        const proj = ws.entries.find(p => p.id === projId);
        if (proj && proj.subtasks) {
          const st = proj.subtasks.find(s => s.id === subtaskId);
          if (st) {
            st.completed = subtaskCheck.checked;
            const done = proj.subtasks.filter(s => s.completed).length;
            proj.progress = Math.round((done / proj.subtasks.length) * 100);
            saveState(appState);
            renderDedicatedWorkspacePage('projects');
          }
        }
      }
      return;
    }
  });

  document.getElementById('openNewWorkspaceModalBtn').addEventListener('click', openNewWorkspaceModal);

  // --- Slide 3: Future Planning Listeners (CHANGE 2) ---
  const addFutureBtn = document.getElementById('openAddFutureNoteBtn');
  if (addFutureBtn) {
    addFutureBtn.addEventListener('click', () => openFutureNoteModal(null));
  }

  const futureSearch = document.getElementById('futureNotesSearchInput');
  if (futureSearch) {
    futureSearch.addEventListener('input', (e) => {
      futureNotesSearchQuery = e.target.value;
      renderSlide3();
    });
  }

  // Color picker in Note Modal
  const colorPicker = document.getElementById('noteColorPicker');
  if (colorPicker) {
    colorPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.color-swatch-btn');
      if (!btn) return;
      colorPicker.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('fpColor').value = btn.getAttribute('data-color');
    });
  }

  // Delegated clicks for Future Sticky Notes Grid
  const futureNotesContainer = document.getElementById('futureNotesContainer');
  if (futureNotesContainer) {
    futureNotesContainer.addEventListener('click', (e) => {
      // Move to workspace
      const moveBtn = e.target.closest('.note-btn-move');
      if (moveBtn) {
        const noteId = moveBtn.getAttribute('data-note-id');
        openMoveToWorkspaceModal(noteId);
        return;
      }

      // Edit note
      const editBtn = e.target.closest('.edit-note-btn');
      if (editBtn) {
        const noteId = editBtn.getAttribute('data-note-id');
        openFutureNoteModal(noteId);
        return;
      }

      // Delete note
      const delBtn = e.target.closest('.delete-note-btn');
      if (delBtn) {
        const noteId = delBtn.getAttribute('data-note-id');
        if (confirm('Delete this note?')) {
          appState.futurePlans = (appState.futurePlans || []).filter(p => p.id !== noteId);
          saveState(appState);
          renderSlide3();
          updateNotificationBadge();
          showSimpleToast('Note deleted.');
        }
        return;
      }
    });
  }

  // Move Modal Confirm
  document.getElementById('confirmMoveBtn').addEventListener('click', executeMoveToWorkspace);
  document.getElementById('cancelMoveBtn').addEventListener('click', () => {
    document.getElementById('moveToWorkspaceModal').classList.remove('open');
  });
  document.getElementById('closeMoveModalBtn').addEventListener('click', () => {
    document.getElementById('moveToWorkspaceModal').classList.remove('open');
  });

  // Notification Popover toggle
  const notifBtn = document.getElementById('notifBellBtn');
  const notifPopover = document.getElementById('notifPopover');
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderNotificationPopoverList();
    notifPopover.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!notifPopover.contains(e.target) && !notifBtn.contains(e.target)) {
      notifPopover.classList.remove('open');
    }
  });

  document.getElementById('testChimeBtn').addEventListener('click', () => {
    audioEngine.playAmbientChime();
    showSimpleToast('Ambient chime played.');
  });

  // Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingSoundToggle').checked = appState.settings ? appState.settings.soundEnabled : true;
    settingsModal.classList.add('open');
  });
  document.getElementById('closeSettingsModalBtn').addEventListener('click', () => settingsModal.classList.remove('open'));
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    if (!appState.settings) appState.settings = {};
    appState.settings.soundEnabled = document.getElementById('settingSoundToggle').checked;
    saveState(appState);
    settingsModal.classList.remove('open');
    showSimpleToast('Settings saved.');
  });

  document.getElementById('requestBrowserNotifBtn').addEventListener('click', async () => {
    const res = await reminderManager.requestBrowserPermission();
    if (res.status === 'granted') {
      if (!appState.settings) appState.settings = {};
      appState.settings.browserNotifications = true;
      saveState(appState);
      showSimpleToast('Browser notifications enabled successfully.');
    } else {
      showSimpleToast(`Notification permission status: ${res.status}`);
    }
  });

  // Data Export & Import
  document.getElementById('exportDataBtn').addEventListener('click', () => {
    exportStateAsJSON(appState);
    showSimpleToast('JSON backup exported.');
  });

  const importFileInput = document.getElementById('importFileInput');
  document.getElementById('triggerImportBtn').addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importStateFromJSON(event.target.result);
      if (res.success) {
        appState = res.state;
        renderSlide1();
        renderSlide2();
        renderSlide3();
        updateNotificationBadge();
        settingsModal.classList.remove('open');
        showSimpleToast('Data imported successfully.');
      } else {
        alert(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  });

  // Reset to Demo Data
  document.getElementById('resetDemoDataBtn').addEventListener('click', () => {
    if (confirm('Reset all tasks, workspaces, and future plans to sample demo data?')) {
      appState = resetToDemoData();
      renderSlide1();
      renderSlide2();
      renderSlide3();
      updateNotificationBadge();
      settingsModal.classList.remove('open');
      showSimpleToast('Restored sample data.');
    }
  });

  // Clear All Data
  document.getElementById('clearAllDataBtn').addEventListener('click', () => {
    if (confirm('Permanently clear all tasks, workspaces, and plans?')) {
      appState = clearAllUserData();
      renderSlide1();
      renderSlide2();
      renderSlide3();
      updateNotificationBadge();
      settingsModal.classList.remove('open');
      showSimpleToast('All data cleared.');
    }
  });
}

// ==========================================================================
// 7. DYNAMIC ENTRY ADD / EDIT MODAL CONTROLLER
// ==========================================================================

function openEntryModal(wsId, entryId) {
  const ws = appState.workspaces.find(w => w.id === wsId);
  if (!ws) return;

  activeEditingWorkspaceId = wsId;
  activeEditingEntryId = entryId;

  const modal = document.getElementById('entryModal');
  const titleEl = document.getElementById('entryModalTitle');
  const fieldsContainer = document.getElementById('entryModalFieldsContainer');

  const existing = entryId ? ws.entries.find(e => e.id === entryId) : null;
  titleEl.textContent = existing ? `Edit in ${ws.name}` : `Add New to ${ws.name}`;

  let html = '';

  if (wsId === 'hackathons') {
    html = `
      <div class="form-group">
        <label class="form-label">Hackathon Name *</label>
        <input type="text" class="form-input" name="name" value="${escapeHTML(existing?.name || '')}" required />
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Organizer</label>
          <input type="text" class="form-input" name="organizer" value="${escapeHTML(existing?.organizer || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" name="status">
            ${['Interested', 'Registered', 'Participating', 'Completed'].map(s => 
              `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Registration Deadline</label>
          <input type="date" class="form-input" name="regDeadline" value="${existing?.regDeadline || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Event Date</label>
          <input type="date" class="form-input" name="eventDate" value="${existing?.eventDate || ''}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Team Details</label>
        <input type="text" class="form-input" name="teamDetails" value="${escapeHTML(existing?.teamDetails || '')}" placeholder="Solo or team member names/roles" />
      </div>
      <div class="form-group">
        <label class="form-label">Registration / DevPost Link</label>
        <input type="url" class="form-input" name="regLink" value="${escapeHTML(existing?.regLink || '')}" placeholder="https://..." />
      </div>
      <div class="form-group">
        <label class="form-label">Reminder Timing</label>
        <select class="form-select" name="reminderTiming">
          <option value="none">No Reminder</option>
          <option value="1h" ${existing?.reminder?.timing === '1h' ? 'selected' : ''}>1 hour before</option>
          <option value="12h" ${existing?.reminder?.timing === '12h' ? 'selected' : ''}>12 hours before</option>
          <option value="1d" ${existing?.reminder?.timing === '1d' ? 'selected' : ''}>1 day before</option>
          <option value="3d" ${existing?.reminder?.timing === '3d' ? 'selected' : ''}>3 days before</option>
          <option value="1w" ${existing?.reminder?.timing === '1w' ? 'selected' : ''}>1 week before</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notes & Project Idea</label>
        <textarea class="form-textarea" name="notes">${escapeHTML(existing?.notes || '')}</textarea>
      </div>
    `;
  } else if (wsId === 'internships') {
    html = `
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Company Name *</label>
          <input type="text" class="form-input" name="company" value="${escapeHTML(existing?.company || '')}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Job Role</label>
          <input type="text" class="form-input" name="role" value="${escapeHTML(existing?.role || '')}" placeholder="e.g. SWE Intern" />
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Application Deadline</label>
          <input type="date" class="form-input" name="deadline" value="${existing?.deadline || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" name="status">
            ${['Not Applied', 'Applied', 'Assessment Pending', 'Interview Scheduled', 'Selected', 'Rejected'].map(s => 
              `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Job Portal Link</label>
        <input type="url" class="form-input" name="link" value="${escapeHTML(existing?.link || '')}" placeholder="https://..." />
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="date" class="form-input" name="startDate" value="${existing?.startDate || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="date" class="form-input" name="endDate" value="${existing?.endDate || ''}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Reminder Timing</label>
        <select class="form-select" name="reminderTiming">
          <option value="none">No Reminder</option>
          <option value="1h" ${existing?.reminder?.timing === '1h' ? 'selected' : ''}>1 hour before</option>
          <option value="12h" ${existing?.reminder?.timing === '12h' ? 'selected' : ''}>12 hours before</option>
          <option value="1d" ${existing?.reminder?.timing === '1d' ? 'selected' : ''}>1 day before</option>
          <option value="3d" ${existing?.reminder?.timing === '3d' ? 'selected' : ''}>3 days before</option>
          <option value="1w" ${existing?.reminder?.timing === '1w' ? 'selected' : ''}>1 week before</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notes & Prep Strategy</label>
        <textarea class="form-textarea" name="notes">${escapeHTML(existing?.notes || '')}</textarea>
      </div>
    `;
  } else if (wsId === 'projects') {
    const subtasksText = (existing?.subtasks || []).map(s => s.title).join('\n');
    html = `
      <div class="form-group">
        <label class="form-label">Project Name *</label>
        <input type="text" class="form-input" name="name" value="${escapeHTML(existing?.name || '')}" required />
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" name="description">${escapeHTML(existing?.description || '')}</textarea>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Deadline</label>
          <input type="date" class="form-input" name="deadline" value="${existing?.deadline || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" name="status">
            ${['Planning', 'In Progress', 'Review', 'Completed'].map(s => 
              `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Subtasks (One per line)</label>
        <textarea class="form-textarea" name="subtasksRaw" placeholder="Design UI&#10;Implement API&#10;Write unit tests">${escapeHTML(subtasksText)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Reminder Timing</label>
        <select class="form-select" name="reminderTiming">
          <option value="none">No Reminder</option>
          <option value="1h" ${existing?.reminder?.timing === '1h' ? 'selected' : ''}>1 hour before</option>
          <option value="12h" ${existing?.reminder?.timing === '12h' ? 'selected' : ''}>12 hours before</option>
          <option value="1d" ${existing?.reminder?.timing === '1d' ? 'selected' : ''}>1 day before</option>
          <option value="3d" ${existing?.reminder?.timing === '3d' ? 'selected' : ''}>3 days before</option>
          <option value="1w" ${existing?.reminder?.timing === '1w' ? 'selected' : ''}>1 week before</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" name="notes">${escapeHTML(existing?.notes || '')}</textarea>
      </div>
    `;
  } else if (wsId === 'learning') {
    html = `
      <div class="form-group">
        <label class="form-label">Course or Skill Name *</label>
        <input type="text" class="form-input" name="name" value="${escapeHTML(existing?.name || '')}" required />
      </div>
      <div class="form-group">
        <label class="form-label">Learning Goal</label>
        <input type="text" class="form-input" name="goal" value="${escapeHTML(existing?.goal || '')}" placeholder="What mastery means for this topic" />
      </div>
      <div class="form-group">
        <label class="form-label">Learning Resource Link</label>
        <input type="url" class="form-input" name="link" value="${escapeHTML(existing?.link || '')}" placeholder="https://..." />
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Target Completion Date</label>
          <input type="date" class="form-input" name="targetDate" value="${existing?.targetDate || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Progress Percentage (0-100)</label>
          <input type="number" class="form-input" name="progress" min="0" max="100" value="${existing?.progress || 0}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes & Summary</label>
        <textarea class="form-textarea" name="notes">${escapeHTML(existing?.notes || '')}</textarea>
      </div>
    `;
  } else {
    // Custom workspace fields
    const customFields = ws.customFields || [];
    html = `
      <div class="form-group">
        <label class="form-label">Entry Title *</label>
        <input type="text" class="form-input" name="name" value="${escapeHTML(existing?.name || existing?.title || '')}" required />
      </div>
      ${customFields.map(f => {
        const val = existing ? (existing[f.id] || '') : '';
        if (f.type === 'checkbox') {
          return `
            <div class="form-group" style="flex-direction: row; align-items: center; justify-content: space-between; padding: 0.25rem 0;">
              <label class="form-label">${escapeHTML(f.label)}</label>
              <input type="checkbox" class="custom-checkbox" name="custom_${f.id}" ${val ? 'checked' : ''} />
            </div>
          `;
        }
        if (f.type === 'dropdown') {
          const opts = f.options || ['Active', 'Pending', 'Done'];
          return `
            <div class="form-group">
              <label class="form-label">${escapeHTML(f.label)}</label>
              <select class="form-select" name="custom_${f.id}">
                ${opts.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
              </select>
            </div>
          `;
        }
        return `
          <div class="form-group">
            <label class="form-label">${escapeHTML(f.label)}</label>
            <input type="${f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}" 
                   class="form-input" 
                   name="custom_${f.id}" 
                   value="${escapeHTML(String(val))}" />
          </div>
        `;
      }).join('')}
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" name="notes">${escapeHTML(existing?.notes || '')}</textarea>
      </div>
    `;
  }

  fieldsContainer.innerHTML = html;
  modal.classList.add('open');
}

// Entry Form Submit
document.getElementById('entryModalForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const ws = appState.workspaces.find(w => w.id === activeEditingWorkspaceId);
  if (!ws) return;

  const form = e.target;
  const formData = new FormData(form);

  let entry = activeEditingEntryId ? ws.entries.find(x => x.id === activeEditingEntryId) : null;
  const isNew = !entry;

  if (isNew) {
    entry = { id: `entry-${Date.now()}` };
  }

  formData.forEach((val, key) => {
    if (key === 'subtasksRaw') {
      const lines = val.split('\n').map(l => l.trim()).filter(Boolean);
      const existingMap = new Map((entry.subtasks || []).map(s => [s.title, s.completed]));
      entry.subtasks = lines.map((line, idx) => ({
        id: `st-${idx}-${Date.now()}`,
        title: line,
        completed: existingMap.get(line) || false
      }));
      const done = entry.subtasks.filter(s => s.completed).length;
      entry.progress = entry.subtasks.length > 0 ? Math.round((done / entry.subtasks.length) * 100) : 0;
    } else if (key === 'reminderTiming') {
      entry.reminder = {
        enabled: val !== 'none',
        timing: val,
        customDate: ''
      };
    } else if (key.startsWith('custom_')) {
      const fieldId = key.replace('custom_', '');
      entry[fieldId] = val;
    } else if (key === 'progress') {
      entry.progress = parseInt(val, 10) || 0;
    } else {
      entry[key] = val;
    }
  });

  if (ws.customFields) {
    ws.customFields.forEach(f => {
      if (f.type === 'checkbox') {
        const chk = form.querySelector(`[name="custom_${f.id}"]`);
        entry[f.id] = chk ? chk.checked : false;
      }
    });
  }

  if (isNew) {
    if (!ws.entries) ws.entries = [];
    ws.entries.push(entry);
  }

  saveState(appState);
  document.getElementById('entryModal').classList.remove('open');

  // If in dedicated workspace view, refresh dedicated view; else refresh overview
  if (currentDedicatedWorkspaceId) {
    renderDedicatedWorkspacePage(currentDedicatedWorkspaceId);
  } else {
    renderSlide2();
  }

  updateNotificationBadge();
  showSimpleToast(`Saved entry in ${ws.name}.`);
});

document.getElementById('closeEntryModalBtn').addEventListener('click', () => {
  document.getElementById('entryModal').classList.remove('open');
});
document.getElementById('cancelEntryModalBtn').addEventListener('click', () => {
  document.getElementById('entryModal').classList.remove('open');
});

// ==========================================================================
// 8. CREATE CUSTOM WORKSPACE MODAL CONTROLLER
// ==========================================================================

let customFieldsBuilder = [];

function openNewWorkspaceModal() {
  customFieldsBuilder = [
    { id: 'fld_1', label: 'Organization / Link', type: 'text' },
    { id: 'fld_2', label: 'Deadline', type: 'date' }
  ];
  renderCustomFieldsBuilderList();
  document.getElementById('customWsName').value = '';
  document.getElementById('customWsDesc').value = '';
  document.getElementById('newWorkspaceModal').classList.add('open');
}

function renderCustomFieldsBuilderList() {
  const container = document.getElementById('customFieldsBuilderList');
  if (!container) return;

  container.innerHTML = customFieldsBuilder.map((fld, idx) => `
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <input type="text" class="form-input" style="flex: 2;" value="${escapeHTML(fld.label)}" placeholder="Field Label" data-idx="${idx}" data-prop="label" />
      <select class="form-select" style="flex: 1;" data-idx="${idx}" data-prop="type">
        <option value="text" ${fld.type === 'text' ? 'selected' : ''}>Text</option>
        <option value="date" ${fld.type === 'date' ? 'selected' : ''}>Date</option>
        <option value="url" ${fld.type === 'url' ? 'selected' : ''}>URL</option>
        <option value="number" ${fld.type === 'number' ? 'selected' : ''}>Number</option>
        <option value="dropdown" ${fld.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
        <option value="checkbox" ${fld.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
      </select>
      <button type="button" class="btn-ghost btn-danger remove-custom-field-btn" data-idx="${idx}">&times;</button>
    </div>
  `).join('');

  container.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      const prop = e.target.getAttribute('data-prop');
      customFieldsBuilder[idx][prop] = e.target.value;
    });
  });

  container.querySelectorAll('.remove-custom-field-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      customFieldsBuilder.splice(idx, 1);
      renderCustomFieldsBuilderList();
    });
  });
}

document.getElementById('addCustomFieldBtn').addEventListener('click', () => {
  customFieldsBuilder.push({
    id: `fld_${Date.now()}`,
    label: `Custom Field ${customFieldsBuilder.length + 1}`,
    type: 'text'
  });
  renderCustomFieldsBuilderList();
});

document.getElementById('newWorkspaceForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('customWsName').value.trim();
  if (!name) return;

  const desc = document.getElementById('customWsDesc').value.trim();
  const icon = document.getElementById('customWsIcon').value;

  const newWs = {
    id: `ws-${Date.now()}`,
    name,
    description: desc,
    icon,
    isCustom: true,
    customFields: customFieldsBuilder,
    entries: []
  };

  if (!appState.workspaces) appState.workspaces = [];
  appState.workspaces.push(newWs);
  saveState(appState);

  document.getElementById('newWorkspaceModal').classList.remove('open');
  renderSlide2();
  showSimpleToast(`Created custom workspace '${name}'.`);
});

document.getElementById('closeNewWorkspaceModalBtn').addEventListener('click', () => {
  document.getElementById('newWorkspaceModal').classList.remove('open');
});
document.getElementById('cancelNewWorkspaceBtn').addEventListener('click', () => {
  document.getElementById('newWorkspaceModal').classList.remove('open');
});

// ==========================================================================
// 9. FUTURE PLANNING (STICKY NOTES) & MOVE-TO-WORKSPACE MODALS
// ==========================================================================

document.getElementById('futurePlanForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('fpName').value.trim();
  if (!title) return;

  const desc = document.getElementById('fpDesc').value.trim();
  const color = document.getElementById('fpColor').value || 'orange';
  const targetDate = document.getElementById('fpTargetDate').value;
  const reminderTiming = document.getElementById('fpReminderTiming').value;

  let note = activeEditingPlanId ? (appState.futurePlans || []).find(p => p.id === activeEditingPlanId) : null;
  const isNew = !note;

  if (isNew) {
    note = {
      id: `fp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
  }

  note.title = title;
  note.description = desc;
  note.color = color;
  note.targetDate = targetDate;
  note.reminder = {
    enabled: reminderTiming !== 'none',
    timing: reminderTiming,
    customDate: ''
  };

  if (isNew) {
    if (!appState.futurePlans) appState.futurePlans = [];
    appState.futurePlans.unshift(note);
  }

  saveState(appState);
  closeFutureNoteModal();
  renderSlide3();
  updateNotificationBadge();
  showSimpleToast(isNew ? 'Note added.' : 'Note updated.');
});

document.getElementById('closeFuturePlanModalBtn').addEventListener('click', closeFutureNoteModal);
document.getElementById('cancelFuturePlanBtn').addEventListener('click', closeFutureNoteModal);

// Move Note to Workspace
function openMoveToWorkspaceModal(planId) {
  const plan = (appState.futurePlans || []).find(p => p.id === planId);
  if (!plan) return;

  activePlanToMove = plan;
  document.getElementById('movePlanItemTitle').textContent = `"${plan.title}"`;

  const selectEl = document.getElementById('destinationWorkspaceSelect');
  selectEl.innerHTML = (appState.workspaces || []).map(ws => {
    return `<option value="${ws.id}">${escapeHTML(ws.name)}</option>`;
  }).join('');

  document.getElementById('moveToWorkspaceModal').classList.add('open');
}

function executeMoveToWorkspace() {
  if (!activePlanToMove) return;

  const destWsId = document.getElementById('destinationWorkspaceSelect').value;
  const destWs = (appState.workspaces || []).find(w => w.id === destWsId);
  if (!destWs) return;

  const textContent = activePlanToMove.description || activePlanToMove.notes || '';

  const newEntry = {
    id: `entry-${Date.now()}`,
    name: activePlanToMove.title,
    notes: textContent
  };

  if (destWs.id === 'hackathons') {
    newEntry.organizer = 'TBD';
    newEntry.status = 'Interested';
    newEntry.regDeadline = activePlanToMove.targetDate || '';
  } else if (destWs.id === 'internships') {
    newEntry.company = activePlanToMove.title;
    newEntry.role = textContent || 'Candidate';
    newEntry.status = 'Not Applied';
    newEntry.deadline = activePlanToMove.targetDate || '';
  } else if (destWs.id === 'projects') {
    newEntry.description = textContent;
    newEntry.status = 'Planning';
    newEntry.deadline = activePlanToMove.targetDate || '';
    newEntry.progress = 0;
    newEntry.subtasks = [
      { id: `st-${Date.now()}`, title: 'Initial design and research', completed: false }
    ];
  } else if (destWs.id === 'learning') {
    newEntry.goal = textContent || activePlanToMove.title;
    newEntry.targetDate = activePlanToMove.targetDate || '';
    newEntry.progress = 0;
  } else {
    newEntry.deadline = activePlanToMove.targetDate || '';
  }

  if (!destWs.entries) destWs.entries = [];
  destWs.entries.push(newEntry);

  // Remove from future plans
  appState.futurePlans = appState.futurePlans.filter(p => p.id !== activePlanToMove.id);
  saveState(appState);

  document.getElementById('moveToWorkspaceModal').classList.remove('open');
  activePlanToMove = null;

  renderSlide3();
  showSimpleToast(`Transferred note to '${destWs.name}' workspace!`);
  
  // Switch to workspaces slide and open that dedicated page!
  switchSlide(2);
  openDedicatedWorkspacePage(destWs.id);
}

// ==========================================================================
// 10. EDIT TASK MODAL CONTROLLER
// ==========================================================================

let activeEditingTaskId = null;

function openEditTaskModal(taskId) {
  const task = (appState.tasks || []).find(t => t.id === taskId);
  if (!task) return;

  activeEditingTaskId = taskId;
  document.getElementById('editTaskTitle').value = task.title;
  document.getElementById('editTaskDesc').value = task.description || '';
  document.getElementById('editTaskPriority').value = task.priority || 'Medium';
  document.getElementById('editTaskTime').value = task.time || '';
  document.getElementById('editTaskReminder').value = task.reminder?.timing || 'none';

  document.getElementById('editTaskModal').classList.add('open');
}

document.getElementById('editTaskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const task = (appState.tasks || []).find(t => t.id === activeEditingTaskId);
  if (!task) return;

  task.title = document.getElementById('editTaskTitle').value.trim();
  task.description = document.getElementById('editTaskDesc').value.trim();
  task.priority = document.getElementById('editTaskPriority').value;
  task.time = document.getElementById('editTaskTime').value;

  const remTiming = document.getElementById('editTaskReminder').value;
  task.reminder = {
    enabled: remTiming !== 'none',
    timing: remTiming,
    targetTime: ''
  };

  saveState(appState);
  document.getElementById('editTaskModal').classList.remove('open');
  renderSlide1();
  updateNotificationBadge();
  showSimpleToast('Task updated.');
});

document.getElementById('closeEditTaskBtn').addEventListener('click', () => {
  document.getElementById('editTaskModal').classList.remove('open');
});
document.getElementById('cancelEditTaskBtn').addEventListener('click', () => {
  document.getElementById('editTaskModal').classList.remove('open');
});

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
  document.getElementById('notifPopover').classList.remove('open');
}

// Utility: HTML Escaping
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================================================
// 11. INITIAL BOOTSTRAP
// ==========================================================================

function bootstrapApp() {
  setupEventListeners();
  clubsController = initClubs({ getState: () => appState, saveState, escapeHTML, toast: showSimpleToast });

  // Switch to saved or default slide
  switchSlide(appState.activeSlide || 1);

  // Start background reminder engine
  reminderManager.start();
  updateNotificationBadge();

  console.log('Ambient Productivity Platform initialized successfully.');
}

window.addEventListener('DOMContentLoaded', bootstrapApp);
