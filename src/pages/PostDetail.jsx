import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Header } from '../components/Header.jsx'
import { User } from '../components/User.jsx'
import { getPostById } from '../api/posts.js'

export function PostDetail() {
  const { postId } = useParams()

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

  const { title, contents, author, createdAt } = post

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
      </article>
    </div>
  )
}
