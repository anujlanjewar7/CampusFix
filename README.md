# CampusFix — Campus Care, Made Simple

CampusFix is a modern campus facility care and maintenance tracking web application. Students and staff can report campus issues, monitor real-time repair tickets, track work order statuses, and inspect breakdown metrics.

---

## Project Structure

```
campusfix/
├── index.html          # Clean page layout, modals, and script/style links
├── css/
│   └── styles.css      # Design system tokens, layouts, cards, and responsive rules
├── js/
│   ├── utils.js        # DOM shortcuts, HTML escaping, badges, and toast notifications
│   ├── complaints.js   # Sample datasets, ticket state, detail modals, and actions
│   ├── dashboard.js    # Statistics cards, category chart, activity stream, and views
│   ├── auth.js         # Firebase Authentication configuration, forms, and sign-out
│   └── app.js          # App lifecycle, event listeners, and auth state observer
└── README.md           # Project documentation and setup guide
```

---

## File Responsibilities

| File | Purpose |
| :--- | :--- |
| `index.html` | Semantic HTML structure for the Login portal, Main dashboard, Report modal, and Ticket detail modal. |
| `css/styles.css` | All styling tokens, glassmorphism topbar, tables, charts, responsive phone breakpoints, and mobile bottom navigation. |
| `js/utils.js` | Helper utilities including `$()`, `$$()`, `esc()`, `badge()`, and `showToast()`. |
| `js/complaints.js` | Manages ticket list, local persistence, status changes (`In Progress`, `Resolved`, `Closed`), and ticket assignment. |
| `js/dashboard.js` | Computes open/resolved/high-priority counts, category charts, activity stream, and page switching. |
| `js/auth.js` | Firebase Auth initialization, error code translations, sign-in/register modes, and password reset handling. |
| `js/app.js` | Hooks up all DOM click/input events, form submissions, ESC key shortcuts, and listens to Firebase session state. |

---

## How to Run in Replit

1. **Import / Upload**:
   - Create a new **HTML, CSS, JS** Repl on [Replit](https://replit.com/).
   - Upload the files or push via Git maintaining the folder structure (`index.html`, `css/styles.css`, `js/*.js`).
2. **Run**:
   - Click the green **Run** button at the top of your Repl.
   - Replit automatically launches its built-in Webview displaying the app at your live URL (`https://<repl-name>.<username>.repl.co`).
3. **Authorized Domain** (for Firebase Authentication):
   - In the [Firebase Console](https://console.firebase.google.com/), navigate to **Authentication** → **Settings** → **Authorized domains**.
   - Add your Replit domain (`<repl-name>.<username>.repl.co`) so authentication requests are allowed.

---

## How to Run Locally

You can run CampusFix locally using any static web server:

- **VS Code Live Server Extension**: Right-click `index.html` and select **Open with Live Server**.
- **Python**:
  ```bash
  python -m http.server 8080
  ```
  Then open `http://localhost:8080` in your browser.
- **Node.js**:
  ```bash
  npx serve .
  ```

---

## Firebase Configuration

To connect your own Firebase project for user authentication:
1. Open [`js/auth.js`](file:///c:/Users/swapn/OneDrive/Desktop/campusfix/js/auth.js).
2. Replace the placeholder values in `firebaseConfig` with your Web App keys from the Firebase Console (**Project Settings** → **Your apps** → **Web**):
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
3. Enable **Email/Password** in Firebase Console under **Authentication** → **Sign-in method**.

---

## Features

- **Live Issue Tracking**: Real-time listing with search and status filtering (Submitted, Assigned, In Progress, Resolved, Closed).
- **Interactive Modals**: Detailed ticket inspections with staff controls to assign or update statuses.
- **Issue Submission**: Report issues with category, building block, room, priority, and description.
- **Responsive Ergonomics**: Responsive desktop sidebar, slide-out drawer on tablets, and native bottom sheet modals with floating action button on phones.
- **Session Persistence**: Automatic session restoration on reload and clean sign-out workflow.
