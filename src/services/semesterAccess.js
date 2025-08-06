import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

// Create a new semester with password protection
export const createSemester = async (semesterData, creatorId) => {
  try {
    const semesterRef = doc(collection(db, 'semesters'));
    const semesterId = semesterRef.id;

    // Create semester document
    await setDoc(semesterRef, {
      ...semesterData,
      id: semesterId,
      creatorId,
      createdAt: serverTimestamp(),
      isPasswordProtected: true
    });

    // Give creator access
    await setDoc(doc(db, 'semesterAccess', `${semesterId}_${creatorId}`), {
      semesterId,
      userId: creatorId,
      role: 'creator',
      joinedAt: serverTimestamp(),
      invitedBy: creatorId
    });

    return semesterId;
  } catch (error) {
    console.error('Error creating semester:', error);
    throw error;
  }
};

// Verify semester password and grant access
export const joinSemesterWithPassword = async (semesterId, password, userId, userEmail) => {
  try {
    // Get semester data
    const semesterDoc = await getDoc(doc(db, 'semesters', semesterId));
    
    if (!semesterDoc.exists()) {
      throw new Error('Semester not found');
    }

    const semesterData = semesterDoc.data();
    
    // Check if password matches
    if (semesterData.password !== password) {
      throw new Error('Incorrect password');
    }

    // Check if user already has access
    const accessDoc = await getDoc(doc(db, 'semesterAccess', `${semesterId}_${userId}`));
    
    if (accessDoc.exists()) {
      return { success: true, message: 'You already have access to this semester' };
    }

    // Grant access
    await setDoc(doc(db, 'semesterAccess', `${semesterId}_${userId}`), {
      semesterId,
      userId,
      userEmail,
      role: 'member',
      joinedAt: serverTimestamp(),
      invitedBy: semesterData.creatorId
    });

    // Log the join event
    await addDoc(collection(db, 'semesterLogs'), {
      semesterId,
      userId,
      userEmail,
      action: 'joined',
      timestamp: serverTimestamp()
    });

    return { success: true, message: 'Successfully joined semester!' };
  } catch (error) {
    console.error('Error joining semester:', error);
    throw error;
  }
};

// Get semester data if user has access
export const getSemesterData = async (semesterId, userId) => {
  try {
    // Check if user has access
    const accessDoc = await getDoc(doc(db, 'semesterAccess', `${semesterId}_${userId}`));
    
    if (!accessDoc.exists()) {
      throw new Error('Access denied');
    }

    // Get semester data
    const semesterDoc = await getDoc(doc(db, 'semesters', semesterId));
    
    if (!semesterDoc.exists()) {
      throw new Error('Semester not found');
    }

    return {
      ...semesterDoc.data(),
      userRole: accessDoc.data().role
    };
  } catch (error) {
    console.error('Error getting semester data:', error);
    throw error;
  }
};

// Get all members of a semester
export const getSemesterMembers = async (semesterId) => {
  try {
    const q = query(
      collection(db, 'semesterAccess'),
      where('semesterId', '==', semesterId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting semester members:', error);
    throw error;
  }
};

// Generate invitation link
export const generateInvitationLink = (semesterId, semesterName) => {
  const baseUrl = window.location.origin;
  const inviteUrl = `${baseUrl}/invite/${semesterId}`;
  
  return {
    url: inviteUrl,
    message: `You're invited to join "${semesterName}" semester! Click the link to join: ${inviteUrl}`
  };
};
