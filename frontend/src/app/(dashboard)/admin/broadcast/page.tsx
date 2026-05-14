'use client'
import { useState } from 'react'
import api from '@/services/api'

export default function BroadcastPage() {
  const [form, setForm] = useState({ title: '', message: '', severity: 'HIGH' })
  const [sent, setSent] = useState(false)

  const send = async () => {
    await api.post('/admin/broadcast', form)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Broadcast Alert</h1>
      <input className="border w-full p-2 rounded mb-3 bg-background" placeholder="Title"
        value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
      <textarea className="border w-full p-2 rounded mb-3 bg-background" placeholder="Message" rows={4}
        value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
      <select className="border w-full p-2 rounded mb-3 bg-background"
        value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
        <option>LOW</option>
        <option>MEDIUM</option>
        <option>HIGH</option>
        <option>CRITICAL</option>
      </select>
      <button onClick={send} className="bg-red-600 text-white w-full py-3 rounded font-bold hover:bg-red-700">
        {sent ? '✅ Broadcast Sent!' : 'Send Emergency Broadcast'}
      </button>
    </div>
  )
}
