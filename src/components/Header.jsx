import { Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../contexts/AuthContext.jsx'
import { User } from './User.jsx'
import { deleteMe } from '../api/users.js'

export function Header() {
  const [token, setToken] = useAuth()

  async function handleDeleteAccount() {
    const yes = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone.',
    )
    if (!yes) return

    try {
      await deleteMe(token)
      setToken(null)
    } catch (err) {
      alert(err.message ?? 'Failed to delete account')
    }
  }

  if (token) {
    const { sub } = jwtDecode(token)
    return (
      <div>
        Logged in as <User id={sub} />
        <br />
        <button onClick={() => setToken(null)}>Logout</button>
        <button
          onClick={handleDeleteAccount}
          style={{ marginLeft: 8, color: 'red' }}
        >
          Delete Account
        </button>
      </div>
    )
  }

  return (
    <div className='bg-purple-600 text-white px-6 py-3 rounded-b-2xl'>
      <Link className='font-bold underline' to='/login'>
        Login
      </Link>
      <span className='mx-2 text-purple-200'>|</span>
      <Link className='hover:text-yellow-200' to='/signup'>
        Sign Up
      </Link>
    </div>
  )
}
