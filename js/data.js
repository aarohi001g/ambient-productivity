// data.js - Data models, LocalStorage synchronization, and Default seed data

const STORAGE_KEY = 'ambient_productivity_state_v1';

// Seed dates relative to today so demo data always feels fresh and live
const now = new Date();
const formatDateOffset = (days, hours = 0) => {
  const d = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000));
  return d.toISOString().split('T')[0];
};

const formatTimeOffset = (hoursOffset) => {
  const d = new Date(now.getTime() + hoursOffset * 60 * 60 * 1000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = '00';
  return `${hh}:${mm}`;
};

export const INITIAL_DATA = {
  activeSlide: 1, // 1: Daily To-Do, 2: Workspace Cards, 3: Future Planning, 4: College Clubs
  settings: {
    soundEnabled: true,
    browserNotifications: false,
    autoCarryForward: false,
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Complete system architecture diagram for AI agent',
      description: 'Draft the multi-agent orchestration pipeline in Mermaid and review latency constraints.',
      priority: 'High',
      time: '10:00',
      deadline: formatDateOffset(0),
      completed: true,
      createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
      reminder: {
        enabled: true,
        timing: '1h',
        targetTime: `${formatDateOffset(0)}T09:00:00`
      }
    },
    {
      id: 'task-2',
      title: 'Submit Google SWE Summer Internship application',
      description: 'Finalize resume PDF and review referral code before submission deadline.',
      priority: 'High',
      time: '14:30',
      deadline: formatDateOffset(0),
      completed: false,
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      reminder: {
        enabled: true,
        timing: '12h',
        targetTime: `${formatDateOffset(0)}T14:00:00`
      }
    },
    {
      id: 'task-3',
      title: 'Code review for team backend pull request #42',
      description: 'Check auth middleware token validation and rate limiting thresholds.',
      priority: 'Medium',
      time: '16:00',
      deadline: formatDateOffset(0),
      completed: false,
      createdAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
      reminder: {
        enabled: false,
        timing: '1h',
        targetTime: ''
      }
    },
    {
      id: 'task-4',
      title: 'Read 2 chapters of Designing Data-Intensive Applications',
      description: 'Chapter 5: Replication logs and leaderless consensus algorithms.',
      priority: 'Low',
      time: '20:00',
      deadline: formatDateOffset(0),
      completed: false,
      createdAt: now.toISOString(),
      reminder: {
        enabled: true,
        timing: '1h',
        targetTime: `${formatDateOffset(0)}T19:00:00`
      }
    },
    {
      id: 'task-5',
      title: 'Update LinkedIn portfolio and GitHub project pinned repos',
      description: 'Add live demo links and metrics for recent full-stack apps.',
      priority: 'Low',
      time: '',
      deadline: formatDateOffset(1),
      completed: false,
      createdAt: now.toISOString(),
      reminder: {
        enabled: false,
        timing: '1d',
        targetTime: ''
      }
    }
  ],
  workspaces: [
    {
      id: 'hackathons',
      name: 'Hackathons',
      icon: 'trophy',
      description: 'Upcoming hackathons, team statuses & submissions',
      isCustom: false,
      entries: [
        {
          id: 'hack-1',
          name: 'MIT HackNation 2026',
          organizer: 'MIT Tech Club & DevPost',
          regStartDate: formatDateOffset(-10),
          regDeadline: formatDateOffset(4),
          eventDate: formatDateOffset(12),
          teamDetails: 'Team Antigravity (4 members: 2 Full-Stack, 1 ML, 1 Designer)',
          regLink: 'https://devpost.com/hackathons/mit-hacknation',
          status: 'Registered',
          notes: 'Focusing on real-time offline AI copilots using WebGPU. Pitch deck draft ready.',
          reminder: {
            enabled: true,
            timing: '3d',
            customDate: `${formatDateOffset(1)}T10:00`
          }
        },
        {
          id: 'hack-2',
          name: 'Global AI Agents Olympiad',
          organizer: 'Open Source AI Foundation',
          regStartDate: formatDateOffset(-2),
          regDeadline: formatDateOffset(14),
          eventDate: formatDateOffset(25),
          teamDetails: 'Solo submission or duo with Alex',
          regLink: 'https://ai-agents.olympiad.org',
          status: 'Interested',
          notes: 'Autonomous multi-modal code review assistant with auto-healing tests.',
          reminder: {
            enabled: true,
            timing: '1w',
            customDate: `${formatDateOffset(7)}T09:00`
          }
        },
        {
          id: 'hack-3',
          name: 'ETHGlobal DevConnect Hack',
          organizer: 'ETHGlobal',
          regStartDate: formatDateOffset(-25),
          regDeadline: formatDateOffset(-2),
          eventDate: formatDateOffset(-1),
          teamDetails: 'Trio team',
          regLink: 'https://ethglobal.com',
          status: 'Completed',
          notes: 'Won 2nd prize in Decentralized Identity track! Certificate uploaded.',
          reminder: {
            enabled: false,
            timing: '1d',
            customDate: ''
          }
        }
      ]
    },
    {
      id: 'internships',
      name: 'Internships',
      icon: 'briefcase',
      description: 'Summer and winter software engineering internship applications',
      isCustom: false,
      entries: [
        {
          id: 'intern-1',
          name: 'Google SWE Summer Intern 2027',
          company: 'Google',
          role: 'Software Engineering Intern',
          deadline: formatDateOffset(3),
          link: 'https://careers.google.com/jobs/results/swe-intern',
          startDate: formatDateOffset(180),
          endDate: formatDateOffset(270),
          status: 'Applied',
          notes: 'Applied via employee referral from mentor. Prepared LeetCode Medium/Hard DP & Graphs.',
          reminder: {
            enabled: true,
            timing: '1d',
            customDate: `${formatDateOffset(2)}T11:00`
          }
        },
        {
          id: 'intern-2',
          name: 'Stripe Infrastructure Intern',
          company: 'Stripe',
          role: 'Core Systems & Reliability Engineer Intern',
          deadline: formatDateOffset(8),
          link: 'https://stripe.com/jobs/infra-intern',
          startDate: formatDateOffset(180),
          endDate: formatDateOffset(270),
          status: 'Interview Scheduled',
          notes: 'Technical screen round scheduled for next Thursday. Review Distributed Systems primitives.',
          reminder: {
            enabled: true,
            timing: '12h',
            customDate: `${formatDateOffset(7)}T18:00`
          }
        },
        {
          id: 'intern-3',
          name: 'OpenAI Research Engineer Intern',
          company: 'OpenAI',
          role: 'Applied AI Platform Intern',
          deadline: formatDateOffset(18),
          link: 'https://openai.com/careers',
          startDate: formatDateOffset(190),
          endDate: formatDateOffset(280),
          status: 'Assessment Pending',
          notes: 'Take-home coding challenge received. Time limit 3 hours.',
          reminder: {
            enabled: true,
            timing: '3d',
            customDate: `${formatDateOffset(15)}T14:00`
          }
        }
      ]
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: 'code',
      description: 'Personal tech stack projects, milestones & live repos',
      isCustom: false,
      entries: [
        {
          id: 'proj-1',
          name: 'AmbientFlow: Minimalist Dark Task OS',
          description: 'A responsive dark ambient neon productivity application designed for high-focus developers.',
          subtasks: [
            { id: 'st-1', title: 'Design dark ambient glow transitions', completed: true },
            { id: 'st-2', title: 'Implement dynamic horizontal workspace cards', completed: true },
            { id: 'st-3', title: 'Build unified cross-section reminder alarm engine', completed: true },
            { id: 'st-4', title: 'Add future plan to workspace transfer workflow', completed: false }
          ],
          startDate: formatDateOffset(-14),
          deadline: formatDateOffset(5),
          progress: 75,
          status: 'In Progress',
          notes: 'V1 MVP release scheduled for Friday. Needs clean export/import backup feature.',
          reminder: {
            enabled: true,
            timing: '1d',
            customDate: `${formatDateOffset(4)}T12:00`
          }
        },
        {
          id: 'proj-2',
          name: 'MicroKV: Distributed In-Memory Storage',
          description: 'Raft consensus based distributed key-value store in Go with persistent WAL and snapshotting.',
          subtasks: [
            { id: 'st-21', title: 'Raft leader election protocol', completed: true },
            { id: 'st-22', title: 'Log replication with heartbeat', completed: true },
            { id: 'st-23', title: 'Dynamic cluster membership change', completed: false },
            { id: 'st-24', title: 'Benchmark write IOPS under partition', completed: false }
          ],
          startDate: formatDateOffset(-45),
          deadline: formatDateOffset(22),
          progress: 50,
          status: 'In Progress',
          notes: 'Achieving 45k writes/sec on 3-node cluster. Documenting test results.',
          reminder: {
            enabled: false,
            timing: '1w',
            customDate: ''
          }
        }
      ]
    },
    {
      id: 'learning',
      name: 'Learning',
      icon: 'graduation-cap',
      description: 'Continuous engineering courses, papers & skills roadmap',
      isCustom: false,
      entries: [
        {
          id: 'learn-1',
          name: 'Advanced Rust & Systems Concurrency',
          link: 'https://rust-lang.org/book',
          goal: 'Master async Tokio runtimes, pinning, unsafe memory semantics & SIMD',
          targetDate: formatDateOffset(15),
          progress: 68,
          notes: 'Completed chapters on interior mutability (RefCell, Arc, Mutex). Building async crawler next.',
          reminder: {
            enabled: true,
            timing: '3d',
            customDate: `${formatDateOffset(12)}T18:00`
          }
        },
        {
          id: 'learn-2',
          name: 'Transformers & Large Language Model Internals',
          link: 'https://huggingface.co/course',
          goal: 'Implement multi-head attention and RoPE positional embeddings from scratch in PyTorch',
          targetDate: formatDateOffset(30),
          progress: 40,
          notes: 'Implemented decoder-only architecture. Next: FlashAttention-2 GPU kernel concepts.',
          reminder: {
            enabled: false,
            timing: '1w',
            customDate: ''
          }
        }
      ]
    }
  ],
  futurePlans: [
    {
      id: 'fp-1',
      title: 'Build WebGPU Shader Visualizer for Neural Activations',
      description: 'Interactive browser canvas rendering real-time weights and attention maps for local small models.',
      color: 'orange',
      category: 'Projects',
      targetDate: formatDateOffset(14),
      priority: 'High',
      notes: 'Look into wgsl shaders and three.js compute pass. Might convert into a hackathon project.',
      completed: false,
      createdAt: formatDateOffset(-2)
    },
    {
      id: 'fp-2',
      title: 'Prepare for Jane Street SWE & Trading Systems Fellowship',
      description: 'Study OCaml functional programming paradigms and market microstructure low latency concepts.',
      color: 'blue',
      category: 'Internships',
      targetDate: formatDateOffset(45),
      priority: 'Medium',
      notes: 'Read Real World OCaml book and practice algorithmic game theory problems.',
      completed: false,
      createdAt: formatDateOffset(-5)
    },
    {
      id: 'fp-3',
      title: 'Explore Tinygrad and Tensor Compiler Architecture',
      description: 'Deep dive into George Hotz tinygrad code, understand intermediate representations and JIT compilers.',
      color: 'lavender',
      category: 'Learning',
      targetDate: formatDateOffset(60),
      priority: 'Low',
      notes: 'Write blog breakdown of AST fusion in tinygrad vs TorchDynamo.',
      completed: false,
      createdAt: formatDateOffset(-10)
    },
    {
      id: 'fp-4',
      title: 'Contribute Pull Request to Apache Arrow or ClickHouse',
      description: 'Identify good first issues in columnar analytical query processing engine.',
      color: 'mint',
      category: 'Projects',
      targetDate: '',
      priority: 'Medium',
      notes: 'Join ClickHouse community Slack and read contribution guidelines.',
      completed: false,
      createdAt: formatDateOffset(-15)
    },
    {
      id: 'fp-5',
      title: 'Design personal minimalist hardware desk setup',
      description: 'Custom split mechanical keyboard, monitor riser, ambient warm backlighting.',
      color: 'yellow',
      category: 'Personal',
      targetDate: '',
      priority: 'Low',
      notes: 'Review Corne keyboard PCB schematics and keycap profile comparison.',
      completed: false,
      createdAt: formatDateOffset(-20)
    },
    {
      id: 'fp-6',
      title: 'Key Architecture & Design Cheat-Sheet',
      description: '1. Keep all info accessible with minimal clicks\n2. Ambient glow transitions smoothly\n3. Zero nested navigation confusion\n4. Fast responsive grids',
      color: 'pink',
      category: 'Personal',
      targetDate: '',
      priority: 'Medium',
      notes: 'Core product mantra for high-focus engineering.',
      completed: false,
      createdAt: formatDateOffset(-25)
    }
  ],
  notificationsHistory: [
    {
      id: 'notif-demo-1',
      title: 'System Initialized',
      source: 'Ambient Productivity Engine',
      message: 'Welcome to your premium dark workspace. All systems synced locally.',
      time: new Date(now.getTime() - 15 * 60000).toISOString(),
      read: true
    }
  ]
};

