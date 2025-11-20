import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { login } from '../api/users.js'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Header } from '../components/Header.jsx'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [, setToken] = useAuth()

  const loginMutation = useMutation({
    mutationFn: () => login({ username, password }),
    onSuccess: (data) => {
      setToken(data.token)
      navigate('/')
    },
    onError: () => alert('failed to login!'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    loginMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Header />
      <div className='containerFit'>
        <strong>Login</strong>
        <br />

        <div>
          <label htmlFor='create-username'> Username: </label>
          <input
            type='text'
            name='create-username'
            id='create-username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor='create-password'> Password: </label>
          <input
            type='password'
            name='create-password'
            id='create-password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <br />
        <input
          className='button'
          type='submit'
          value={loginMutation.isPending ? 'Logging in...' : 'Login'}
          disabled={!username || !password || loginMutation.isPending}
        />
        <br />
        <p>
          Don’t have an account? <a href='/signup'>Sign up</a>
        </p>
      </div>
    </form>
  )
}
