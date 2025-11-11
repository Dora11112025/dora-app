import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useAuthStore } from '../store/auth'

const localizer = momentLocalizer(moment)
const API = import.meta.env.DEV ? '/api' : 'https://dora-api.onrender.com/api'

export default function Profile() {
  const [pro, setPro] = useState(null)
  const [events, setEvents] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const { register, handleSubmit, watch } = useForm()
  const { token } = useAuthStore()

  useEffect(() => {
    fetchProfile()
    fetchBookings()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/professionals/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPro(res.data)
    } catch (err) {
      console.log('No profile yet')
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const bookingEvents = res.data
        .filter((b) => b.professional._id === pro?._id)
        .map((b) => ({
          title: `Rezervim: ${b.service}`,
          start: new Date(b.date),
          end: new Date(new Date(b.date).getTime() + 2 * 60 * 60 * 1000), // 2 hours
        }))
      setEvents(bookingEvents)
    } catch (err) {}
  }

  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append('services', JSON.stringify(data.services.split(',').map((s) => s.trim())))
    formData.append('description', data.description)
    formData.append('hourlyRate', data.hourlyRate)
    formData.append('experienceYears', data.experienceYears)
    formData.append('availability', JSON.stringify(pro?.availability || []))

    if (data.idDocument[0]) formData.append('idDocument', data.idDocument[0])
    if (data.photos) {
      for (let file of data.photos) formData.append('photos', file)
    }

    try {
      await axios.post(`${API}/professionals/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      alert('Profili u përditësua!')
      fetchProfile()
    } catch (err) {
      alert('Gabim: ' + (err.response?.data?.msg || ''))
    }
  }

  const addAvailability = () => {
    if (!selectedSlot) return
    const newSlot = {
      start: selectedSlot.start,
      end: selectedSlot.end,
      booked: false,
    }
    setPro((p) => ({
      ...p,
      availability: [...(p?.availability || []), newSlot],
    }))
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profili i Profesionistit</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            {...register('services')}
            placeholder="Shërbimet (p.sh. hidraulik, elektrik)"
            className="p-3 border rounded"
            defaultValue={pro?.services?.join(', ')}
          />
          <input
            {...register('hourlyRate')}
            type="number"
            placeholder="Çmimi për orë (€)"
            className="p-3 border rounded"
            defaultValue={pro?.hourlyRate}
          />
          <input
            {...register('experienceYears')}
            type="number"
            placeholder="Vite përvojë"
            className="p-3 border rounded"
            defaultValue={pro?.experienceYears}
          />
          <input
            {...register('idDocument')}
            type="file"
            accept="image/*"
            className="p-3 border rounded"
          />
        </div>
        <textarea
          {...register('description')}
          placeholder="Përshkrimi i shërbimeve..."
          rows="3"
          className="w-full p-3 border rounded"
          defaultValue={pro?.description}
        />
        <input
          {...register('photos')}
          type="file"
          accept="image/*"
          multiple
          className="w-full p-3 border rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700"
        >
          Ruaj Profilin
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Disponueshmëria</h2>
        <Calendar
          localizer={localizer}
          events={events}
          selectable
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          messages={{
            next: 'Përpara',
            previous: 'Mbrapa',
            today: 'Sot',
            month: 'Muaji',
            week: 'Java',
            day: 'Dita',
          }}
        />
        {selectedSlot && (
          <button
            onClick={addAvailability}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Shto Disponueshmëri
          </button>
        )}
      </div>

      {pro?.portfolio?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Portofoli</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pro.portfolio.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-40 object-cover rounded" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
