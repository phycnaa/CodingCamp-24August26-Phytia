/* =====================================================
   script.js — To-Do Life Dashboard
   ===================================================== */

/* ---------- Local Storage Keys ---------- */
const LS_TASKS     = 'dashboard_tasks';
const LS_LINKS     = 'dashboard_links';
const LS_NAME      = 'dashboard_name';
const LS_THEME     = 'dashboard_theme';
const LS_DURATION  = 'dashboard_pomodoro_duration';

/* =====================================================
   SECTION 1: GREETING, DATE & TIME
   ===================================================== */

/**
 * Returns the appropriate greeting string based on the current hour.
 */
function getGreetingByHour(hour) {
  if (hour >= 5 && hour < 12)  return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Formats a Date object into a readable date string.
 * e.g. "Friday, August 28, 2026"
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/**
 * Formats a Date object into a 12-hour time string with AM/PM.
 * e.g. "09:05 AM"
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Updates the greeting, date, and time displayed in the header.
 * Reads the saved name from Local Storage for a personalised greeting.
 */
function updateGreeting() {
  const now    = new Date();
  const hour   = now.getHours();
  const name   = localStorage.getItem(LS_NAME) || '';
  const base   = getGreetingByHour(hour);
  const label  = name.trim() ? `${base}, ${name.trim()}!` : `${base}!`;

  document.getElementById('greeting').textContent      = label;
  document.getElementById('date-display').textContent  = formatDate(now);
  document.getElementById('time-display').textContent  = formatTime(now);
}

/* =====================================================
   SECTION 2: THEME (Challenge 1)
   ===================================================== */

/**
 * Applies the given theme ('light' or 'dark') to the page
 * and updates the toggle button emoji.
 */
function applyTheme(theme) {
  document.body.classList.toggle('dark',  theme === 'dark');
  document.body.classList.toggle('light', theme === 'light');
  document.getElementById('theme-toggle-btn').textContent = theme === 'dark' ? '☀️' : '🌙';
}

/**
 * Loads the saved theme from Local Storage (defaults to 'light').
 */
function loadTheme() {
  const saved = localStorage.getItem(LS_THEME) || 'light';
  applyTheme(saved);
}

/**
 * Toggles between light and dark mode and persists the choice.
 */
function toggleTheme() {
  const isDark = document.body.classList.contains('dark');
  const next   = isDark ? 'light' : 'dark';
  localStorage.setItem(LS_THEME, next);
  applyTheme(next);
}

/* =====================================================
   SECTION 3: CUSTOM NAME (Challenge 2)
   ===================================================== */

/**
 * Loads the saved name into the input field.
 */
function loadName() {
  const saved = localStorage.getItem(LS_NAME) || '';
  document.getElementById('name-input').value = saved;
}

/**
 * Saves the name entered by the user and refreshes the greeting.
 */
function saveName() {
  const value = document.getElementById('name-input').value.trim();
  localStorage.setItem(LS_NAME, value);
  updateGreeting();
}

/* =====================================================
   SECTION 4: POMODORO TIMER (+ Challenge 3)
   ===================================================== */

let timerInterval   = null;   // holds the setInterval reference
let remainingSeconds = 0;     // seconds left on the clock
let timerRunning    = false;

/**
 * Pads a number to two digits (e.g. 5 → "05").
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Renders the current remaining time on the display.
 */
function renderTimer() {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  document.getElementById('timer-minutes').textContent = pad(mins);
  document.getElementById('timer-seconds').textContent = pad(secs);
}

/**
 * Returns the currently selected Pomodoro duration in minutes.
 */
function getSelectedDuration() {
  return parseInt(document.getElementById('duration-select').value, 10);
}

/**
 * Loads the saved Pomodoro duration from Local Storage and
 * sets the select element accordingly.
 */
function loadDuration() {
  const saved = localStorage.getItem(LS_DURATION);
  if (saved) {
    const select = document.getElementById('duration-select');
    // Only set if the option actually exists in the list
    if ([...select.options].some(o => o.value === saved)) {
      select.value = saved;
    }
  }
  remainingSeconds = getSelectedDuration() * 60;
  renderTimer();
}

/**
 * Starts the countdown. Prevents multiple intervals from stacking.
 */
function startTimer() {
  if (timerRunning) return; // already running — do nothing

  timerRunning = true;

  timerInterval = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      renderTimer();
      // Notify the user when the session ends
      notifyTimerDone();
      return;
    }
    remainingSeconds -= 1;
    renderTimer();
  }, 1000);
}

