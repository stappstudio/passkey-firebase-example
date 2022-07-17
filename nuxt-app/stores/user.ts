import { defineStore } from 'pinia'
import { User } from 'firebase/auth'

export const useStore = defineStore('user', {
  state: () => {
    return {
      user: null as User | undefined,
    }
  }
})