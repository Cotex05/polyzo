import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

// Routes import 
import postRouter from "./Routes/postRoute.js";
import userRouter from "./Routes/userRoute.js"

// Auth configs
import authMiddleware from './configs/authMiddleware.js';


// Vars
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
app.use("/", authMiddleware); // for the api call authorization using firebase

// mongoDB config
const uri = process.env.ATLAS_URI;
// const uri = "mongodb://localhost:27017/polyzoDB";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});

// Connection
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

// routes
app.use('/post', postRouter);
app.use('/user', userRouter);

// REST 
app.get("/", (req, res) => {
    res.send({ msg: "Welcome to polyzo!" });
});


// listener config
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});