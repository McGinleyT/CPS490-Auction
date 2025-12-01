// use bcryptjs (already listed in backend/package.json) to avoid native bcrypt build issues
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../db/models/user.js'
import { Post } from '../db/models/post.js'

export async function loginUser({ username, password }) {
  const user = await User.findOne({ username })
  if (!user) {
    throw new Error('invalid username!')
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new Error('invalid password!')
  }
  const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  })
  return token
}
export async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = new User({ username, password: hashedPassword })
  return await user.save()
}

export async function getUserInfoById(userId) {
  try {
    const user = await User.findById(userId).select('username tokens')
    if (!user) {
      return { username: userId, tokens: 0 }
    }
    return {
      username: user.username,
      tokens: user.tokens,
    }
  } catch (err) {
    return { username: userId, tokens: 0 }
  }
}

export async function deleteUserById(userId) {
  await Post.deleteMany({ author: userId })
  const deleted = await User.findByIdAndDelete(userId)
  return deleted
}
