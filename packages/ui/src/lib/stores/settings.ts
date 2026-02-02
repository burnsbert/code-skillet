import { writable, get } from 'svelte/store';

export type Theme = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '14' | '15' | '16' | '17';

export interface ThemeInfo {
  id: Theme;
  name: string;
  type: 'Dark' | 'Light';
  preview: [string, string, string]; // [bg, surface, accent]
}

export const THEMES: ThemeInfo[] = [
  { id: '6', name: 'Let It Cook', type: 'Dark', preview: ['#1c1917', '#292524', '#f97316'] },
  { id: '4', name: 'Amethyst Dusk', type: 'Dark', preview: ['#1a1625', '#2d2640', '#a78bfa'] },
  { id: '2', name: 'Blockland', type: 'Dark', preview: ['#5a4a3a', '#4a5d32', '#7cb342'] },
  { id: '15', name: 'Blueprint', type: 'Dark', preview: ['#1a3a5c', '#1e4268', '#7ec8e3'] },
  { id: '1', name: 'Blue Notes', type: 'Dark', preview: ['#1a1a2e', '#16213e', '#ea580c'] },
  { id: '7', name: 'Classic Console', type: 'Dark', preview: ['#1a1a24', '#2d2d3d', '#9d8cd6'] },
  { id: '16', name: 'Coffee Shop', type: 'Light', preview: ['#f5f0e6', '#ebe4d6', '#8b5a2b'] },
  { id: '8', name: 'Crystal Fog', type: 'Light', preview: ['#c4d0dc', '#d8e2ef', '#4a6fa5'] },
  { id: '9', name: 'Family Console', type: 'Light', preview: ['#a8a8b8', '#c8c8d4', '#6b5b95'] },
  { id: '10', name: 'Snowy Night', type: 'Dark', preview: ['#0a0c10', '#12151a', '#a8d4ff'] },
  { id: '17', name: 'Stone Tablet', type: 'Light', preview: ['#c8ced6', '#d8dee6', '#5c6b7a'] },
  { id: '3', name: 'Talking Car', type: 'Dark', preview: ['#0a0a0a', '#1a1a1a', '#ff1a1a'] },
  { id: '11', name: 'Two Portals', type: 'Dark', preview: ['#0d0d0d', '#1a1a1a', '#ff6b00'] },
  { id: '5', name: 'Warm Sand', type: 'Light', preview: ['#c9c0b0', '#ddd6c6', '#c2410c'] },
  { id: '12', name: 'Wasteland', type: 'Dark', preview: ['#0a0a0a', '#0d1a0d', '#14ff00'] },
  { id: '14', name: 'Whiteboard Post-Its', type: 'Light', preview: ['#e8e8e8', '#f5f5f5', '#e53935'] },
];

export interface Settings {
  theme: Theme;
  terminalVisible: boolean;
  terminalHeight: number;
  promptForPermissions: boolean;
  dangerouslySkipPermissions: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: '6',
  terminalVisible: true,
  terminalHeight: 200,
  promptForPermissions: false,
  dangerouslySkipPermissions: true,
};

const STORAGE_KEY = 'code-skillet-settings';

function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old theme names to new numeric IDs
      if (parsed.theme && typeof parsed.theme === 'string' && !parsed.theme.match(/^\d+$/)) {
        parsed.theme = '6'; // Default to Ember Glow
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function createSettingsStore() {
  const settings = writable<Settings>(loadSettings());

  // Apply theme on initial load
  if (typeof window !== 'undefined') {
    const initial = loadSettings();
    applyTheme(initial.theme);
  }

  // Auto-save on changes
  settings.subscribe((value) => {
    saveSettings(value);
  });

  function setTheme(theme: Theme) {
    settings.update((s) => ({ ...s, theme }));
    applyTheme(theme);
  }

  function setTerminalVisible(visible: boolean) {
    settings.update((s) => ({ ...s, terminalVisible: visible }));
  }

  function setTerminalHeight(height: number) {
    const clamped = Math.max(100, Math.min(500, height));
    settings.update((s) => ({ ...s, terminalHeight: clamped }));
  }

  function setPromptForPermissions(value: boolean) {
    settings.update((s) => ({ ...s, promptForPermissions: value }));
  }

  function setDangerouslySkipPermissions(value: boolean) {
    settings.update((s) => ({ ...s, dangerouslySkipPermissions: value }));
  }

  return {
    subscribe: settings.subscribe,
    setTheme,
    setTerminalVisible,
    setTerminalHeight,
    setPromptForPermissions,
    setDangerouslySkipPermissions,
  };
}

export const settingsStore = createSettingsStore();
