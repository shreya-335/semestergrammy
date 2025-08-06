import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPost = async (postData) => {
    try {
      await addDoc(collection(db, 'posts'), {
        ...postData,
        createdAt: serverTimestamp(),
        id: Date.now().toString()
      });
      toast.success('Post added successfully!');
    } catch (error) {
      console.error('Error adding post:', error);
      toast.error('Failed to add post');
    }
  };

  const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Convert image file to base64 string for storage in Firestore
  const processImage = async (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for base64
        reject(new Error('Image size should be less than 1MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = (e) => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    posts,
    loading,
    addPost,
    deletePost,
    processImage
  };
};
