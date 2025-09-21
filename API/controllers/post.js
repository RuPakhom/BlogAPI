import prisma from '../db.js'
import { body, validationResult } from 'express-validator'

const validateCreatePostInput = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage("Title can't be empty")
    .isLength({ min: 2, max: 150 })
    .withMessage('Title must be from 2 to 150 chars')
    .escape(),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content required')
    .isLength({ min: 2, max: 20000 })
    .withMessage('Content must be from 2 to 20k characters'),
  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  },
]

const createPost = async (data) => {
  return await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      published: data.published,
      publishedAt: data.published ? new Date() : null,
      authorId: data.authorId,
    },
  })
}

const createPostController = async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      content: req.body.content,
      published: Boolean(req.body.published),
      authorId: req.user.id,
    }
    const newPost = await createPost(data)
    return res.status(201).json(newPost)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getAllPostsController = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        comments: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
    return res.status(200).json({ posts })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId)
    console.log(req.params.postId)
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        comments: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
    if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' })
    req.post = post
    return next()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getPostByIdController = (req, res) => {
  res.status(200).json({ post: req.post })
}

const validateUpdatePostInput = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage("Title can't be empty")
    .isLength({ min: 2, max: 150 })
    .withMessage('Title must be from 2 to 150 chars')
    .escape(),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content required')
    .isLength({ min: 2, max: 20000 })
    .withMessage('Content must be from 2 to 20k characters'),
  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  },
]

const checkPostOwnership = (req, res, next) => {
  if (req.user.role === 'ADMIN' || req.user.id === req.post.authorId) {
    return next()
  } else {
    return res.status(403).json({ error: 'Not authorized action' })
  }
}

const updatePostController = async (req, res) => {
  try {
    const data = req.body
    const currentPublished = req.post.published
    const newPublished = Boolean(req.body.published)
    let publishedAt = null

    if (!currentPublished && newPublished) {
      publishedAt = new Date()
    } else if (currentPublished && !newPublished) {
      publishedAt = null
    } else {
      publishedAt = data.publishedAt
    }
    const post = await prisma.post.update({
      where: {
        id: req.post.id,
      },
      data: {
        title: data.title,
        content: data.content,
        published: newPublished,
        publishedAt: publishedAt,
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        publishedAt: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return res.status(200).json({ post })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const deletePostController = async (req, res) => {
  try {
    if (req.post.deletedAt) {
      return res.status(400).json({ error: 'Post already deleted' })
    }
    const deleted = await prisma.post.update({
      where: {
        id: req.post.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    res.status(200).json({ post: deleted })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const controller = {
  validatePost: validateCreatePostInput,
  create: createPostController,
  getPost: getPost,
  getAll: getAllPostsController,
  getPostByIdController: getPostByIdController,
  validatePostUpdate: validateUpdatePostInput,
  checkOwnership: checkPostOwnership,
  update: updatePostController,
  delete: deletePostController,
}

export default controller
