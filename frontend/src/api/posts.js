export const getPosts = async (queryParams) => {
  try {
    console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL)
    const url = new URL('posts', import.meta.env.VITE_BACKEND_URL)

    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })

    const res = await fetch(url.toString())
    return await res.json()
  } catch (err) {
    console.error('error fetching posts:', err)
  }
}

export const createPost = async (token, post) => {
  try {
    const url = new URL('posts', import.meta.env.VITE_BACKEND_URL)
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    })
    return await res.json()
  } catch (err) {
    console.error('error creating posts:', err)
  }
}

export const getPostById = async (id) => {
  try {
    const url = new URL(`posts/${id}`, import.meta.env.VITE_BACKEND_URL)
    const res = await fetch(url.toString())

    if (!res.ok) {
      throw new Error(
        `Failed to fetch post with id ${id} (status ${res.status})`,
      )
    }

    return await res.json()
  } catch (err) {
    console.error('error fetching single post:', err)
    throw err
  }
}

export const placeBid = async (postId, amount, token) => {
  try {
    const url = new URL(
      `posts/${postId}/bids`,
      import.meta.env.VITE_BACKEND_URL,
    )
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.error || 'failed to place bid')
    }

    return data
  } catch (err) {
    console.error('error placing a bid:', err)
    throw err
  }
}
