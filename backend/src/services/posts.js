import { Post } from '../db/models/post.js'
import { User } from '../db/models/user.js'

export async function createPost(
  userId,
  { title, contents, tags, endDate, image },
) {
  console.log('inside services createPost')
  const post = new Post({
    title,
    author: userId,
    contents,
    tags,
    endDate,
    image,
  })
  return await post.save()
}

async function listPosts(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  return await Post.find(query).sort({ [sortBy]: sortOrder })
}

export async function listAllPosts(options) {
  return await listPosts({}, options)
}

export async function listPostsByAuthor(authorUsername, options) {
  const user = await User.findOne({ username: authorUsername })
  if (!user) return []
  return await listPosts({ author: user._id }, options)
}

export async function listPostsByTag(tags, options) {
  return await listPosts({ tags }, options)
}

export async function getPostById(postID) {
  return await Post.findById(postID)
}

export async function updatePost(
  userId,
  postID,
  { title, contents, tags, endDate, image },
) {
  return await Post.findOneAndUpdate(
    { _id: postID, author: userId },
    { $set: { title, contents, tags, endDate, image } },
    { new: true },
  )
}

export async function deletePost(userId, postId) {
  return await Post.deleteOne({ _id: postId, author: userId })
}

export async function placeBid(userId, postId, amount) {
  const post = await Post.findById(postId)
  if (!post) {
    throw new Error('post not found')
  }
  if (amount <= post.currBidAmt) {
    throw new Error('bid must be higher than current bid')
  }
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('user not found')
  }
  if (user.tokens < amount) {
    throw new Error('not enough tokens')
  }
  post.currBidAmt = amount
  post.currBidder = user._id
  post.bidHistory.push({ user: user._id, amount })
  await post.save()
  return post
}