/**
 * Pauses the countdown without resetting the remaining time.
 */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
}

/**
 * Stops and resets the timer to the currently selected duration.
 */
function resetTimer() {
  stopTimer();
  remainingSeconds = getSelectedDuration() * 60;
  renderTimer();
}

/**
 * Fired when the user changes the duration selector.
 * Saves the selection and resets the timer.
 */
function onDurationChange() {
  const val = document.getElementById('duration-select').value;
  localStorage.setItem(LS_DURATION, val);
  resetTimer();
}

/**
 * Shows a browser notification (or falls back to alert) when the
 * focus session completes.
 */
function notifyTimerDone() {
  const msg = '⏰ Focus session complete! Time for a break.';

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Life Dashboard', { body: msg });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('Life Dashboard', { body: msg });
      } else {
        alert(msg);
      }
    });
  } else {
    alert(msg);
  }
}

/* =====================================================
   SECTION 5: TO-DO LIST
   ===================================================== */

let tasks = []; // array of { id, text, completed }

/**
 * Generates a simple unique ID for a task.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Persists the current tasks array to Local Storage.
 */
function saveTasks() {
  localStorage.setItem(LS_TASKS, JSON.stringify(tasks));
}

/**
 * Loads tasks from Local Storage into the tasks array.
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(LS_TASKS);
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    tasks = [];
  }
}

/**
 * Re-renders the entire task list from the tasks array.
 */