// Storage Utilities
export function getSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(INITIAL_DATA));
    const parsed = JSON.parse(raw);
    // Ensure all critical top-level structures exist
    if (!parsed.tasks) parsed.tasks = [];
    if (!parsed.workspaces) parsed.workspaces = INITIAL_DATA.workspaces;
    if (!parsed.futurePlans) {
      parsed.futurePlans = [];
    } else {
      const palette = ['orange', 'blue', 'lavender', 'mint', 'pink', 'yellow'];
      parsed.futurePlans.forEach((p, idx) => {
        if (!p.color) p.color = palette[idx % palette.length];
      });
    }
    if (!parsed.settings) parsed.settings = INITIAL_DATA.settings;
    if (!parsed.notificationsHistory) parsed.notificationsHistory = [];
    if (!Array.isArray(parsed.clubs)) parsed.clubs = [];
    return parsed;
  } catch (err) {
    console.error('Failed to load state from localStorage', err);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function exportStateAsJSON(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ambient-productivity-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importStateFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.tasks && parsed.workspaces && parsed.futurePlans) {
      saveState(parsed);
      return { success: true, state: parsed };
    }
    return { success: false, error: 'Invalid backup file structure.' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function resetToDemoData() {
  saveState(INITIAL_DATA);
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

export function clearAllUserData() {
  const blankState = {
    activeSlide: 1,
    settings: { soundEnabled: true, browserNotifications: false, autoCarryForward: false },
    tasks: [],
    workspaces: INITIAL_DATA.workspaces.map(w => ({ ...w, entries: [] })),
    futurePlans: [],
    notificationsHistory: []
  };
  saveState(blankState);
  return blankState;
}

// Deadline and Metric Helpers
export function calculateNearestDeadline(entries) {
  if (!entries || entries.length === 0) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Find all dates from entries
  const validDates = [];
  entries.forEach(entry => {
    const dateVal = entry.deadline || entry.regDeadline || entry.targetDate || entry.eventDate;
    if (dateVal && dateVal >= todayStr) {
      validDates.push(dateVal);
    }
  });

  if (validDates.length === 0) {
    // If no future deadline, find the most recent past one
    const pastDates = entries.map(e => e.deadline || e.regDeadline || e.targetDate || e.eventDate).filter(Boolean);
    if (pastDates.length === 0) return null;
    pastDates.sort();
    return { date: pastDates[pastDates.length - 1], isPast: true };
  }

  validDates.sort();
  return { date: validDates[0], isPast: false };
}

export function formatDeadlineRelative(dateStr) {
  if (!dateStr) return 'No deadline set';
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today!';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
