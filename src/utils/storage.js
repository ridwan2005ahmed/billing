export const STORAGE_KEYS = {
  smsHistory: 'prepaid-meter-token-helper-history',
  theme: 'prepaid-meter-token-helper-theme',
  smsDraft: 'prepaid-meter-token-helper-sms-draft',
};

function readJson(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }

    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadHistory() {
  if (typeof window === 'undefined') {
    return [];
  }

  return readJson(STORAGE_KEYS.smsHistory, []);
}

export function saveHistory(entries) {
  if (typeof window === 'undefined') {
    return;
  }

  writeJson(STORAGE_KEYS.smsHistory, entries);
}

export function loadTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(STORAGE_KEYS.theme) || 'light';
}

export function saveTheme(theme) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function loadSmsDraft() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(STORAGE_KEYS.smsDraft) || '';
}

export function saveSmsDraft(value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.smsDraft, value);
}

export function clearSmsDraft() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.smsDraft);
}
