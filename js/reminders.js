// reminders.js - Ambient Notification, Alarm, Web Audio Synthesizer, and Scheduler Engine

class NotificationAudioEngine {
  constructor() {
    this.audioCtx = null;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a soft, elegant dual-tone chime (ambient bell)
  playAmbientChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 1.3);

      // Note 2: B5 (987.77 Hz) slightly delayed for rich resonance
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);

      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.14, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 1.7);
    } catch (e) {
      console.warn('Audio playback not allowed or failed:', e);
    }
  }
}

export const audioEngine = new NotificationAudioEngine();

// Calculate the exact target trigger timestamp (epoch ms) for a reminder config
export function computeReminderTriggerTime(item, type) {
  if (!item.reminder || !item.reminder.enabled) return null;

  const timing = item.reminder.timing || '1d';
  if (timing === 'custom' && item.reminder.customDate) {
    const customMs = new Date(item.reminder.customDate).getTime();
    return isNaN(customMs) ? null : customMs;
  }

  // Determine base target datetime
  let baseDateStr = '';
  let baseTimeStr = '09:00'; // Default morning hour for deadline-based reminders

  if (type === 'task') {
    baseDateStr = item.deadline || new Date().toISOString().split('T')[0];
    if (item.time) {
      baseTimeStr = item.time;
    }
  } else if (type === 'hackathon') {
    baseDateStr = item.regDeadline || item.eventDate;
  } else if (type === 'internship') {
    baseDateStr = item.deadline;
  } else if (type === 'project') {
    baseDateStr = item.deadline;
  } else if (type === 'learning') {
    baseDateStr = item.targetDate;
  } else if (type === 'futurePlan') {
    baseDateStr = item.targetDate;
  } else if (item.deadline) {
    baseDateStr = item.deadline;
  }

  if (!baseDateStr) return null;

  // Combine into full date
  const baseTarget = new Date(`${baseDateStr}T${baseTimeStr}:00`).getTime();
  if (isNaN(baseTarget)) return null;

  // Subtract offset according to timing option
  const offsets = {
    '1w': 7 * 24 * 3600 * 1000,
    '3d': 3 * 24 * 3600 * 1000,
    '1d': 1 * 24 * 3600 * 1000,
    '12h': 12 * 3600 * 1000,
    '1h': 1 * 3600 * 1000
  };

  const offsetMs = offsets[timing] || (24 * 3600 * 1000);
  return baseTarget - offsetMs;
}

export class ReminderManager {
  constructor(getState, onTriggerNotification) {
    this.getState = getState;
    this.onTriggerNotification = onTriggerNotification;
    this.snoozedUntil = {}; // { reminderId: timestampMs }
    this.triggeredIds = new Set(); // To prevent spamming same notification in one session
    this.timer = null;
  }

  start() {
    this.check();
    this.timer = setInterval(() => this.check(), 15000); // Check every 15 seconds
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  snooze(id, durationMinutes) {
    const until = Date.now() + durationMinutes * 60 * 1000;
    this.snoozedUntil[id] = until;
    this.triggeredIds.delete(id);
  }

  dismiss(id) {
    this.triggeredIds.add(id);
  }

  // Collect all items across all 3 sections
  getAllReminderItems() {
    const state = this.getState();
    const items = [];

    // 1. Daily Tasks
    (state.tasks || []).forEach(task => {
      if (!task.completed && task.reminder && task.reminder.enabled) {
        items.push({
          id: `task-${task.id}`,
          rawId: task.id,
          title: task.title,
          type: 'task',
          section: 'Daily To-Do',
          slideIndex: 1,
          timing: task.reminder.timing,
          triggerTime: computeReminderTriggerTime(task, 'task'),
          details: task.time ? `Scheduled for today at ${task.time}` : 'Due today',
          item: task
        });
      }
    });

    // 2. Workspaces
    (state.workspaces || []).forEach(ws => {
      (ws.entries || []).forEach(entry => {
        if (entry.reminder && entry.reminder.enabled) {
          let typeName = ws.id;
          let details = '';
          if (ws.id === 'hackathons') {
            details = `Registration deadline: ${entry.regDeadline || 'TBD'}`;
          } else if (ws.id === 'internships') {
            details = `${entry.company} • Deadline: ${entry.deadline || 'TBD'}`;
          } else if (ws.id === 'projects') {
            details = `Project deadline: ${entry.deadline || 'TBD'}`;
          } else if (ws.id === 'learning') {
            details = `Target completion: ${entry.targetDate || 'TBD'}`;
          } else {
            details = `Workspace: ${ws.name}`;
          }

          items.push({
            id: `ws-${ws.id}-${entry.id}`,
            rawId: entry.id,
            wsId: ws.id,
            title: entry.name || entry.title,
            type: ws.id,
            section: `Workspace: ${ws.name}`,
            slideIndex: 2,
            timing: entry.reminder.timing,
            triggerTime: computeReminderTriggerTime(entry, typeName),
            details: details,
            item: entry
          });
        }
      });
    });

    // 3. Future Plans
    (state.futurePlans || []).forEach(plan => {
      if (!plan.completed && plan.reminder && plan.reminder.enabled && plan.targetDate) {
        items.push({
          id: `plan-${plan.id}`,
          rawId: plan.id,
          title: plan.title,
          type: 'futurePlan',
          section: 'Future Planning',
          slideIndex: 3,
          timing: plan.reminder.timing,
          triggerTime: computeReminderTriggerTime(plan, 'futurePlan'),
          details: `Target date: ${plan.targetDate} (${plan.category})`,
          item: plan
        });
      }
    });

    return items;
  }

  check() {
    const now = Date.now();
    const items = this.getAllReminderItems();

    items.forEach(item => {
      if (!item.triggerTime) return;

      // Check snooze
      if (this.snoozedUntil[item.id] && now < this.snoozedUntil[item.id]) {
        return; // still snoozing
      }

      // Check if past or at trigger time, and within 3 days past (so overdue reminders fire once)
      const isDue = now >= item.triggerTime && (now - item.triggerTime) < (3 * 24 * 3600 * 1000);

      if (isDue && !this.triggeredIds.has(item.id)) {
        this.triggeredIds.add(item.id);
        if (this.onTriggerNotification) {
          this.onTriggerNotification(item);
        }
      }
    });
  }

  async requestBrowserPermission() {
    if (!('Notification' in window)) {
      return { supported: false, status: 'unsupported' };
    }
    if (Notification.permission === 'granted') {
      return { supported: true, status: 'granted' };
    }
    const result = await Notification.requestPermission();
    return { supported: true, status: result };
  }

  showBrowserNotification(item) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification(`Reminder: ${item.title}`, {
        body: `${item.section} • ${item.details}`,
        icon: '/favicon.ico',
        tag: item.id
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}
