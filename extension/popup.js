/**
 * FILL Chrome Extension Popup Controller
 * Connects UI with Content Script, Local Storage / FILL Vault & FILL Memory
 */

import {
  DEFAULT_EXTENSION_VAULT,
  DEFAULT_EXTENSION_MEMORY,
  matchDetectedFields,
  getVaultValue,
} from './shared/matcher.js';

// DOM Elements
const stateReady = document.getElementById('state-ready');
const stateScanning = document.getElementById('state-scanning');
const stateResults = document.getElementById('state-results');
const stateSuccess = document.getElementById('state-success');
const stateEmpty = document.getElementById('state-empty');

const btnScanPage = document.getElementById('btn-scan-page');
const btnRescan = document.getElementById('btn-rescan');
const btnFillNow = document.getElementById('btn-fill-now');
const btnReviewToggle = document.getElementById('btn-review-toggle');
const btnDone = document.getElementById('btn-done');
const btnEmptyRetry = document.getElementById('btn-empty-retry');

const fieldsCountBadge = document.getElementById('fields-count-badge');
const memoryCountBadge = document.getElementById('memory-count-badge');
const fieldsList = document.getElementById('fields-list');
const unreviewedCountEl = document.getElementById('unreviewed-count');

const remapModal = document.getElementById('remap-modal');
const modalFieldLabel = document.getElementById('modal-field-label');
const selectVaultField = document.getElementById('select-vault-field');
const checkRememberMapping = document.getElementById('check-remember-mapping');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelRemap = document.getElementById('btn-cancel-remap');
const btnSaveRemap = document.getElementById('btn-save-remap');

const memoryLearnedAlert = document.getElementById('memory-learned-alert');
const memoryLearnedText = document.getElementById('memory-learned-text');
const successSummaryText = document.getElementById('success-summary-text');

// State
let currentVault = DEFAULT_EXTENSION_VAULT;
let currentMemory = DEFAULT_EXTENSION_MEMORY;
let detectedFields = [];
let matchedFields = [];
let fieldBeingRemapped = null;

// Initialize on popup load
document.addEventListener('DOMContentLoaded', async () => {
  await loadVaultAndMemory();
  setupEventListeners();
});

async function loadVaultAndMemory() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get(['fill_vault', 'fill_memory']);
      if (data.fill_vault) {
        currentVault = data.fill_vault;
      } else {
        // Seed default sample vault
        await chrome.storage.local.set({ fill_vault: DEFAULT_EXTENSION_VAULT });
      }

      if (data.fill_memory) {
        currentMemory = data.fill_memory;
      } else {
        // Seed default memory
        await chrome.storage.local.set({ fill_memory: DEFAULT_EXTENSION_MEMORY });
      }
    }
  } catch (err) {
    console.warn('Storage read notice (falling back to memory):', err);
  }
}

function setupEventListeners() {
  btnScanPage?.addEventListener('click', () => performScan());
  btnRescan?.addEventListener('click', () => performScan());
  btnEmptyRetry?.addEventListener('click', () => performScan());

  btnFillNow?.addEventListener('click', () => performFill());
  btnDone?.addEventListener('click', () => {
    switchState('ready');
  });

  btnReviewToggle?.addEventListener('click', () => {
    // Approve all remaining high/medium fields
    matchedFields.forEach((f) => {
      if (f.status !== 'unsupported' && f.vaultKey) {
        f.approved = true;
      }
    });
    renderFieldsList();
  });

  // Modal controls
  btnCloseModal?.addEventListener('click', closeModal);
  btnCancelRemap?.addEventListener('click', closeModal);
  btnSaveRemap?.addEventListener('click', saveRemappedField);
}

function switchState(stateName) {
  stateReady?.classList.add('hidden');
  stateScanning?.classList.add('hidden');
  stateResults?.classList.add('hidden');
  stateSuccess?.classList.add('hidden');
  stateEmpty?.classList.add('hidden');

  if (stateName === 'ready') stateReady?.classList.remove('hidden');
  if (stateName === 'scanning') stateScanning?.classList.remove('hidden');
  if (stateName === 'results') stateResults?.classList.remove('hidden');
  if (stateName === 'success') stateSuccess?.classList.remove('hidden');
  if (stateName === 'empty') stateEmpty?.classList.remove('hidden');
}

