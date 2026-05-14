'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth-store'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const severityColors: Record<string, string> = {
  CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'green'
}

export default function LiveMap() {
  const [sosPins, setSosPins] = useState<any[]>([])
  const [shelters, setShelters] = useState<any[]>([])
  const { isAuthenticated } = useAuthStore()

  const fetchData = async () => {
    try {
      const [sosRes, shelterRes] = await Promise.all([
        api.get('/map/live'),
        api.get('/map/shelters')
      ])
      setSosPins(sosRes.data?.data || [])
      setShelters(shelterRes.data?.data || [])
    } catch (err) {
      console.error('Map fetch error:', err)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    
    // Real-time socket updates
    window.addEventListener('map-update', (e: any) => {
      if (e.detail.type === 'NEW_SOS') {
        setSosPins(prev => [...prev, e.detail.data])
      }
      if (e.detail.type === 'SOS_RESOLVED') {
        setSosPins(prev => prev.filter(s => s.id !== e.detail.data.sosId))
      }
    })

    return () => clearInterval(interval)
  }, [isAuthenticated])

  return (
    <MapContainer
      center={[28.6139, 77.2090]}
      zoom={12}
      style={{ height: '500px', width: '100%', zIndex: 0 }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Street View">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite View">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Terrain View">
          <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="OpenTopoMap" />
        </LayersControl.BaseLayer>
      </LayersControl>

      {sosPins.map((sos) => (
        <Marker key={sos.id} position={[sos.latitude, sos.longitude]}>
          <Popup>
            <b>{sos.type}</b><br/>
            Severity: {sos.severity}<br/>
            Status: {sos.status}<br/>
            User: {sos.user?.name}
          </Popup>
        </Marker>
      ))}

      {shelters.map((shelter) => (
        <Marker key={shelter.id} position={[shelter.latitude, shelter.longitude]}>
          <Popup>
            <b>{shelter.name}</b><br/>
            Capacity: {shelter.occupied}/{shelter.capacity}<br/>
            Available: {shelter.availableSpace} spots
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
