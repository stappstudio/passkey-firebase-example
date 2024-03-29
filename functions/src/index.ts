import { initializeApp } from 'firebase-admin/app'

// Since we are running on Firebase Functions we don't need to provide credentials
initializeApp()

export { register } from './register'
export { login } from './login'
export { cleanup } from './cleanup'