/**
 * Executes field scan in the active Chrome tab
 */
async function performScan() {
  switchState('scanning');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showEmptyState('Could not access current tab', 'Please try opening a regular webpage.');
      return;
    }

    // Ping / inject content script if needed
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'SCAN_FIELDS' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          // Attempt scripting injection if content script was not already present
          injectAndScan(tab.id);
        } else {
          handleScanResponse(response.fields);
        }
      });
    } catch {
      injectAndScan(tab.id);
    }
  } catch (err) {
    console.error('Scan error:', err);
    showEmptyState('Scan encountered an error', err.message || 'Please refresh the tab and try again.');
  }
}

async function injectAndScan(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });

    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: 'SCAN_FIELDS' }, (response) => {
        if (response && response.fields) {
          handleScanResponse(response.fields);
        } else {
          showEmptyState('No supported form fields found', 'This page does not contain standard form inputs.');
        }
      });
    }, 150);
  } catch (err) {
    showEmptyState('Extension access notice', 'Chrome extensions cannot scan internal browser pages. Please open a regular web form.');
  }
}

function handleScanResponse(fields) {
  if (!fields || fields.length === 0) {
    showEmptyState('No supported form fields found', 'Navigate to a page with application form inputs and scan again.');
    return;
  }

  detectedFields = fields;
  matchedFields = matchDetectedFields(fields, currentVault, currentMemory);

  const memoryApplied = matchedFields.some((f) => f.isRemembered);
  if (memoryCountBadge) {
    if (memoryApplied) {
      memoryCountBadge.classList.remove('hidden');
    } else {
      memoryCountBadge.classList.add('hidden');
    }
  }

  if (fieldsCountBadge) {
    fieldsCountBadge.textContent = `${matchedFields.length} fields found`;
  }

  renderFieldsList();
  switchState('results');
}

function showEmptyState(title, desc) {
  const emptyTitle = document.getElementById('empty-title');
  const emptyDesc = document.getElementById('empty-desc');
  if (emptyTitle) emptyTitle.textContent = title;
  if (emptyDesc) emptyDesc.textContent = desc;
  switchState('empty');
}

/**
 * Renders the compact list of fields matching Section 5 design
 */
function renderFieldsList() {
  if (!fieldsList) return;
  fieldsList.innerHTML = '';

  let unapprovedCount = 0;

  matchedFields.forEach((field, index) => {
    const card = document.createElement('div');
    card.className = `field-item ${!field.approved && field.status !== 'unsupported' ? 'unapproved' : ''} ${field.status === 'unsupported' ? 'unsupported' : ''}`;

    let iconHtml = '<span class="field-icon-check">✓</span>';
    let confClass = 'conf-high';

    if (field.status === 'unsupported') {
      iconHtml = '<span style="color: var(--slate-400)">⊘</span>';
      confClass = 'conf-low';
    } else if (!field.approved || field.confidence === 'Medium') {
      iconHtml = '<span class="field-icon-warn">?</span>';
      confClass = 'conf-med';
      unapprovedCount++;
    } else if (field.confidence === 'Low') {
      iconHtml = '<span class="field-icon-warn">?</span>';
      confClass = 'conf-low';
      unapprovedCount++;
    }

    const valueDisplay = field.value ? field.value : '(No Vault Value)';
    const titleDisplay = field.vaultTitle || field.label || 'Unassigned';

    card.innerHTML = `
      <div class="field-info">
        <div class="field-meta-row">
          ${iconHtml}
          <span class="field-title">${titleDisplay}</span>
          ${field.isRemembered ? '<span style="font-size:0.6rem; color:var(--indigo-600); font-weight:700;">🧠 Memory</span>' : ''}
        </div>
        <div class="field-original-label">Page field: "${field.label || field.name || 'Input'}"</div>
        <div class="field-value">${field.status === 'unsupported' ? 'Sensitive field not supported' : valueDisplay}</div>
        <div class="field-confidence ${confClass}">
          <span>${field.confidence} confidence</span>
          <span>&bull;</span>
          <span style="color: var(--slate-500); font-weight: 500;">${field.reason}</span>
        </div>
      </div>
      <div class="field-actions">
        ${
          field.status !== 'unsupported'
            ? `
          ${!field.approved ? `<button class="btn-mini btn-mini-approve" data-approve="${index}">Approve</button>` : ''}
          <button class="btn-mini" data-remap="${index}">Change</button>
        `
            : ''
        }
      </div>
    `;

    fieldsList.appendChild(card);
  });

  if (unreviewedCountEl) {
    unreviewedCountEl.textContent = String(unapprovedCount);
  }

  // Bind item button actions
  fieldsList.querySelectorAll('[data-approve]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-approve'), 10);
      matchedFields[idx].approved = true;
      renderFieldsList();
    });
  });

  fieldsList.querySelectorAll('[data-remap]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-remap'), 10);
      openRemapModal(matchedFields[idx]);
    });
  });
}

