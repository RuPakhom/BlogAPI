import { Router } from 'express'
import { controller } from '../controllers/auth.js'

const router = Router()

router.post('/register', controller.validateRegister, controller.register)
router.post('/login', controller.validateLogin, controller.login)

export default router
