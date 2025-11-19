import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PropTypes from 'prop-types'
import { Header } from '../components/Header.jsx'
import { User } from '../components/User.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getPostById, placeBid } from '../api/posts.js'
import './PostDetail.css'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

function PageShell({ children }) {
  return (
    <div className='main'>
      <Header />
      <div className='auction-page'>{children}</div>
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
    <section className='bid-panel'>
      <h2>Current Bid</h2>
      <p className='bid-current'>
        {currBidAmt ?? 0} <span className='bid-unit'>tokens</span>
      </p>

      <h3>Place a Bid</h3>
      <div className='bid-form'>
        <input
          type='number'
          min='0'
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder='Enter bid amount'
          className='bid-input'
        />
        <button
          onClick={onPlaceBid}
          disabled={isPlacingBid}
          className='bid-button'
        >
          {isPlacingBid ? 'Placing bid...' : 'Place Bid'}
        </button>
      </div>

      {bidError && <p className='error bid-error'>{bidError}</p>}
    </section>
  )
}

function BidHistoryPanel({ bidHistory, isOpen, onToggle }) {
  return (
    <section className='BidHistory'>
      <div className='bid-history-header'>
        <h2>Bid History</h2>
        <button type='button' className='bid-history-toggle' onClick={onToggle}>
          {isOpen ? 'Hide' : `Show (${bidHistory.length || 0})`}
        </button>
      </div>

      {isOpen && (
        <>
          {bidHistory.length === 0 ? (
            <p className='bid-empty'>No bids yet.</p>
          ) : (
            <div className='bid-history-scroll'>
              <ul className='bid-history-list'>
                {bidHistory.map((bid, index) => (
                  <li key={bid._id || index} className='bid-history-item'>
                    <div className='bid-history-main'>
                      <span className='bid-amount'>{bid.amount} tokens</span>
                      <span className='bid-user'>
                        <User id={bid.user} />
                      </span>
                    </div>
                    {bid.createdAt && (
                      <span className='bid-time'>
                        {formatDate(bid.createdAt)}
                      </span>
                    )}
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

  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState(null)
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)

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

      await queryClient.invalidateQueries(['post', postId])
      setBidAmount('')
    } catch (err) {
      setBidError(err.message || 'An error occurred while placing the bid.')
    } finally {
      setIsPlacingBid(false)
    }
  }

  return (
    <PageShell>
      <div className='auction-card'>
        {/* LEFT: Item info */}
        <div className='auction-main'>
          <div className='auction-image-wrapper'>
            <img
              className='auction-image'
              alt='postimage'
              src='/src/assets/redmower.png'
            />
          </div>

          <h1 className='auction-title'>{title}</h1>

          <div className='auction-meta'>
            {author && (
              <p className='auction-seller'>
                <span className='label'>Seller:</span> <User id={author} />
              </p>
            )}

            {createdAt && (
              <p className='auction-created'>
                <span className='label'>Created:</span> {formatDate(createdAt)}
              </p>
            )}

            {endDate && (
              <p className='auction-end'>
                <span className='label'>Ends:</span> {formatDate(endDate)}
              </p>
            )}
          </div>

          <section className='auction-description'>
            <h2>Item Description</h2>
            <p>{contents}</p>
          </section>
        </div>

        {/* RIGHT: Bidding panel */}
        <div className='auction-sidebar'>
          <BidPanel
            currBidAmt={currBidAmt}
            bidAmount={bidAmount}
            setBidAmount={setBidAmount}
            isPlacingBid={isPlacingBid}
            bidError={bidError}
            onPlaceBid={handlePlaceBid}
          />

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
