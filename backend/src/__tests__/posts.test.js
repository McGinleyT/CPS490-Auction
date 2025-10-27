import mongoose from 'mongoose'
import { describe, expect, test, beforeEach } from '@jest/globals'

import {
  createPost,
  listAllPosts,
  listPostsByAuthor,
  listPostsByTag,
  deletePost,
  getPostById,
  updatePost,
} from '../services/posts.js'
import { Post } from '../db/models/post.js'

describe('creating posts', () => {
  test('with all parameters should succeed', async () => {
    const post = {
      title: 'Hello Mongoose!',
      author: 'Daniel Bugl',
      contents: 'This post is stored in a MongoDB database using Mongoose.',
      tags: ['mongoose', 'mongodb'],
    }
    const createdPost = await createPost(post)
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId)
    const foundPost = await Post.findById(createdPost._id)
    expect(foundPost).toEqual(expect.objectContaining(post))
    expect(foundPost.createdAt).toBeInstanceOf(Date)
    expect(foundPost.updatedAt).toBeInstanceOf(Date)
  })

  test('without title should fail', async () => {
    const post = {
      author: 'Daniel Bugl',
      contents: 'Post with no title',
      tags: ['empty'],
    }
    try {
      await createPost(post)
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.message).toContain('`title` is required')
    }
  })

  test('with minimal parameters should succeed', async () => {
    const post = {
      title: 'Only a title',
    }
    const createdPost = await createPost(post)
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId)
  })
})

const samplePosts = [
  { title: 'Learning Redux', author: 'Daniel Bugl', tags: ['redux'] },
  { title: 'Learn React Hooks', author: 'Daniel Bugl', tags: ['react'] },
  {
    title: 'Full-Stack React Projects',
    author: 'Daniel Bugl',
    tags: ['react', 'nodejs'],
  },
  { title: 'Guide to TypeScript' },
]

let createdSamplePosts = []

beforeEach(async () => {
  await Post.deleteMany({})
  createdSamplePosts = []
  for (const post of samplePosts) {
    const createdPost = new Post(post)
    createdSamplePosts.push(await createdPost.save())
  }
})

describe('listing posts', () => {
  test('should return all posts', async () => {
    const posts = await listAllPosts()
    expect(posts.length).toEqual(createdSamplePosts.length)
  })

  test('should return posts sorted by creation date descending by default', async () => {
    const posts = await listAllPosts()
    const sortedSamplePosts = createdSamplePosts.sort(
      (a, b) => b.createdAt - a.createdAt,
    )
    expect(posts.map((post) => post.createdAt)).toEqual(
      sortedSamplePosts.map((post) => post.createdAt),
    )
  })

  test('should take into account provided sorting options', async () => {
    const posts = await listAllPosts({
      sortBy: 'updatedAt',
      sortOrder: 'ascending',
    })

    const sortedSamplePosts = createdSamplePosts.sort(
      (a, b) => a.updatedAt - b.updatedAt,
    )
    expect(posts.map((post) => post.updatedAt)).toEqual(
      sortedSamplePosts.map((post) => post.updatedAt),
    )
  })
})

test('should be able to filter posts by author', async () => {
  const posts = await listPostsByAuthor('Daniel Bugl')
  expect(posts.length).toBe(3)
})

test('should be able to filter by tag', async () => {
  const posts = await listPostsByTag('nodejs')
  expect(posts.length).toBe(1)
})

describe('single post operations', () => {
  test('should get a single post by id', async () => {
    const toCreate = {
      title: 'Find me by id',
      author: 'Tester',
      contents: 'Look-up content',
      tags: ['single', 'get'],
    }
    const created = await createPost(toCreate)
    const fetched = await getPostById(created._id)

    expect(fetched._id.toString()).toBe(created._id.toString())
    expect(fetched).toEqual(expect.objectContaining(toCreate))
  })

  test('should update a post and return the updated document', async () => {
    const original = await createPost({
      title: 'Old title',
      author: 'Updater',
      contents: 'Old contents',
      tags: ['old'],
    })

    const updated = await updatePost(original._id, {
      title: 'New title',
      author: 'Updater',
      contents: 'New contents',
      tags: ['new', 'updated'],
    })

    expect(updated._id.toString()).toBe(original._id.toString())
    expect(updated).toEqual(
      expect.objectContaining({
        title: 'New title',
        author: 'Updater',
        contents: 'New contents',
        tags: ['new', 'updated'],
      }),
    )

    // double-check persisted state
    const fromDb = await Post.findById(original._id)
    expect(fromDb.title).toBe('New title')
    expect(fromDb.contents).toBe('New contents')
  })

  test('should delete a post by id', async () => {
    const created = await createPost({
      title: 'Delete me',
      author: 'Remover',
      contents: 'Temporary',
      tags: ['temp'],
    })

    const result = await deletePost(created._id)
    expect(result.deletedCount).toBe(1)

    const after = await Post.findById(created._id)
    expect(after).toBeNull()
  })
})
