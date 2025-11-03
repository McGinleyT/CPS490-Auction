import { Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../contexts/AuthContext.jsx'
import { User } from './User.jsx'
import { deleteMe } from '../api/users.js'
import logo from '../assets/redmower.png'
import { useQueryClient } from '@tanstack/react-query'

export function Header() {
  const [token, setToken] = useAuth()
  const queryClient = useQueryClient()

  async function handleDeleteAccount() {
    const yes = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone.',
    )
    if (!yes) return

    try {
      await deleteMe(token)
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setToken(null)
    } catch (err) {
      alert(err.message ?? 'Failed to delete account')
    }
  }

  if (token) {
    const { sub } = jwtDecode(token)
    return (
      <div className='nav-authenticated'>
        <img src={logo} alt='logo' className='logo' />
        <div
          style={{
            fontFamily: 'Copperplate',
            fontWeight: 'bold',
            color: 'silver',
          }}
        >
          Lawn Pawn
        </div>
        <div>
          Logged in as:&nbsp;
          <User id={sub} />
        </div>

        <button onClick={() => setToken(null)} className='logout-button'>
          Logout
        </button>
        <button onClick={handleDeleteAccount} className='delete-button'>
          Delete Account
        </button>
      </div>
    )
  }

  return (
    <div className='nav'>
      <img src={logo} alt='logo' className='logo' />
      <div
        style={{
          fontFamily: 'Copperplate',
          fontWeight: 'bold',
          color: 'silver',
        }}
      >
        Lawn Pawn
      </div>
      <Link to='/'>Home</Link>
      <Link to='/login'>Login</Link>
      <Link to='/signup'>Sign Up</Link>
    </div>
  )
}
