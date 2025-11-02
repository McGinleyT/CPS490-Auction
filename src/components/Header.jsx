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
        <button onClick={() => setToken(null)}>Logut</button>
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
    <div className='nav'>
      <Link to='/'>Home</Link>
      <Link to='/login'>Login</Link>
      <Link to='/signup'>Sign Up</Link>
    </div>
  )
}
