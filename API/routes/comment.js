import { Router } from 'express'
import { controller } from '../controllers/comment.js'
import authController from '../controllers/auth.js'
import postController from '../controllers/post.js'

const router = Router({ mergeParams: true })

router.post(
  '/',
  authController.optionalAuth,
  postController.getPost,
  controller.validateComment,
  controller.post
)

router.get('/', postController.getPost, controller.getAll)

router.get('/:commentId', postController.getPost, controller.getComment)

router.put(
  '/:commentId',
  authController.auth,
  postController.getPost,
  controller.checkOwnership,
  controller.validateComment,
  controller.update
)

router.delete(
  '/:commentId',
  authController.auth,
  postController.getPost,
  controller.checkOwnership,
  controller.delete
)

export default router
