import {
  createUser,
  loginUser,
  getUserInfoById,
  deleteUserById,
} from '../services/users.js'
import { requireAuth } from '../middleware/jwt.js'

export function userRoutes(app) {
  app.post('/api/v1/user/signup', async (req, res) => {
    try {
      const user = await createUser(req.body)
      return res.status(201).json({ username: user.username })
    } catch (err) {
      console.error('error adding user:', err)
      return res.status(400).json({
        error: 'failed to create the user, does the username already exist?',
      })
    }
  })

  app.post('/api/v1/user/login', async (req, res) => {
    try {
      const token = await loginUser(req.body)
      return res.status(200).send({ token })
    } catch (err) {
      return res.status(400).send({
        error: 'login failed, did you enter the correct username/password?',
      })
    }
  })

  app.get('/api/v1/users/:id', async (req, res) => {
    const userInfo = await getUserInfoById(req.params.id)
    return res.status(200).send(userInfo)
  })

  app.delete('/api/v1/user/me', requireAuth, async (req, res) => {
    const userId = req.auth?.sub
    if (!userId) {
      return res.status(401).json({ error: 'not authorized' })
    }

    const deleted = await deleteUserById(userId)
    if (!deleted) {
      return res.status(404).json({ error: 'user not found' })
    }

    return res.status(200).json({ message: 'account deleted' })
  })
}
