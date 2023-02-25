import express from 'express'
import pg from 'pg'
import jwt from "jsonwebtoken";
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const PORT = 3000
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200
}

const pool = new pg.Pool ({
    host: 'localhost',
    port: 5432,
    database: 'capstone',  //name of the database //
    user: 'postgres',
    password: '1234567=='
}) 
 
app.use(express.json())
app.use(cors(corsOptions))

import { createUserRouter } from './routes/users.js'
import { createPageRouter } from './routes/pages.js'
import { createCategoryRouter } from './routes/categories.js'
import { createloginRouter } from './routes/login.js'

app.use('/users', createUserRouter(pool))
app.use('/pages', createPageRouter(pool))
app.use('/categories', createCategoryRouter(pool))
app.use('/login', createloginRouter(pool))


app.listen(PORT, ()=>{
    console.log('Server started at http://localhost:3000')
})
