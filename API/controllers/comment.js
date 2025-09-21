import prisma from '../db.js'
import { body, validationResult } from 'express-validator'

const createComment = async (data) => {
  const newComment = await prisma.comment.create({
    data: {
      authorName: data.authorName,
      email: data.email ?? null,
      userId: data.userId ?? null,
      content: data.content,
      postId: data.postId,
    },
  })
  return newComment
}

const validateComment = [
  body('authorName')
    .if((value, { req }) => {
      return !req.user
    })
    .trim()
    .notEmpty()
    .withMessage('Please specify your name')
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be from 3 to 30 chars')
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

const validateCommentUpdate = [
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

const createCommentController = async (req, res) => {
  const data = {}
  if (req.user) {
    data.authorName = req.user.name
    data.email = req.user.email
    data.userId = req.user.id
  } else {
    data.authorName = req.body.authorName
  }
  data.content = req.body.content
  data.postId = req.post.id
  try {
    const newComment = await createComment(data)
    return res.status(201).json({ comment: newComment })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getCommentsByPostId = async (postId) => {
  return await prisma.comment.findMany({
    where: {
      postId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
  })
}

const getCommentsById = async (id, postId) => {
  return await prisma.comment.findFirst({
    where: {
      id,
      postId,
      deletedAt: null,
    },
  })
}

const getAll = async (req, res) => {
  const postId = req.post.id
  try {
    const comments = await getCommentsByPostId(postId)
    return res.status(200).json({ comments })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getSingleComment = async (req, res) => {
  try {
    const postId = Number(req.post.id)
    const commentId = Number(req.params.commentId)
    const comment = await getCommentsById(commentId, postId)
    if (!comment) return res.status(404).json({ error: 'Comment not Found' })
    return res.status(200).json({ comment })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const editCommentById = async (id, postId, data) => {
  return await prisma.comment.update({
    where: { id, postId, deletedAt: null },
    data: { content: data.content, edited: true },
  })
}

const update = async (req, res) => {
  try {
    const commentId = Number(req.params.commentId)
    const postId = Number(req.post.id)
    const data = {}
    data.content = req.body.content
    const edited = await editCommentById(commentId, postId, data)
    if (!edited) return res.status(404).json({ error: 'Comment not found' })

    return res.status(200).json({ comment: edited })
  } catch (err) {
    console.error(err)
    res.status(500).json('Internal Server Error')
  }
}

const checkCommentOwnership = async (req, res, next) => {
  const commentId = Number(req.params.commentId)
  const comment = await getCommentsById(commentId, req.post.id)
  if (!comment) return res.status(404).json({ error: 'Comment not found' })

  if (req.user.role === 'ADMIN' || req.user.id === comment.userId) {
    return next()
  } else {
    return res.status(403).json({ error: 'Not authorized action' })
  }
}

const deleteComment = async (commentId, postId) => {
  return await prisma.comment.update({
    where: {
      id: commentId,
      postId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

const deleteController = async (req, res) => {
  try {
    const commentId = Number(req.params.commentId)
    const postId = Number(req.post.id)
    const deleted = await deleteComment(commentId, postId)
    if (!deleted) return res.status(404).json({ error: 'Not Found' })
    return res.status(200).json({ comment: deleted })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const controller = {
  validateComment: validateComment,
  post: createCommentController,
  getAll: getAll,
  getComment: getSingleComment,
  validateUpdate: validateCommentUpdate,
  update: update,
  checkOwnership: checkCommentOwnership,
  delete: deleteController,
}
export default controller
