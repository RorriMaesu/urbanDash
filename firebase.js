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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

// Post score to leaderboard
async function postScore(name, score) {
  try {
    await db.collection('scores').add({
      name,
      score,
      ts: Date.now()
    });
    console.log('Score saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
}

// Get top scores for leaderboard
async function getTopScores(limit = 10) {
  try {
    const snap = await db.collection('scores')
      .orderBy('score', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(d => d.data());
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
}

// Get user data (inventory, tokens, etc.)
async function getUserData(userId) {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
      return doc.data();
    } else {
      // Create new user data if it doesn't exist
      const userData = {
        tokens: 0,
        inventory: [],
        missions: {
          current: [],
          completed: []
        },
        stats: {
          highScore: 0,
          totalDistance: 0,
          totalOrbs: 0
        }
      };
      await db.collection('users').doc(userId).set(userData);
      return userData;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Update user data
async function updateUserData(userId, data) {
  try {
    await db.collection('users').doc(userId).update(data);
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
}

// Get daily missions
async function getDailyMissions() {
  try {
    const doc = await db.collection('missions').doc('daily').get();
    if (doc.exists) {
      return doc.data().missions;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting daily missions:', error);
    return [];
  }
}
