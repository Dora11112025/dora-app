import { create } from 'zustand'
import axios from 'axios'
import jwtDecode from 'jwt-decode'

const API = import.meta.env.DEV ? '/api' : 'https://dora-api.onrender.com/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  setToken: (token) => {
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    const decoded = jwtDecode(token)
    set({ token, user: decoded })
  },

  logout: () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    set({ token: null, user: null })
  },

  init: () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ token, user: decoded })
      } catch {
        localStorage.removeItem('token')
      }
    }
  },
}))

// Init on load
useAuthStore.getState().init()
