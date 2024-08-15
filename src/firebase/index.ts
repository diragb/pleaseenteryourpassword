'use client'

// Packages:
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

// Constants:
const firebaseConfig = {
  apiKey: 'AIzaSyDcipXog5V9Bj2Atn5u9CTAyqpZ1hMLkaA',
  authDomain: 'pleaseenteryourpassword.firebaseapp.com',
  projectId: 'pleaseenteryourpassword',
  storageBucket: 'pleaseenteryourpassword.appspot.com',
  messagingSenderId: '364966296877',
  appId: '1:364966296877:web:7f15cf59a71dbd9d40a7a4',
  measurementId: 'G-LMB03XH1VQ'
}

// Exports:
export const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const auth = getAuth(app)
