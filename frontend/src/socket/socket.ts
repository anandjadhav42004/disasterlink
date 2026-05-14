import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000', {
  autoConnect: false
})

export default socket
