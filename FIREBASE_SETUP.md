# Firebase Setup for Urban Dash with GitHub Pages

This document provides instructions for setting up Firebase for the Urban Dash game while hosting on GitHub Pages.

## Prerequisites

1. A Google account
2. Firebase project (already created with project ID: urbandash-84512)
3. GitHub repository (already created at github.com/RorriMaesu/urbanDash)

## Setup Steps

### 1. Firebase Configuration

You've already added the Firebase configuration to your project in the `firebase.js` file:

```javascript
// Firebase configuration with real credentials
const firebaseConfig = {
  apiKey: "AIzaSyCJcLn1b6Z-7WnBXIsmk5mTmWBM6ez_bhI",
  authDomain: "urbandash-84512.firebaseapp.com",
  projectId: "urbandash-84512",
  storageBucket: "urbandash-84512.firebasestorage.app",
  messagingSenderId: "1055863235085",
  appId: "1:1055863235085:web:fcda6e7fed0e9673ce2b44",
  measurementId: "G-0H3J03KHRL"
};
```

### 2. Set up Firestore Security Rules

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project (urbandash-84512)
3. Navigate to Firestore Database > Rules
4. Replace the rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Scores collection - anyone can read, but write requires timestamp validation
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.resource.data.ts == request.time;
    }

    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow public read for limited user data
      allow read: if request.path.size() == 2; // Only allow reading the whole document, not specific fields
    }

    // Missions collection - anyone can read, only admins can write
    match /missions/{missionId} {
      allow read: if true;
      allow write: if false; // Set to admin-only in a real implementation
    }
  }
}
```

5. Click "Publish"

### 3. Set up Firestore Collections

Create the following collections in your Firestore database:

1. **scores**: For storing player scores
   - Fields: name (string), score (number), ts (timestamp)

2. **users**: For storing user data
   - Fields: tokens (number), inventory (array), missions (map), stats (map)

3. **missions**: For storing daily missions
   - Create a document with ID "daily"
   - Add a "missions" array field with mission objects

## GitHub Pages Integration

The game is hosted on GitHub Pages, which means:

1. The static files (HTML, CSS, JS) are served from GitHub's servers
2. Firebase is only used for the database and analytics
3. The game is accessible at https://rorrimaesu.github.io/urbanDash/

### Automatic Deployment

The repository is set up with GitHub Actions to automatically deploy to GitHub Pages:

1. Any push to the `main` branch triggers the deployment workflow
2. The workflow builds and deploys the game to GitHub Pages
3. No additional steps are needed for deployment

## Analytics

Firebase Analytics is already integrated into the game. The following events are tracked:

- Game start (with selected character)
- Game over (with score, distance, and orbs collected)
- Powerup collection
- Shield use
- Score saving

You can view these events in the Firebase console under Analytics.

## Troubleshooting

If you encounter any issues with Firebase while the game is hosted on GitHub Pages:

1. Check the browser console for errors
2. Verify your Firebase project settings
3. Make sure your Firestore security rules are properly deployed
4. Check that your Firebase project has Firestore enabled
5. Ensure that your GitHub Pages domain is added to the authorized domains in Firebase Authentication settings

## CORS Configuration

If you encounter CORS issues:

1. Go to Firebase Console > Authentication > Settings > Authorized Domains
2. Add `rorrimaesu.github.io` to the list of authorized domains

## Next Steps

1. Add Firebase Authentication for user accounts
2. Implement Cloud Functions for server-side logic
3. Add Remote Config for dynamic game settings
4. Implement daily mission updates using Cloud Functions