function renderTasks() {
  const list     = document.getElementById('task-list');
  const emptyMsg = document.getElementById('todo-empty');
  list.innerHTML = '';

  if (tasks.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as complete`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // Text label
    const span = document.createElement('span');
    span.className   = 'task-text';
    span.textContent = task.text;

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className   = 'btn btn-edit';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
    editBtn.addEventListener('click', () => openEditModal(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className   = 'btn btn-danger';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, deleteBtn);
    li.append(checkbox, span, actions);
    list.appendChild(li);
  });
}

/**
 * Adds a new task from the input field.
 * Validates for empty input and prevents exact duplicates.
 */
function addTask() {
  const input = document.getElementById('task-input');
  const text  = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  // Prevent duplicate task text (case-insensitive)
  const duplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    alert('A task with that name already exists.');
    return;
  }

  tasks.push({ id: generateId(), text, completed: false });
  saveTasks();
  renderTasks();
  input.value = '';
  input.focus();
}

/**
 * Toggles the completed state of a task by its ID.
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

/**
 * Deletes a task by its ID.
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/* --- Edit Modal --- */

let editingTaskId = null;

/**
 * Opens the edit modal pre-filled with the task's current text.
 */
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  document.getElementById('edit-task-input').value = task.text;
  document.getElementById('edit-modal').removeAttribute('hidden');
  document.getElementById('edit-task-input').focus();
}

/**
 * Closes the edit modal and clears state.
 */
function closeEditModal() {
  document.getElementById('edit-modal').setAttribute('hidden', '');
  editingTaskId = null;
}

/**
 * Saves the edited task text.
 */
function saveEditedTask() {
  const newText = document.getElementById('edit-task-input').value.trim();

  if (!newText) return;

  // Prevent duplicate with a different task
  const duplicate = tasks.some(
    t => t.id !== editingTaskId && t.text.toLowerCase() === newText.toLowerCase()
  );
  if (duplicate) {
    alert('A task with that name already exists.');
    return;
  }

  const task = tasks.find(t => t.id === editingTaskId);
  if (task) {
    task.text = newText;
    saveTasks();
    renderTasks();
  }
  closeEditModal();
}

/* =====================================================
   SECTION 6: QUICK LINKS
   ===================================================== */

let links = []; // array of { id, label, url }

/**
 * Persists the current links array to Local Storage.
 */
function saveLinks() {
  localStorage.setItem(LS_LINKS, JSON.stringify(links));
}

/**
 * Loads links from Local Storage into the links array.
 */
function loadLinks() {
  try {
    const raw = localStorage.getItem(LS_LINKS);
    links = raw ? JSON.parse(raw) : [];
  } catch {
    links = [];
  }
}

/**
 * Validates and normalises a URL string.
 * Returns the normalised URL or null if invalid.
 */
function normaliseUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Accept URLs that start with http:// or https://
  // Auto-prepend https:// if the user forgot the protocol
  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols for safety
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Re-renders the entire quick-links list from the links array.
 */
function renderLinks() {
  const list     = document.getElementById('link-list');
  const emptyMsg = document.getElementById('links-empty');
  list.innerHTML = '';

  if (links.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  links.forEach(link => {
    const li = document.createElement('li');
    li.className = 'link-item';
    li.dataset.id = link.id;

    // Open button — acts as a visible labelled link
    const openBtn = document.createElement('button');
    openBtn.className   = 'link-open-btn';
    openBtn.textContent = link.label || link.url;
    openBtn.title       = link.url;
    openBtn.setAttribute('aria-label', `Open ${link.label || link.url} in a new tab`);
    openBtn.addEventListener('click', () => {
      // Safe: URL was validated when saved; open in new tab with noopener
      window.open(link.url, '_blank', 'noopener,noreferrer');
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className   = 'btn btn-danger';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
    deleteBtn.addEventListener('click', () => deleteLink(link.id));

    li.append(openBtn, deleteBtn);
    list.appendChild(li);
  });
}

/**
 * Adds a new quick link from the label + URL inputs.
 * Validates inputs and prevents duplicates.
 */
function addLink() {
  const labelInput = document.getElementById('link-label-input');
  const urlInput   = document.getElementById('link-url-input');

  const label = labelInput.value.trim();
  const url   = normaliseUrl(urlInput.value);

  if (!url) {
    alert('Please enter a valid URL (e.g. https://example.com).');
    urlInput.focus();
    return;
  }

  if (!label) {
    alert('Please enter a label for the link.');
    labelInput.focus();
    return;
  }

  // Prevent duplicate URLs
  const duplicate = links.some(l => l.url === url);
  if (duplicate) {
    alert('That URL is already in your quick links.');
    return;
  }

  links.push({ id: generateId(), label, url });
  saveLinks();
  renderLinks();
  labelInput.value = '';
  urlInput.value   = '';
  labelInput.focus();
}

/**
 * Deletes a quick link by its ID.
 */
function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

/* =====================================================
   SECTION 7: EVENT LISTENERS
   ===================================================== */

function attachEventListeners() {
  /* Theme toggle */
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

  /* Save name */
  document.getElementById('save-name-btn').addEventListener('click', saveName);
  document.getElementById('name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveName();
  });

  /* Timer controls */
  document.getElementById('start-timer-btn').addEventListener('click', startTimer);
  document.getElementById('stop-timer-btn').addEventListener('click', stopTimer);
  document.getElementById('reset-timer-btn').addEventListener('click', resetTimer);
  document.getElementById('duration-select').addEventListener('change', onDurationChange);

  /* Add task */
  document.getElementById('add-task-btn').addEventListener('click', addTask);
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  /* Edit modal */
  document.getElementById('save-edit-btn').addEventListener('click', saveEditedTask);
  document.getElementById('cancel-edit-btn').addEventListener('click', closeEditModal);
  document.getElementById('edit-task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter')  saveEditedTask();
    if (e.key === 'Escape') closeEditModal();
  });
  // Close modal when clicking the backdrop
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  /* Add quick link */
  document.getElementById('add-link-btn').addEventListener('click', addLink);
  document.getElementById('link-url-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addLink();
  });
}

/* =====================================================
   SECTION 8: INITIALISATION
   ===================================================== */

/**
 * Bootstraps the dashboard:
 * 1. Load and apply saved preferences from Local Storage.
 * 2. Render all dynamic content.
 * 3. Attach all event listeners.
 * 4. Start the live clock.
 */
function init() {
  loadTheme();
  loadName();
  loadDuration();
  loadTasks();
  loadLinks();

  updateGreeting();
  renderTasks();
  renderLinks();

  attachEventListeners();

  // Update the clock and greeting every second
  setInterval(updateGreeting, 1000);
}

// Run once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', init);
