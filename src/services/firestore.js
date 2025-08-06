import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    const testCollection = collection(db, 'posts');
    await getDocs(testCollection);
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    if (error.code === 'permission-denied') {
      console.error('🔒 Permission denied - check your Firestore security rules');
    }
    return false;
  }
};

export const addPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Post added successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding post:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    }
    throw error;
  }
};

export const subscribeToPosts = (callback) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, 
    (snapshot) => {
      console.log('📡 Received posts update:', snapshot.size, 'posts');
      callback(snapshot);
    },
    (error) => {
      console.error('❌ Error listening to posts:', error);
      if (error.code === 'permission-denied') {
        console.error('🔒 Permission denied - check your Firestore security rules');
      }
    }
  );
};

export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
    console.log('✅ Post deleted successfully:', postId);
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. You can only delete your own posts.');
    }
    throw error;
  }
};

export const updatePost = async (postId, updates) => {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Post updated successfully:', postId);
  } catch (error) {
    console.error('❌ Error updating post:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. You can only update your own posts.');
    }
    throw error;
  }
};
