import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const API = import.meta.env.DEV ? '/api' : 'https://dora-api.onrender.com/api'

export default function Search() {
  const [pros, setPros] = useState([])
  const [loading, setLoading] = useState(false)
  const [center, setCenter] = useState([41.3275, 19.8189]) // Tirana
  const [userLocation, setUserLocation] = useState(null)
  const { register, handleSubmit } = useForm()
  const { user } = useAuthStore()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setCenter([latitude, longitude])
          setUserLocation({ lat: latitude, lng: longitude })
        },
        () => console.log('Geolocation denied')
      )
    }
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (data.service) params.append('service', data.service)
      if (userLocation) {
        params.append('lat', userLocation.lat)
        params.append('lng', userLocation.lng)
      }
      params.append('sort', 'premium')

      const res = await axios.get(`${API}/professionals/search?${params}`)
      setPros(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Kërko Shërbime</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 flex gap-2">
        <input
          {...register('service')}
          placeholder="Çfarë shërbimi kërkoni? (p.sh. hidraulik)"
          className="flex-1 p-3 border rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {loading ? 'Duke kërkuar...' : 'Kërko'}
        </button>
      </form>

      <div className="h-96 rounded-lg overflow-hidden shadow-lg mb-6">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          {pros.map((pro) => (
            <Marker
              key={pro._id}
              position={[pro.user.location.coordinates[1], pro.user.location.coordinates[0]]}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold">{pro.user.name}</p>
                  <p>{pro.services.join(', ')}</p>
                  <p className="text-sm">
                    {pro.distance ? `${pro.distance} km` : 'Distanca e panjohur'}
                  </p>
                  <p className="text-yellow-600">★ {pro.avgRating.toFixed(1)}</p>
                  {pro.isPremium && <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">PREMIUM</span>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pros.map((pro) => (
          <div key={pro._id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{pro.user.name}</h3>
              {pro.isPremium && <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">PREMIUM</span>}
            </div>
            <p className="text-gray-600">{pro.services.join(', ')}</p>
            <p className="text-sm mt-1">Çmimi: {pro.hourlyRate} €/orë</p>
            <p className="text-sm">Përvojë: {pro.experienceYears} vite</p>
            <p className="text-sm text-blue-600 font-semibold">
              {pro.distance ? `${pro.distance} km larg` : 'Distanca e panjohur'}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-yellow-600">★</span>
              <span>{pro.avgRating.toFixed(1)} ({pro.totalReviews} vlerësime)</span>
            </div>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Rezervo
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
