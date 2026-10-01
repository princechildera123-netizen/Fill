# FILL Chrome Extension (Companion)

> **Your information. One time.**  
> Privacy-first intelligent form completion companion for web forms, scholarships, fellowship portals, and university applications.

---

## 🚀 Overview

The **FILL Chrome Extension** brings the core capabilities of the FILL platform directly into any webpage:
1. **Intelligent Field Detection**: Inspects visible form fields (`<input>`, `<select>`, `<textarea>`) extracting labels, placeholders, aria attributes, names, and nearby contextual section headers.
2. **FILL Sense Semantic Understanding**: Decodes non-standard academic and application phrasing:
   - *"Current educational institution"* $\rightarrow$ `School`
   - *"Institution presently attended"* $\rightarrow$ `School`
   - *"Academic programme"* $\rightarrow$ `Course of Study`
3. **Safety Guard & Transparent Confidence**: Categorizes each match into **High**, **Medium**, or **Low** confidence.
   - Requires explicit user approval for Medium/Low confidence before filling.
   - Automatically refuses to touch sensitive fields (passwords, payment cards, SSNs, bank details).
   - **Never auto-submits**: FILL never clicks Submit or Continue.
4. **FILL Memory Learning**: When you confirm or remap a field, FILL remembers the semantic link (e.g. *"Institution presently attended"* $\rightarrow$ `School`). Subsequent forms automatically display `🧠 Remembered by FILL`.

---

## 📦 How to Load Locally in Google Chrome (Manifest V3)

1. Open **Google Chrome** on your computer.
2. In the URL address bar, navigate to:  
   `chrome://extensions/`
3. In the top-right corner, toggle on **"Developer mode"**.
4. In the top-left corner, click **"Load unpacked"**.
5. Select the `/extension` directory inside this project root.
6. The **FILL** extension will appear in your extensions toolbar! Click the puzzle icon and pin **FILL** to your toolbar.

---

## ⚡ 2-Minute Demonstration Flow

1. Open the included local demo portal:  
   `http://localhost:3000/demo.html` (or your active web app URL + `/demo.html`).
2. **Test Form A (Standard Wording)**:
   - Click the **FILL** extension icon in your browser toolbar.
   - Click **"Scan Page"**.
   - Notice that FILL detects 7 fields with **High Confidence** (e.g. *Current educational institution* $\rightarrow$ *School*).
   - Click **"Fill with FILL"**.
   - All fields populate instantly with synthetic `input` and `change` events.
3. **Test Form B (Alternative Phrasing)**:
   - Click the tab for **"Form B: Commonwealth Fellowship"**.
   - Notice the wording is deliberately different: *Candidate Legal Name*, *Institution presently attended*, *Academic programme*.
   - Click **"Scan Page"**.
   - Notice that FILL highlights `🧠 Remembered by FILL` for the school mapping, preserving cross-form learning!
   - Review and click **"Fill with FILL"**.

---

## 🛡️ Privacy & Permissions Architecture

- **Manifest V3** compliant.
- `activeTab` & `scripting`: Scans and injects only when you explicitly click **Scan Page** or **Fill**.
- Zero background keystroke tracking or passive page sniffing.
- Vault values remain locally stored in browser storage.
