import React, { useContext, useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    const signUp = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const googleProvider = new GoogleAuthProvider();

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const logIn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const logout = () => {
        return signOut(auth);
    }

    const createProfile = async (fullname, username, about) => {
        try {
            const userRef = doc(db, 'users', currentUser.email);
            await setDoc(userRef, {
                fullname: fullname,
                username: username,
                email: currentUser.email,
                about: about,
                timestamp: serverTimestamp()
            }, { merge: true });
            console.log("Document Updated!");
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const updateUserProfile = (name) => {
        updateProfile(auth.currentUser, {
            displayName: name,
        }).then(() => {
            console.log("Profile updated!");
        }).catch((e) => {
            console.error(e);
        })
    }

    const uploadPhoto = async (file) => {
        const storageRef = ref(storage, `profile-images/${currentUser.email}.jpg`);

        // 'file' comes from the Blob or File API
        await uploadBytes(storageRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
                updateProfile(auth.currentUser, {
                    photoURL: url
                })
            })
            console.log('Uploaded a blob or file!');
        }).catch((err) => {
            console.error(err);
        })
    }

    const uploadPostPhoto = async (file) => {
        const currTime = Date.now().toString()
        const storageRef = ref(storage, `post-images/${currentUser.email}/${currTime}.jpg`);

        // 'file' comes from the Blob or File API
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
    }

    const deletePostPhoto = async (uri) => {
        const fileRef = ref(storage, uri)

        // Delete the file
        deleteObject(fileRef).then(() => {
            console.log("File deleted successfully!");
        }).catch((error) => {
            console.error("Error: ", error.message);
        });
    }

    const fetchProfile = () => {
        const docRef = doc(db, "users", currentUser.email);
        return getDoc(docRef);
    }

    const validateUsername = (uname) => {
        const q = query(collection(db, "users"), where("username", "==", uname));
        return getDocs(q);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // global value using context API provider
    const value = {
        currentUser,
        signUp,
        signInWithGoogle,
        logIn,
        logout,
        createProfile,
        updateUserProfile,
        fetchProfile,
        uploadPhoto,
        uploadPostPhoto,
        validateUsername,
        deletePostPhoto,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
