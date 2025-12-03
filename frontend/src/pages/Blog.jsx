import { useQuery } from '@tanstack/react-query'
import { PostList } from '../components/PostList.jsx'
import { CreatePost } from '../components/CreatePost.jsx'
import { PostFilter } from '../components/PostFilter.jsx'
import { PostSorting } from '../components/PostSorting.jsx'
import { getPosts } from '../api/posts.js'
import { useState } from 'react'
import { Header } from '../components/Header.jsx'

export function Blog() {
  const [author, setAuthor] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('descending')
  const postsQuery = useQuery({
    queryKey: ['posts', { author, sortBy, sortOrder }],
    queryFn: () => getPosts({ author, sortBy, sortOrder }),
  })

  const posts = postsQuery.data ?? []

  return (
    <div>
      <Header />
      <CreatePost />
      <div className='containerFit'>
        <PostFilter
          field='author'
          value={author}
          onChange={(value) => setAuthor(value)}
        />
        <br />
        <PostSorting
          fields={['createdAt', 'updatedAt']}
          value={sortBy}
          onChange={(value) => setSortBy(value)}
          orderValue={sortOrder}
          onOrderChange={(orderValue) => setSortOrder(orderValue)}
        />
      </div>
      <PostList posts={posts} />
    </div>
  )
}
