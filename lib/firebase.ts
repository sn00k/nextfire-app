import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAGV52Mh5be4imic9IkE3BlsTA-b3EIILg",
  authDomain: "nextfire-9cc42.firebaseapp.com",
  projectId: "nextfire-9cc42",
  storageBucket: "nextfire-9cc42.appspot.com",
  messagingSenderId: "949582642744",
  appId: "1:949582642744:web:61599a3a6d6b51625370cd",
  measurementId: "G-R08HD2ZN8T"
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export const auth = firebase.auth()
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider()

export const firestore = firebase.firestore()
export const storage = firebase.storage()

export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED

export const fromMillis = firebase.firestore.Timestamp.fromMillis
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp
export const increment = firebase.firestore.FieldValue.increment

// helper functions

/**
 * gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username) {
  const usersRef = firestore.collection('users')
  const query = usersRef.where('username', '==', username).limit(1)
  const userDoc = (await query.get()).docs[0]

  return userDoc
}

/**
 * converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data()
  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0
  }  
}
