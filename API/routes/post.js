import { Router } from 'express'
import { controller } from '../controllers/post.js'
import authController from '../controllers/auth.js'

import commentRouter from './comment.js'

const router = Router()

router.post('/', authController.auth, controller.validatePost, controller.create)

router.get('/', controller.getAll)

router.use('/:postId/comments', commentRouter)

router.get('/:postId', controller.getPost, controller.getPostByIdController)

router.put(
  '/:postId',
  authController.auth,
  controller.getPost,
  controller.checkOwnership,
  controller.validatePostUpdate,
  controller.update
)

router.delete(
  '/:postId',
  authController.auth,
  controller.getPost,
  controller.checkOwnership,
  controller.delete
)

export default router
