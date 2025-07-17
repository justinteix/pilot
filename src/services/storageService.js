import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

// Upload profile image
export const uploadProfileImage = async (userId, file) => {
  try {
    // Create a reference to the file location
    const imageRef = ref(storage, `profile-images/${userId}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Delete profile image
export const deleteProfileImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Create a reference from the URL
    const imageRef = ref(storage, imageUrl);
    
    // Delete the file
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting profile image:', error);
    // Don't throw error for deletion failures
  }
};

// Upload movie/show poster (for future use)
export const uploadPoster = async (userId, file, movieId) => {
  try {
    const posterRef = ref(storage, `user-posters/${userId}/${movieId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(posterRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading poster:', error);
    throw error;
  }
};