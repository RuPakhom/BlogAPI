import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()

import postRouter from './routes/post.js'
import authRouter from './routes/auth.js'

const app = express()

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(
  express.urlencoded({
    extended: true,
  })
)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.get('/hello', (req, res) => {
  res.send('Hello, world!')
})

app.use('/auth', authRouter)
app.use('/posts', postRouter)

app.listen(3000, () => {
  console.log('Server runs on port 3000')
})
