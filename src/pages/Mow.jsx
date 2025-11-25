import { useState, useEffect, useRef } from 'react'
import { Header } from '../components/Header.jsx'
import mower from '../assets/redmower.png'
import grassImg from '../assets/grass.png'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getMe } from '../api/users.js'

// How many grass dots spawn on the field
const GRASS_COUNT = 80

// Makes a random grass
function makeGrassDot() {
  return {
    id: crypto.randomUUID(),
    x: (Math.random() * window.innerWidth) / 1.25,
    y: (Math.random() * window.innerHeight) / 1.25 + 60,
  }
}

export function Mow() {
  const [token] = useAuth()
  const [localTokens, setLocalTokens] = useState(0)
  const [grass, setGrass] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const mowerRef = useRef(null)
  const grassRef = useRef(null)

  // Load tokens from backend on mount
  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const user = await getMe(token)
        if (user) setLocalTokens(user.tokens)
      } catch (err) {
        console.error('failed to load user for mow:', err)
      }
    })()
  }, [token])

  // Spawn initial grass
  useEffect(() => {
    const initial = Array.from({ length: GRASS_COUNT }, () => makeGrassDot())
    setGrass(initial)
  }, [])

  function handleMouseMove(e) {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  // Collision detection + token reward
  useEffect(() => {
    const mowerSize = 60
    const mx = mousePos.x
    const my = mousePos.y

    setGrass((prevGrass) => {
      const remaining = []
      let earned = 0

      for (const g of prevGrass) {
        const dx = g.x - mx
        const dy = g.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < mowerSize) {
          earned++
        } else {
          remaining.push(g)
        }
      }

      if (earned > 0) {
        const newTokenTotal = localTokens + earned
        setLocalTokens(newTokenTotal)

        // Send updated tokens to backend (use backend base URL from env)
        fetch(`${import.meta.env.VITE_BACKEND_URL}user/me/tokens`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tokens: newTokenTotal }),
        }).catch((err) => console.error('Failed to update tokens:', err))

        // Respawn grass
        const newDots = Array.from({ length: earned }, () => makeGrassDot())
        return [...remaining, ...newDots]
      }

      return prevGrass
    })
  }, [mousePos])

  return (
    <div onMouseMove={handleMouseMove}>
      <Header />

      <div className='tokenCounter'>Tokens: {localTokens}</div>

      {grass.map((g) => (
        <img
          key={g.id}
          ref={grassRef}
          src={grassImg}
          alt='grassImg'
          className='gameImg'
          style={{ left: g.x, top: g.y }}
        />
      ))}

      <img
        ref={mowerRef}
        src={mower}
        alt='mower'
        className='gameImg'
        style={{
          left: mousePos.x - 40,
          top: mousePos.y - 40,
        }}
      />
    </div>
  )
}
