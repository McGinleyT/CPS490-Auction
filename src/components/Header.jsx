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
      <div className='nav'>
        <div className='nav-left'>
          <img src={logo} alt='logo' className='logo' />
          <Link className='logo-text' to='/'>
            Lawn Pawn
          </Link>
          <div className='username'>
            Logged in as:&nbsp;
            <User id={sub} />
          </div>
        </div>
        <div className='nav-right'>
          <button onClick={() => setToken(null)} className='logout-button'>
            Logout
          </button>
          <button onClick={handleDeleteAccount} className='delete-button'>
            Delete Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='nav'>
      <div className='nav-left'>
        <img src={logo} alt='logo' className='logo' />
        <Link className='logo-text' to='/'>
          Lawn Pawn
        </Link>
      </div>
      <div className='nav-right'>
        <Link className='link' to='/login'>
          Login
        </Link>
        <Link className='link' to='/signup'>
          Sign Up
        </Link>
      </div>
    </div>
  )
}
