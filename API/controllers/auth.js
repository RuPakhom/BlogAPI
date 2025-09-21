import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../db.js'

//POST auth/register
const validateRegisterInput = [
  body('email').isEmail().withMessage('Incorrect email').normalizeEmail(),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must contain from 2 to 50 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must contain at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() })
    next()
  },
]

const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, 10)
}

const createUser = async (data) => {
  const passwordHash = await hashPassword(data.password)
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
}

const getUser = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

const registerController = async (req, res) => {
  try {
    const data = req.body
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (existingUser) return res.status(400).json({ errors: 'Email already registered' })
    const newUser = await createUser(data)
    return res.status(201).json({
      newUser,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ errors: 'Internal Server Error' })
  }
}
//POST auth/login
const validateLoginInput = [
  body('email')
    .notEmpty()
    .withMessage('Email is empty')
    .isEmail()
    .withMessage('Incorrect email format')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is empty'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() })
    next()
  },
]

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  })
}

const comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash)
}

const generateAccessToken = (payload) => {
  // eslint-disable-next-line no-undef
  const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '7d' })
  return token
}

const loginController = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const user = await findUserByEmail(email)

    console.dir(user)

    if (!user || !(await comparePassword(password, user.passwordHash)))
      return res.status(401).json({ errors: 'Not correct login or password' })

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    }
    return res.json({ token: generateAccessToken(payload), user: user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ errors: 'Internal Server Error' })
  }
}

const requireAuth = async (req, res, next) => {
  const authorizationHeader = req.headers['authorization']
  if (!authorizationHeader) return res.status(401).json({ error: 'Missing Authorization header' })

  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid token format' })

  try {
    // eslint-disable-next-line no-undef
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    const user = await getUser(payload.id)
    req.user = user
    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

const optionalAuth = async (req, res, next) => {
  const authorizationHeader = req.headers['authorization']
  if (!authorizationHeader) return next()

  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid token format' })

  try {
    // eslint-disable-next-line no-undef
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    console.log(payload)

    const user = await getUser(payload.id)
    req.user = user
    console.log(user)

    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const controller = {
  validateRegister: validateRegisterInput,
  register: registerController,
  validateLogin: validateLoginInput,
  login: loginController,
  auth: requireAuth,
  optionalAuth: optionalAuth,
}

export default controller
