// Import the Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";

// Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Post score to leaderboard
async function postScore(name, score) {
  try {
    const scoresCollection = collection(db, 'scores');
    await addDoc(scoresCollection, {
      name,
      score,
      ts: serverTimestamp()
    });
    
    // Log event to analytics
    logEvent(analytics, 'score_saved', {
      name,
      score
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
    const scoresCollection = collection(db, 'scores');
    const q = query(scoresCollection, orderBy('score', 'desc'), limit(limit));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
}

// Get user data (inventory, tokens, etc.)
async function getUserData(userId) {
  try {
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      return docSnap.data();
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
      
      await setDoc(userDoc, userData);
      
      // Log event to analytics
      logEvent(analytics, 'new_user_created', {
        userId
      });
      
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
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, data);
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
}

// Get daily missions
async function getDailyMissions() {
  try {
    const missionDoc = doc(db, 'missions', 'daily');
    const docSnap = await getDoc(missionDoc);
    
    if (docSnap.exists()) {
      return docSnap.data().missions;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting daily missions:', error);
    return [];
  }
}

// Log game events to analytics
function logGameEvent(eventName, eventParams = {}) {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Error logging event:', error);
  }
}

// Export functions
export {
  postScore,
  getTopScores,
  getUserData,
  updateUserData,
  getDailyMissions,
  logGameEvent
};
