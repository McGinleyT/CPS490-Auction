import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PropTypes from 'prop-types'
import { Header } from '../components/Header.jsx'
import { User } from '../components/User.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getPostById, placeBid } from '../api/posts.js'
import { getMe } from '../api/users.js'
import { useSocket } from '../contexts/SocketIOContext.jsx'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

function formatCountdown(value = 0) {
  var seconds = parseInt((value / 1000) % 60),
    minutes = parseInt((value / (1000 * 60)) % 60),
    hours = parseInt((value / (1000 * 60 * 60)) % 24),
    days = parseInt(value / (1000 * 60 * 60 * 24))
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return days + ' Days, ' + hours + ':' + minutes + ':' + seconds
}

function PageShell({ children }) {
  return (
    <div>
      <Header />
      <div>{children}</div>
    </div>
  )
}

function BidPanel({
  currBidAmt,
  bidAmount,
  setBidAmount,
  isPlacingBid,
  bidError,
  onPlaceBid,
}) {
  return (
    <section className='containerBid'>
      <strong>Current Bid:</strong>
      <p>{currBidAmt ?? 0} tokens</p>
      <br />
      <strong>Place a Bid:</strong>
      <div>
        <input
          type='number'
          min='0'
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder='Enter bid amount'
        />
        <button onClick={onPlaceBid} disabled={isPlacingBid}>
          {isPlacingBid ? 'Placing bid...' : 'Place Bid'}
        </button>
      </div>

      {bidError && <p>{bidError}</p>}
    </section>
  )
}

function BidHistoryPanel({ bidHistory, isOpen, onToggle }) {
  return (
    <section className='containerBid'>
      <div>
        <strong>Bid History</strong>
        <button type='button' onClick={onToggle}>
          {isOpen ? 'Hide' : `Show (${bidHistory.length || 0})`}
        </button>
      </div>

      {isOpen && (
        <>
          {bidHistory.length === 0 ? (
            <p>No bids yet.</p>
          ) : (
            <div className='list-scroll'>
              <ul>
                {bidHistory.map((bid, index) => (
                  <li key={bid._id || index} className='item'>
                    <div className='list'>
                      <p>{bid.amount} tokens</p>
                      <User id={bid.user} />
                    </div>
                    {bid.createdAt && <h>{formatDate(bid.createdAt)}</h>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export function PostDetail() {
  const { postId } = useParams()
  const queryClient = useQueryClient()
  const [token] = useAuth()
  const { socket } = useSocket()

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(token),
    enabled: !!token,
  })

  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState(null)
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [countdownClock, setCountdown] = useState('') //MONITOR THIS

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
  })

  useEffect(() => {
    if (!socket || !postId) return

    socket.emit('bid.join', { postId })

    const handleBidUpdated = (payload) => {
      if (payload.postId !== postId) return

      // Update the React Query cache for this post
      queryClient.setQueryData(['post', postId], (old) => {
        if (!old) return old
        return {
          ...old,
          currBidAmt:
            payload.currBidAmt !== undefined
              ? payload.currBidAmt
              : old.currBidAmt,
          currBidder: payload.currBidder ?? old.currBidder,
          bidHistory: payload.bidHistory ?? old.bidHistory,
        }
      })

      if (token) {
        queryClient.invalidateQueries(['me'])
      }
    }

    socket.on('bid.updated', handleBidUpdated)

    return () => {
      socket.emit('bid.leave', { postId })
      socket.off('bid.updated', handleBidUpdated)
    }
  }, [socket, postId, queryClient, token])

  if (isLoading) {
    return (
      <PageShell>
        <p>Loading post...</p>
      </PageShell>
    )
  }

  if (isError || !post) {
    return (
      <PageShell>
        <p>Could not load post with id: {postId}.</p>
        {isError && <p>{error.message}</p>}
      </PageShell>
    )
  }

  const {
    title,
    contents,
    author,
    createdAt,
    endDate,
    currBidAmt,
    bidHistory = [],
    image,
  } = post

  setInterval(() => {
    setCountdown(endDate - Date.now())
  }, 1000)

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

      // backend returns { post, user }
      await placeBid(postId, numericAmount, token)

      await queryClient.invalidateQueries(['post', postId])

      // Refresh current user (token balance)
      await queryClient.invalidateQueries(['me'])

      setBidAmount('')
    } catch (err) {
      setBidError(err.message || 'An error occurred while placing the bid.')
    } finally {
      setIsPlacingBid(false)
    }
  }

  return (
    <PageShell>
      <div className='containerPage'>
        <div>
          <div className='imageContainer'>
            <img className='image' alt='postimage' src={image} />
          </div>
          <div className='title'>
            <strong>{title}</strong>
          </div>
          <div className='info'>
            {author && (
              <p>
                <strong>Seller: </strong>
                <User id={author} />
              </p>
            )}

            {createdAt && (
              <p>
                <strong>Created: </strong>
                {formatDate(createdAt)}
              </p>
            )}

            {endDate && (
              <p>
                <strong>Ends: </strong>
                {formatCountdown(
                  endDate - Date.now() > 0 ? countdownClock : '00:00:00',
                )}{' '}
                ({formatDate(endDate)})
              </p>
            )}
            <div>
              <strong>Item Description: </strong>
              <p>{contents}</p>
            </div>
          </div>
        </div>

        <br />

        <div>
          {me && (
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Your tokens:</strong> {me.tokens}
            </p>
          )}

          <BidPanel
            currBidAmt={currBidAmt}
            bidAmount={bidAmount}
            setBidAmount={setBidAmount}
            isPlacingBid={isPlacingBid}
            bidError={bidError}
            onPlaceBid={handlePlaceBid}
          />
          <br />
          <BidHistoryPanel
            bidHistory={bidHistory}
            isOpen={isHistoryOpen}
            onToggle={() => setIsHistoryOpen((open) => !open)}
          />
        </div>
      </div>
    </PageShell>
  )
}

/* ===== PropTypes ===== */

PageShell.propTypes = {
  children: PropTypes.node.isRequired,
}

BidPanel.propTypes = {
  currBidAmt: PropTypes.number,
  bidAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  setBidAmount: PropTypes.func.isRequired,
  isPlacingBid: PropTypes.bool.isRequired,
  bidError: PropTypes.string,
  onPlaceBid: PropTypes.func.isRequired,
}

BidHistoryPanel.propTypes = {
  bidHistory: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      amount: PropTypes.number.isRequired,
      user: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
    }),
  ).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
}
