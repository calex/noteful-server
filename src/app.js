require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const notesRouter = require('./notes/notes-router')
const foldersRouter = require('./folders/folders-router')

const app = express()
app.use(cors())

const { NODE_ENV } = require('./config')

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())

// app.use(function validateBearerToken(req, res, next) {
//   const authToken = req.get('Authorization')
//   const bearerToken = authToken.split(' ')[1]

//   if (!authToken || bearerToken !== API_TOKEN) {
//     return res.status(401).json({ error: 'Unauthorized request' })
//   }

//   next()
// })

app.use('/api/notes', notesRouter)
app.use('/api/folders', foldersRouter)

app.use((error, req, res, next) => {
  let response;

  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }

  res.status(500).json(response);
});  

module.exports = app;