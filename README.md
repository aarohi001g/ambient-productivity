# Ambient – Personal Productivity Web Application (MVP)

A responsive, high-performance personal productivity web application built with a premium dark ambient aesthetic. Designed to help developers and students manage daily tasks, hackathons, internships, projects, and future plans in one unified, clutter-free dashboard.

---

## 🌟 Key Highlights & Design Principles

- **Zero Clutter, Maximum Clarity**: Everything is simple, visible, organized, and accessible with minimal clicks.
- **Three Core Slides**:
  1. **Daily To-Do** (Accent: Soft Orange `#FFAC67`)
  2. **My Workspace Cards** (Accent: Soft Blue `#69BFFF`)
  3. **Future Planning** (Accent: Soft Green `#75E5B0`)
- **Dark Ambient Neon Theme**:
  - Deep black background (`#08090D`) and dark charcoal cards (`#141720`).
  - Soft ambient light emerging from within the black background through diffused, blurred radial gradients.
  - Exactly **one** primary ambient glow visible at a time, smoothly morphing when switching slides.
  - Zero harsh neon borders or distracting bright outlines.

---

## 📂 Feature Breakdown

### 1. Slide One – Daily To-Do List
- **Header Overview**: Today's formatted date, daily progress percentage, total, completed, and pending counters with a smooth animated progress bar.
- **Quick Add Task**: Title, optional description, priority pills (**High**, **Medium**, **Low**), optional time, and reminder preset (`Enter` key supported).
- **Task List**: Custom checkmarks, priority badges, scheduled time chips, reminder status, and edit/delete actions.
- **Sorting & Filtering**: Filter by *All*, *Pending*, *Completed*; Sort by *Priority*, *Time*, or *Creation Order*.
- **Compact Time Schedule**: Chronological timeline below the task list displaying tasks that have a specific time assigned today.
- **Carry Forward Incomplete Tasks**: One-click action to carry forward unfinished tasks to tomorrow while preserving their priority and notes.

### 2. Slide Two – My Workspace Cards & Dedicated Full-Screen Workspaces
- **Fully Clickable Workspace Cards**:
  - Clicking any workspace card on the overview opens that workspace in its own **large, dedicated full-screen page** occupying most of the screen.
  - Displays all entries, complete details, and category-tailored fields.
  - Includes a clearly visible **"← Back to Workspaces"** button to return smoothly to the overview.
- **Built-in Workspace Categories**:
  - **Hackathons**: Name, organizer, registration start/end dates, event date, team details, registration/DevPost link, status (*Interested*, *Registered*, *Participating*, *Completed*), notes, reminder.
  - **Internships**: Company, role, application deadline, portal link, start/end dates, status (*Not Applied*, *Applied*, *Assessment Pending*, *Interview Scheduled*, *Selected*, *Rejected*), prep notes, reminder.
  - **Projects**: Description, interactive subtasks checklist (clicking subtasks updates progress live!), start date, deadline, status (*Planning*, *In Progress*, *Review*, *Completed*), architecture notes.
  - **Learning**: Resource link, learning goal, target completion date, progress tracker, notes.
- **Custom Workspaces**: Create unlimited custom categories with customized field schemas (**Text**, **Date**, **URL**, **Dropdown**, **Checkbox**, **Number**).
- **Dedicated View Controls**: Category-specific search input, status filter pills, and sort dropdown (Nearest Deadline, Name, Status).

### 3. Slide Three – Future Planning (Colorful Cheat-Sheet Sticky Notes)
- **No Rigid Categories**: Freeform, user-controlled digital sticky notes arranged neatly in a responsive grid.
- **Pastel Palette**: Individually colored using soft, aesthetically pleasing shades:
  - Soft Orange (`#FFE4D6`)
  - Light Blue (`#D8EEFD`)
  - Lavender (`#EDE4F9`)
  - Mint Green (`#D8F5E5`)
  - Soft Pink (`#FFE2EC`)
  - Muted Yellow (`#FEF4C5`)
- **Card Content**:
  - Free-text title.
  - Free-text notes and descriptions (cheat-sheets, ideas, code snippets).
  - Optional date chip.
  - **Move to Workspace**: Promotes any note directly into an active workspace card (preserving titles, notes, and deadlines).
  - Inline edit and delete controls.
- **Note Management**: Add unlimited notes with the "+ Add Note" button, pick colors via the interactive palette, or let colors auto-assign.

---

## 🔔 Cross-Section Reminder & Alarm Engine

- **Coverage**: Works across Daily Tasks, Hackathon deadlines, Internship applications, Project milestones, and Future Notes.
- **Timing Presets**: 1 week before, 3 days before, 1 day before, 12 hours before, 1 hour before, or custom dates.
- **Web Audio Chime**: Synthesized dual-tone harmonic bell (E5 + B5) using the native Web Audio API — completely self-contained with no external MP3 dependencies.
- **In-App Toast Alerts**: Non-intrusive ambient toasts with **Snooze (5m, 15m)** and dismissal buttons.
- **Browser Desktop Notifications**: Native `Notification` API support with permission request toggle.
- **Notification Bell Popover**: Displays unread badge counts and upcoming reminders with a "Test Chime" button.

---

## 💾 Data Persistence & Portability

- **Automatic `localStorage` Sync**: Everything persists across browser reloads.
- **Export & Import JSON**: Backup or transfer your entire productivity state via the Settings dialog (`⚙️`).
- **Reset to Sample / Clear All**: Safe recovery options in Settings.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `1` | Switch to **Daily To-Do** (Soft Orange theme) |
| `2` | Switch to **My Workspace Cards** (Soft Blue theme) |
| `3` | Switch to **Future Planning** (Soft Green theme) |
| `Escape` | Close any active modal, dialog, or popover |
| `Enter` | Submit quick task in the daily input field |

---

## 🚀 Running the Application

### Option A: Open directly in any modern browser
Double click or open `index.html` in Chrome, Firefox, Safari, or Edge. Everything is self-contained with zero external dependencies.

### Option B: Local HTTP Server (Included)
```bash
node server.js
```
Then visit:
```
http://127.0.0.1:3000
```

---

## 4. College Clubs (added in the November 2026 continuation)

- Dedicated fourth dashboard tab and keyboard shortcut `4`.
- Club categories: Technical, Cultural, Debating & Literary, Social Service/NSS, and Other.
- Add, edit, delete, and open a dedicated club detail view.
- Track designation, joining date, status, responsibilities, events, deadlines, participation, achievements/certificates, skills/contributions, meeting notes, and important links.
- Club data is saved inside the existing application state in `localStorage`; older saved states are upgraded safely with an empty `clubs` collection.
- Uses the existing dark theme and existing app state/export/import flow.


## Updated College Clubs navigation
College Clubs now follows a three-level structure:
1. Category cards (default and user-created categories)
2. Clubs inside the selected category
3. A separate workspace page for each club

Category and club information is stored in the app's existing localStorage state. Existing club records are retained and their categories are included automatically.

## Run locally (Windows)
1. Open this project folder in PowerShell.
2. Run `node server.js`.
3. Open `http://127.0.0.1:3000` in your browser.
4. To stop the server, press `Ctrl + C` in PowerShell.

Keep your original backup folder unchanged. This ZIP is a separate improved copy.

### College Clubs – Free-writing workspace update
- Club creation/editing now asks only for core membership details: club name, category, designation, joining date, and status.
- Each club workspace has one large personal writing area for plans, ideas, event preparation, tasks, meeting notes, and anything else.
- Writing is saved automatically to the browser's existing local storage, separately for each club.
- Existing information from the earlier structured club fields is carried into the new writing area the first time that club is opened.
