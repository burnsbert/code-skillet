<script lang="ts">
  import { settingsStore, THEMES } from '../lib/stores/settings';

  $: settings = $settingsStore;
</script>

<div class="settings">
  <header class="settings-header">
    <h1>Settings</h1>
  </header>

  <div class="settings-content">
    <section class="settings-section">
      <h2>Appearance</h2>

      <div class="setting-group">
        <label class="setting-label">Theme</label>
        <div class="theme-grid">
          {#each THEMES as theme}
            <button
              class="theme-option"
              class:active={settings.theme === theme.id}
              on:click={() => settingsStore.setTheme(theme.id)}
            >
              <div class="theme-preview">
                {#each theme.preview as color, i}
                  <div
                    class="preview-color"
                    style="background-color: {color}; flex: {i === 2 ? 0.3 : 1}"
                  ></div>
                {/each}
              </div>
              <span class="theme-name">{theme.name}</span>
              <span class="theme-type">{theme.type}</span>
            </button>
          {/each}
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2>Terminal</h2>

      <div class="setting-group">
        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Show Terminal</label>
            <p class="setting-description">Display the terminal panel in the dashboard</p>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              checked={settings.terminalVisible}
              on:change={(e) => settingsStore.setTerminalVisible(e.currentTarget.checked)}
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="setting-group">
        <label class="setting-label">Terminal Height</label>
        <div class="slider-group">
          <input
            type="range"
            min="100"
            max="500"
            step="10"
            value={settings.terminalHeight}
            on:input={(e) => settingsStore.setTerminalHeight(parseInt(e.currentTarget.value))}
          />
          <span class="slider-value">{settings.terminalHeight}px</span>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2>Claude Code</h2>

      <div class="setting-group">
        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label text-warning">Dangerously Skip Permissions</label>
            <p class="setting-description">
              Skip permission prompts when running Claude Code sessions.
              <strong class="text-warning">Use with caution!</strong>
            </p>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              checked={settings.dangerouslySkipPermissions}
              on:change={(e) => settingsStore.setDangerouslySkipPermissions(e.currentTarget.checked)}
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .settings-header {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }

  .settings-header h1 {
    font-size: 20px;
    font-weight: 600;
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-lg);
    max-width: 900px;
  }

  .settings-section {
    margin-bottom: var(--space-xl);
  }

  .settings-section h2 {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: var(--space-md);
  }

  .setting-group {
    margin-bottom: var(--space-lg);
  }

  .setting-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .setting-info {
    flex: 1;
  }

  .setting-label {
    font-weight: 500;
    margin-bottom: var(--space-xs);
    display: block;
  }

  .setting-description {
    font-size: 13px;
    color: var(--text-muted);
  }

  /* Theme Grid */
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-md);
  }

  .theme-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm);
    border-radius: var(--border-radius);
    border: 2px solid transparent;
    transition: all 0.15s ease;
  }

  .theme-option:hover {
    background-color: var(--bg-hover);
  }

  .theme-option.active {
    border-color: var(--accent-primary);
    background-color: var(--bg-tertiary);
  }

  .theme-preview {
    width: 100%;
    height: 50px;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
  }

  .preview-color {
    height: 100%;
  }

  .theme-name {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .theme-type {
    font-size: 10px;
    color: var(--text-muted);
  }

  .theme-option.active .theme-name {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* Toggle */
  .toggle {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: var(--bg-tertiary);
    border-radius: 24px;
    transition: 0.2s;
  }

  .toggle-slider::before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: var(--text-muted);
    border-radius: 50%;
    transition: 0.2s;
  }

  .toggle input:checked + .toggle-slider {
    background-color: var(--accent-primary);
  }

  .toggle input:checked + .toggle-slider::before {
    transform: translateX(20px);
    background-color: white;
  }

  /* Slider */
  .slider-group {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .slider-group input[type='range'] {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--bg-tertiary);
    border-radius: 4px;
    padding: 0;
    border: none;
  }

  .slider-group input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
  }

  .slider-value {
    font-size: 13px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    min-width: 50px;
  }
</style>
