'use strict';
const $ = (selector) => document.querySelector(selector);
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
};
const clock = () => {
  const now = new Date();
  $('#clock').textContent = now.toLocaleTimeString('en-GB', { hour12: false });
  $('#today').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
};
clock(); setInterval(clock, 1000);
$('#year').textContent = new Date().getFullYear();
document.documentElement.dataset.theme = store.get('mm-theme', 'purple');
$('#theme-btn').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'green' ? 'purple' : 'green';
  document.documentElement.dataset.theme = next;
  store.set('mm-theme', next);
});
// Terminal is a simulated interface and intentionally cannot access your operating system.
function printLine(message, cls = '') {
  const p = document.createElement('p');
  p.textContent = message;
  if (cls) p.className = cls;
  $('#terminal-output').append(p);
  $('#terminal-output').scrollTop = $('#terminal-output').scrollHeight;
}
const commands = {
  help: () => 'Commands: help, about, date, status, clear, roll, motivate',
  about: () => 'Micro Menace: browser-based experiment lab. No system commands executed.',
  date: () => new Date().toString(),
  status: () => 'Frontend online · Notes local · Terminal simulated · Sandbox isolated',
  roll: () => 'Random number: ' + (Math.floor(Math.random() * 100) + 1),
  motivate: () => ['Small experiments beat endless planning.', 'Make it work. Then make it weird.', 'Your next great idea starts with one file.', 'A tiny PC can still cause creative chaos.'][Math.floor(Math.random() * 4)]
};
$('#terminal-form').addEventListener('submit', e => {
  e.preventDefault();
  const raw = $('#terminal-command').value.trim();
  $('#terminal-command').value = '';
  if (!raw) return;
  printLine('guest@micro-menace:~$ ' + raw, 'cmd');
  const [name] = raw.toLowerCase().split(/\s+/);
  if (name === 'clear') { $('#terminal-output').replaceChildren(); return; }
  printLine(commands[name] ? commands[name]() : 'Unknown simulation command. Type "help".', commands[name] ? '' : 'error');
});
// Simple task list, saved in this browser only.
let tasks = store.get('mm-tasks', []);
if (!Array.isArray(tasks)) tasks = [];
tasks = tasks.filter(t => t && typeof t.text === 'string').slice(0, 100);
function renderTasks() {
  const list = $('#task-list'); list.replaceChildren();
  for (const item of tasks) {
    const li = document.createElement('li');
    if (item.done) li.classList.add('done');
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = !!item.done;
    check.setAttribute('aria-label', 'Mark task completed');
    check.addEventListener('change', () => { item.done = check.checked; saveTasks(); });
    const span = document.createElement('span'); span.className = 'task-text'; span.textContent = item.text;
    const del = document.createElement('button'); del.type = 'button'; del.textContent = '✕'; del.setAttribute('aria-label', 'Delete task');
    del.addEventListener('click', () => { tasks = tasks.filter(x => x !== item); saveTasks(); });
    li.append(check, span, del); list.append(li);
  }
  $('#task-count').textContent = tasks.filter(t => !t.done).length;
  $('#tasks-empty').hidden = tasks.length > 0;
}
function saveTasks() { store.set('mm-tasks', tasks); renderTasks(); }
$('#task-form').addEventListener('submit', e => {
  e.preventDefault();
  const text = $('#task-input').value.trim();
  if (!text || tasks.length >= 100) return;
  tasks.push({ text, done: false }); $('#task-input').value = ''; saveTasks();
});
renderTasks();
// Countdown timer.
let seconds = 25 * 60, running = false, lastTick = Date.now();
function showTimer() {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  $('#timer').textContent = `${mm}:${ss}`; $('#focus-label').textContent = `${mm}:${ss}`;
  document.title = running ? `${mm}:${ss} • Micro Menace` : 'Micro Menace // Command Centre';
}
$('#timer-start').addEventListener('click', () => { running = true; lastTick = Date.now(); showTimer(); });
$('#timer-pause').addEventListener('click', () => { running = false; showTimer(); });
$('#timer-reset').addEventListener('click', () => { running = false; seconds = 25 * 60; showTimer(); });
setInterval(() => {
  if (!running) return;
  const now = Date.now();
  const elapsed = Math.floor((now - lastTick) / 1000);
  if (elapsed > 0) { seconds = Math.max(0, seconds - elapsed); lastTick += elapsed * 1000; showTimer(); }
  if (seconds === 0) { running = false; printLine('Focus mission complete! ⚡'); showTimer(); }
}, 250);
showTimer();
// Random ideas.
const ideas = [
  'Create a fake spaceship control panel using HTML and CSS.',
  'Make a web app that flips a coin with ridiculous animations.',
  'Build a personal budget calculator in vanilla JavaScript.',
  'Create a browser-based typing-speed game.',
  'Write a Python tool that finds duplicate photos without deleting them.',
  'Design five futuristic app icons.',
  'Create a quiz that teaches basic Linux commands.',
  'Build a colour palette generator with copy buttons.',
  'Turn your daily to-do list into a level-up game.',
  'Make a privacy-first offline notes page.'
];
$('#quest-btn').addEventListener('click', () => {
  $('#quest').textContent = ideas[Math.floor(Math.random() * ideas.length)];
});
// User-supplied JavaScript runs in a different-origin iframe with no allow-same-origin or network intent.
// This is an educational sandbox, not a hardened security boundary for malicious code.
const frame = $('#sandbox');
const token = 'mm-' + Math.random().toString(36).slice(2);
let pending = false;
function appendCodeOutput(value) {
  const output = $('#code-output');
  output.textContent = output.textContent === 'Running...' ? value : (output.textContent + '\n' + value);
}
window.addEventListener('message', (event) => {
  if (event.source !== frame.contentWindow || !event.data || event.data.token !== token || !pending) return;
  if (!['log', 'error', 'done'].includes(event.data.type)) return;
  if (event.data.type === 'done') { pending = false; return; }
  appendCodeOutput((event.data.type === 'error' ? 'ERROR: ' : '') + String(event.data.message).slice(0, 3000));
});
$('#run-code').addEventListener('click', () => {
  const code = $('#code-input').value.slice(0, 12000);
  $('#code-output').textContent = 'Running...'; pending = true;
  const payload = JSON.stringify({ token, code }).replace(/</g, '\\u003c');
  frame.srcdoc = `<!doctype html><html><body><script>
    const payload = ${payload};
    const send = (type, message) => parent.postMessage({token:payload.token,type,message}, '*');
    console.log = (...values) => send('log', values.map(x=>typeof x==='object' ? JSON.stringify(x) : String(x)).join(' '));
    console.error = (...values) => send('error', values.map(String).join(' '));
    try { (new Function(payload.code))(); } catch(e) { send('error', String(e)); }
    send('done','');
  <\/script></body></html>`;
});
$('#clear-code').addEventListener('click', () => { pending = false; frame.srcdoc = ''; $('#code-output').textContent = 'Experiment output will appear here.'; });
