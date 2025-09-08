import express from 'express'

const app = express()

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

app.listen(3000, () => {
  console.log('Server runs on port 3000')
})
