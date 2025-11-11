import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import axios from 'axios'

const API = import.meta.env.DEV ? '/api' : 'https://dora-api.onrender.com/api'

export default function Register() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const { setToken } = useAuthStore()

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${API}/auth/register`, {
        ...data,
        phone: `+355${data.phone.replace(/\D/g, '')}`,
      })
      setToken(res.data.token)
      setPhone(`+355${data.phone.replace(/\D/g, '')}`)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed')
    }
  }

  const verifyCode = async () => {
    try {
      await axios.post(
        `${API}/auth/verify-code`,
        { code },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      navigate('/search')
    } catch (err) {
      setError('Kod i gabuar')
    }
  }

  const sendCode = async () => {
    try {
      await axios.post(
        `${API}/auth/verify-phone`,
        { phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setError('Kodi u dërgua!')
    } catch (err) {
      setError('Dështoi dërgimi')
    }
  }

  if (step === 2) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Verifikoni Telefonin</h2>
        <p className="mb-4">Kodi u dërgua në: {phone}</p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Shkruani kodin"
          className="w-full p-3 border rounded-lg mb-4"
        />
        {error && <p className={error.includes('u dërgua') ? 'text-green-600' : 'text-red-500'}>{error}</p>}
        <div className="space-x-2">
          <button onClick={verifyCode} className="bg-blue-600 text-white px-6 py-2 rounded">
            Verifiko
          </button>
          <button onClick={sendCode} className="bg-gray-600 text-white px-6 py-2 rounded">
            Ridërgo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center mb-6">Regjistrohu në Dora</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Emri" className="w-full p-3 border rounded-lg" required />
        <input {...register('email')} type="email" placeholder="Email" className="w-full p-3 border rounded-lg" required />
        <input {...register('password')} type="password" placeholder="Fjalëkalimi" className="w-full p-3 border rounded-lg" required />
        <div className="flex">
          <span className="p-3 border rounded-l-lg bg-gray-100">+355</span>
          <input
            {...register('phone')}
            type="tel"
            placeholder="6X XXX XXXX"
            className="flex-1 p-3 border rounded-r-lg"
            required
          />
        </div>
        <select {...register('role')} className="w-full p-3 border rounded-lg">
          <option value="user">Kërkoj shërbim</option>
          <option value="professional">Oferoj shërbim</option>
        </select>
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">
          Regjistrohu
        </button>
      </form>
    </div>
  )
}
