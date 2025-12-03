export const getPosts = async (queryParams) => {
  // validate backend base URL early to avoid silent failures
  const base = import.meta.env.VITE_BACKEND_URL
  if (!base) {
    const err = new Error('VITE_BACKEND_URL is not set')
    console.error('[posts] getPosts error:', err)
    throw err
  }

  try {
    console.log('[posts] Backend URL:', base)
    const url = new URL('posts', base)

    if (queryParams) {
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
      })
    }

    console.info('[posts] GET', url.toString())
    const res = await fetch(url.toString())
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const err = new Error(`failed to fetch posts (status ${res.status}): ${text}`)
      console.error('[posts] getPosts non-ok response:', err)
      throw err
    }

    return await res.json()
  } catch (err) {
    console.error('[posts] error fetching posts:', err)
    // rethrow so react-query receives the error and you can see it in DevTools
    throw err
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
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const err = new Error(`createPost failed (status ${res.status}): ${text}`)
      console.error('[posts] createPost non-ok response:', err)
      throw err
    }

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
