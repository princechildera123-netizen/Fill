/**
 * FILL Chrome Extension Content Script
 * 
 * Safety & Privacy Mandate:
 * - Scans fields ONLY when requested by the popup (Scan Page).
 * - Never collects browsing history or tracks background page keystrokes.
 * - Detects visible labels, placeholders, aria attributes, name, and id.
 * - Flags sensitive fields (passwords, credit cards, bank data, SSNs) as UNSUPPORTED.
 * - Fills approved fields and fires standard synthetic events ('input', 'change').
 * - NEVER clicks "submit", "continue", or submits forms.
 */

(() => {
  // Sensitive field keywords to explicitly protect
  const SENSITIVE_KEYWORDS = [
    'password', 'passcode', 'secret', 'pin',
    'cvv', 'cvc', 'creditcard', 'credit_card', 'cc_number', 'card_number', 'cardnumber', 'exp_date',
    'bank', 'account_number', 'routing', 'iban', 'swift',
    'ssn', 'social_security', 'socialsecurity', 'national_id', 'tax_id',
    'security_question', 'mother_maiden'
  ];

  function isSensitiveField(element) {
    const type = (element.getAttribute('type') || '').toLowerCase();
    if (type === 'password') return true;

    const id = (element.id || '').toLowerCase();
    const name = (element.name || '').toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();
    const aria = (element.getAttribute('aria-label') || '').toLowerCase();
    const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();

    // Check against sensitive keywords
    for (const kw of SENSITIVE_KEYWORDS) {
      if (
        id.includes(kw) ||
        name.includes(kw) ||
        placeholder.includes(kw) ||
        aria.includes(kw) ||
        autocomplete.includes(kw)
      ) {
        return true;
      }
    }
    return false;
  }

  function getNearbyLabelText(element) {
    // 1. Explicit <label for="...">
    if (element.id) {
      const explicitLabel = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      if (explicitLabel && explicitLabel.textContent) {
        return cleanText(explicitLabel.textContent);
      }
    }

    // 2. Parent wrapping <label>
    const parentLabel = element.closest('label');
    if (parentLabel && parentLabel.textContent) {
      // Clone and remove inputs to get just label text
      const clone = parentLabel.cloneNode(true);
      const inputs = clone.querySelectorAll('input, select, textarea');
      inputs.forEach(inp => inp.remove());
      return cleanText(clone.textContent);
    }

    // 3. aria-label or aria-labelledby
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return cleanText(ariaLabel);

    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const el = document.getElementById(labelledBy);
      if (el && el.textContent) return cleanText(el.textContent);
    }

    // 4. Look for nearby preceding label or div in parent container
    const container = element.closest('.form-group, .form-row, .field, div, td, li, p');
    if (container) {
      const precedingLabel = container.querySelector('label, .label, .title, strong, b');
      if (precedingLabel && precedingLabel.textContent) {
        return cleanText(precedingLabel.textContent);
      }
    }

    // 5. Placeholder
    if (element.placeholder) {
      return cleanText(element.placeholder);
    }

    // 6. Name or id fallback
    return element.name || element.id || '';
  }

  function getNearbyContextText(element) {
    const section = element.closest('fieldset, form, section, .form-section, .card');
    if (section) {
      const legend = section.querySelector('legend, h1, h2, h3, h4, .section-title');
      if (legend && legend.textContent) {
        return cleanText(legend.textContent);
      }
    }
    return '';
  }

  function cleanText(str) {
    if (!str) return '';
    return str
      .replace(/[\n\r\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[*:]+$/, '')
      .trim();
  }

  /**
   * Scans document for input, select, textarea fields
   */
  function scanFormFields() {
    const candidates = Array.from(
      document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea')
    );

    const detectedFields = [];

    candidates.forEach((el, index) => {
      // Ignore hidden or zero-size elements
      if (el.offsetWidth === 0 && el.offsetHeight === 0 && !el.getClientRects().length) {
        return;
      }
      if (el.disabled || el.readOnly) {
        return;
      }

      // Generate or reuse unique element identifier
      let elId = el.getAttribute('data-fill-id');
      if (!elId) {
        elId = `fill_field_${index}_${Date.now()}`;
        el.setAttribute('data-fill-id', elId);
      }

      const tagName = el.tagName.toLowerCase();
      const type = (el.getAttribute('type') || (tagName === 'textarea' ? 'textarea' : 'text')).toLowerCase();
      const label = getNearbyLabelText(el);
      const context = getNearbyContextText(el);
      const sensitive = isSensitiveField(el);

      detectedFields.push({
        id: elId,
        tagName,
        type,
        label,
        name: el.name || '',
        placeholder: el.placeholder || '',
        autocomplete: el.getAttribute('autocomplete') || '',
        currentValue: el.value || '',
        context,
        isSensitive: sensitive
      });
    });

    return detectedFields;
  }

  /**
   * Safely populates fields with approved values
   */
  function fillApprovedFields(fieldMappings) {
    let filledCount = 0;
    const errors = [];

    fieldMappings.forEach(mapping => {
      const el = document.querySelector(`[data-fill-id="${mapping.id}"]`);
      if (!el) {
        errors.push(`Field not found: ${mapping.label}`);
        return;
      }

      const valueToFill = mapping.value || '';
      if (!valueToFill && valueToFill !== 0) {
        return;
      }

      try {
        const tagName = el.tagName.toLowerCase();
        const type = (el.getAttribute('type') || '').toLowerCase();

        if (tagName === 'select') {
          // Select matching option by text or value
          let matchedOption = false;
          for (let i = 0; i < el.options.length; i++) {
            const opt = el.options[i];
            const optText = opt.text.trim().toLowerCase();
            const optVal = opt.value.trim().toLowerCase();
            const searchVal = String(valueToFill).trim().toLowerCase();

            if (optText === searchVal || optVal === searchVal || optText.includes(searchVal)) {
              el.selectedIndex = i;
              matchedOption = true;
              break;
            }
          }
          if (!matchedOption && el.options.length > 0) {
            el.value = String(valueToFill);
          }
        } else if (type === 'checkbox') {
          const shouldCheck = Boolean(
            valueToFill === true ||
            valueToFill === 'true' ||
            valueToFill === 'yes' ||
            valueToFill === '1'
          );
          el.checked = shouldCheck;
        } else {
          // Standard text, email, tel, date, number, textarea
          el.value = String(valueToFill);
        }

        // Visual flash indicator on page
        el.style.transition = 'all 0.4s ease';
        el.style.backgroundColor = '#ecfdf5';
        el.style.outline = '2px solid #10b981';

        setTimeout(() => {
          el.style.backgroundColor = '';
          el.style.outline = '';
        }, 1500);

        // Dispatch synthetic events so React, Angular, Vue, and vanilla handlers detect changes
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));

        filledCount++;
      } catch (err) {
        console.error('Error filling field:', err);
        errors.push(`Error filling ${mapping.label}: ${err.message}`);
      }
    });

    return { filledCount, errors };
  }

  // Handle messages from Extension Popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SCAN_FIELDS') {
      const fields = scanFormFields();
      sendResponse({ success: true, fields, url: window.location.href, title: document.title });
      return true;
    }

    if (request.action === 'FILL_FIELDS') {
      const result = fillApprovedFields(request.mappings || []);
      sendResponse({ success: true, ...result });
      return true;
    }

    return false;
  });

})();
