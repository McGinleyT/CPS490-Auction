import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from '../components/Header.jsx'
import { User } from '../components/User.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getPostById, placeBid } from '../api/posts.js'

export function PostDetail() {
  const { postId } = useParams()
  const queryClient = useQueryClient()
  const [token] = useAuth()
  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState(null)
  const [isPlacingBid, setIsPlacingBid] = useState(false)

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
  })

  if (isLoading) {
    return (
      <div className='main'>
        <Header />
        <p>Loading post...</p>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className='main'>
        <Header />
        <p>Could not load post with id: {postId}.</p>
        {isError && <p>{error.message}</p>}
      </div>
    )
  }

  const {
    title,
    contents,
    author,
    createdAt,
    currBidAmt,
    bidHistory = [],
  } = post

  const handlePlaceBid = async () => {
    setBidError(null)

    const numericAmount = Number(bidAmount)
    if (!Number.isFinite(numericAmount)) {
      setBidError('Please enter a valid number.')
      return
    }

    if (!token) {
      setBidError('You must be logged in to place a bid.')
      return
    }

    try {
      setIsPlacingBid(true)

      const updatedPost = await placeBid(postId, numericAmount, token)

      if (!updatedPost) {
        setBidError('Failed to place bid.')
        return
      }

      // Refetch the post so React Query updates the cached data
      await queryClient.invalidateQueries(['post', postId])
      setBidAmount('')
    } catch (err) {
      setBidError(err.message || 'An error occurred while placing the bid.')
    } finally {
      setIsPlacingBid(false)
    }
  }

  return (
    <div className='main'>
      <Header />
      <article className='Post PostDetail'>
        <img alt='postimage' src='./src/assets/redmower.png' />

        <h1>{title}</h1>

        {createdAt && (
          <p>
            <strong>Created:</strong> {new Date(createdAt).toLocaleString()}
          </p>
        )}

        <p>{contents}</p>

        {author && (
          <p>
            <User id={author} />
          </p>
        )}

        <section className='BidSection'>
          <h2>Current Bid</h2>
          <p>
            <strong>Current bid:</strong> {currBidAmt ?? 0} tokens
          </p>

          <h3>Place a bid</h3>
          <div>
            <input
              type='number'
              min='0'
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder='Enter bid amount'
            />
            <button onClick={handlePlaceBid} disabled={isPlacingBid}>
              {isPlacingBid ? 'Placing bid...' : 'Place Bid'}
            </button>
          </div>
          {bidError && <p className='error'>{bidError}</p>}
        </section>

        <section className='BidHistory'>
          <h2>Bid History</h2>
          {bidHistory.length === 0 ? (
            <p>No bids yet.</p>
          ) : (
            <ul>
              {bidHistory.map((bid, index) => (
                <li key={bid._id || index}>
                  <strong>{bid.amount} tokens</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </div>
  )
}
