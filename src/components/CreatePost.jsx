import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createPost } from '../api/posts.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export function CreatePost() {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowMillis = tomorrow.getTime()
  const [token] = useAuth()
  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [endDate, setEndDate] = useState(tomorrowMillis)
  const queryClient = useQueryClient()
  const createPostMutation = useMutation({
    mutationFn: () => createPost(token, { title, contents, endDate }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(tomorrow.toJSON().slice(0, 23))
    console.log('Submitting:', { title, contents, endDate })
    createPostMutation.mutate()
  }

  if (!token)
    return (
      <strong className='flex justify-center'>
        Please log in to create new posts.
      </strong>
    )

  return (
    <form onSubmit={handleSubmit} className='CreatePost'>
      <strong>Create a New Auction Post</strong>
      <br />
      <label htmlFor='create-title'>Title: </label>
      <input
        type='text'
        name='create-title'
        id='create-title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <label htmlFor='contents'>Description: </label>
      <textarea
        name='contents'
        value={contents}
        onChange={(e) => setContents(e.target.value)}
      />
      <br />
      <label htmlFor='endDate'>Auction end date and time:</label>
      <input
        id='endDate'
        type='datetime-local'
        step={0}
        min={today.toJSON().slice(0, 16)}
        defaultValue={tomorrow.toJSON().slice(0, 16)}
        onChange={(e) => setEndDate(e.target.valueAsNumber)}
      />
      <br />
      <input
        type='submit'
        value={createPostMutation.isPending ? 'Creating...' : 'Create'}
        disabled={!title || createPostMutation.isPending}
      />
      {createPostMutation.isSuccess ? (
        <>
          <br />
          Post created Successfully!
        </>
      ) : null}
    </form>
  )
}
