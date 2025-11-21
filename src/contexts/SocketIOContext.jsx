import { createContext, useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { io } from 'socket.io-client'

const SocketContext = createContext({
  socket: null,
  status: 'disconnected',
  error: null,
})

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const [error, setError] = useState(null)

  useEffect(() => {
    const host = import.meta.env.VITE_SOCKET_HOST
    const s = io(host)

    setSocket(s)
    setStatus('connecting')

    s.on('connect', () => {
      console.log('connected to socket.io as', s.id)
      setStatus('connected')
      setError(null)
    })

    s.on('disconnect', () => {
      console.log('socket disconnected')
      setStatus('disconnected')
    })

    s.on('connect_error', (err) => {
      console.error('socket.io connect error:', err)
      setStatus('error')
      setError(err)
    })

    return () => {
      s.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, status, error }}>
      {children}
    </SocketContext.Provider>
  )
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useSocket() {
  return useContext(SocketContext)
}
