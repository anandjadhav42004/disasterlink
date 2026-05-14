'use client'
import { useEffect, useState } from 'react'
import api from '@/services/api'

export default function VolunteerTasksPage() {
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    api.get('/volunteer/tasks').then(r => setTasks(r.data?.data || []))
    
    window.addEventListener('volunteer-assigned', (e: any) => {
      setTasks(prev => [...prev, e.detail])
    })
  }, [])

  const accept = async (id: string) => {
    await api.post(`/volunteer/accept/${id}`)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'ASSIGNED' } : t))
  }

  const complete = async (id: string) => {
    await api.post(`/volunteer/complete/${id}`)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
      {tasks.length === 0 && <p>No tasks assigned yet.</p>}
      {tasks.map(task => (
        <div key={task.id} className="border p-4 rounded mb-3">
          <p><b>Type:</b> {task.type}</p>
          <p><b>Severity:</b> {task.severity}</p>
          <p><b>Status:</b> {task.status}</p>
          <p><b>Location:</b> {task.latitude}, {task.longitude}</p>
          <div className="flex gap-2 mt-2">
            {task.status === 'PENDING' && (
              <button onClick={() => accept(task.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Accept Task
              </button>
            )}
            {task.status === 'ASSIGNED' && (
              <button onClick={() => complete(task.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Mark Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
