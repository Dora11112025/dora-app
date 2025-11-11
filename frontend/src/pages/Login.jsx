import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import axios from 'axios'

const API = import.meta.env.DEV ? '/api' : 'https://dora-api.onrender.com/api'

export default function Login() {
  const [error, setError] = useState('')
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const { setToken } = useAuthStore()

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${API}/auth/login`, data)
      setToken(res.data.token)
      navigate('/search')
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center mb-6">Hyr në Dora</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          {...register('password')}
          type="password"
          placeholder="Fjalëkalimi"
          className="w-full p-3 border rounded-lg"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Hyr
        </button>
      </form>
      <p className="text-center mt-4">
        Nuk ke llogari?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Regjistrohu
        </a>
      </p>
    </div>
  )
}
