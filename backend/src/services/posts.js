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
  // normalize sortOrder to 1 (asc) or -1 (desc) to avoid passing unexpected strings to mongoose
  const order =
    sortOrder === 'descending' || sortOrder === 'desc' || sortOrder === -1
      ? -1
      : 1

  const posts = await Post.find(query).sort({ [sortBy]: order })
  try {
    console.info('[posts] listPosts', { query, sortBy, sortOrder, count: posts.length })
  } catch (e) {
    // ignore logging errors
  }
  return posts
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

  const isCurrentBidder =
    post.currBidder && post.currBidder.toString() === user._id.toString()

  // How many tokens does this user effectively have available for this bid?
  // If they are already the highest bidder, their previous bid is "locked"
  // in this post, so we treat that amount as available for raising.
  let effectiveTokens = user.tokens
  if (isCurrentBidder) {
    effectiveTokens += post.currBidAmt
  }

  if (amount > effectiveTokens) {
    throw new Error('not enough tokens')
  }

  // Refund previous highest bidder if it was someone else
  if (post.currBidder && post.currBidAmt > 0 && !isCurrentBidder) {
    const prevBidder = await User.findById(post.currBidder)
    if (prevBidder) {
      prevBidder.tokens += post.currBidAmt
      await prevBidder.save()
    }
  }

  // Now charge the new highest bidder
  if (isCurrentBidder) {
    // They already had post.currBidAmt locked here, so the net cost is (amount - oldBid)
    user.tokens = effectiveTokens - amount // (tokens + oldBid) - newBid
  } else {
    user.tokens -= amount
  }
  await user.save()

  // Update the post
  post.currBidAmt = amount
  post.currBidder = user._id
  post.bidHistory.push({ user: user._id, amount })
  await post.save()

  return { post, user }
}