/**
 * Fills approved fields into the webpage
 */
async function performFill() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  const toFill = matchedFields.filter((f) => f.approved && f.value && f.status !== 'unsupported');

  if (toFill.length === 0) {
    alert('Please approve at least one field to fill.');
    return;
  }

  chrome.tabs.sendMessage(
    tab.id,
    {
      action: 'FILL_FIELDS',
      mappings: toFill.map((f) => ({
        id: f.id,
        label: f.label,
        value: f.value,
        type: f.type,
        tagName: f.tagName,
      })),
    },
    (res) => {
      const filledCount = res?.filledCount || toFill.length;
      if (successSummaryText) {
        successSummaryText.textContent = `Successfully populated ${filledCount} field${filledCount > 1 ? 's' : ''} on this form with synthetic input events.`;
      }
      switchState('success');
    }
  );
}

/**
 * Opens Remap modal to change match and optionally remember via FILL Memory
 */
function openRemapModal(field) {
  fieldBeingRemapped = field;
  if (modalFieldLabel) {
    modalFieldLabel.textContent = `Remapping "${field.label || field.name}"`;
  }
  if (selectVaultField && field.vaultKey) {
    selectVaultField.value = field.vaultKey;
  }
  remapModal?.classList.remove('hidden');
}

function closeModal() {
  remapModal?.classList.add('hidden');
  fieldBeingRemapped = null;
}

async function saveRemappedField() {
  if (!fieldBeingRemapped || !selectVaultField) return;

  const chosenKey = selectVaultField.value;
  const chosenOpt = selectVaultField.options[selectVaultField.selectedIndex];
  const chosenTitle = chosenOpt ? chosenOpt.text : chosenKey;
  const newValue = getVaultValue(currentVault, chosenKey);
  const shouldRemember = checkRememberMapping?.checked;

  fieldBeingRemapped.vaultKey = chosenKey;
  fieldBeingRemapped.vaultTitle = chosenTitle;
  fieldBeingRemapped.value = newValue;
  fieldBeingRemapped.confidence = 'High';
  fieldBeingRemapped.confidenceScore = 100;
  fieldBeingRemapped.approved = true;
  fieldBeingRemapped.reason = `Explicitly chosen by user as ${chosenTitle}.`;

  if (shouldRemember) {
    // Add to FILL Memory
    const newMemoryItem = {
      phrase: fieldBeingRemapped.label || fieldBeingRemapped.name,
      vaultKey: chosenKey,
      vaultTitle: chosenTitle,
      confirmedAt: Date.now(),
    };

    currentMemory = [newMemoryItem, ...currentMemory.filter((m) => m.phrase !== newMemoryItem.phrase)];

    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ fill_memory: currentMemory });
      }
    } catch (err) {
      console.warn('Memory save notice:', err);
    }

    if (memoryLearnedAlert && memoryLearnedText) {
      memoryLearnedText.textContent = `Learned: "${newMemoryItem.phrase}" → ${chosenTitle}. Future forms will remember this!`;
      memoryLearnedAlert.classList.remove('hidden');
    }
  }

  closeModal();
  renderFieldsList();
}
