require('dotenv').config()
const express = require('express')
const routes = require('./routes')
const connectDB = require('./config/db')
const cors = require('cors')
const app = express()
// import routes


app.use(cors())
connectDB()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// routes
app.use('/api', routes)
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/managers', require('./routes/managers'))
app.use('/api/available-spots', require('./routes/findAvalibleSpots'))
app.use('api/create-admin', require('./routes/createAdmin'))

//payment route
app.use('/api/payment', require('./routes/payment'))

// server connection
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
