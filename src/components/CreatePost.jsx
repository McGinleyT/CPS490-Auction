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

  //Dear God fix this later please
  const defaultImage =
    'data:image/png;base64,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'

  const [image, setImage] = useState(defaultImage)
  const queryClient = useQueryClient()
  const createPostMutation = useMutation({
    mutationFn: () => createPost(token, { title, contents, endDate, image }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(image)
    console.log('Submitting:', { title, contents, endDate, image })
    createPostMutation.mutate()
    console.log('Submitted:', { title, contents, endDate, image })
    //reset form if mutation worked?
    // setTitle('')
    // setContents('')
    // setEndDate(tomorrowMillis)
    // setImage(defaultImage)
  }

  if (!token)
    return (
      <form onSubmit={handleSubmit} className='container'>
        <strong>Please log in to create new posts.</strong>
      </form>
      // do we need on submit here
    )

  return (
    <form onSubmit={handleSubmit} className='container'>
      <strong>Create a New Auction Post</strong>
      <br />
      <label htmlFor='image-upload'>Add an image:</label>
      <input
        type='file'
        id='image-upload'
        accept='image/*'
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
              setImage(reader.result)
            }
          }
        }}
      />
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
