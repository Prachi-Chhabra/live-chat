const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const ws = require('ws');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('events').EventEmitter.defaultMaxListeners = 20;

dotenv.config();

/* mongoose.connect(process.env.MONGO_URL, (err) => {
    if (err) throw err;
}); */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

    } catch (err) {
        throw err;
    }
};
/*const cleanupUsers = async () => {
    try {
        const result = await User.deleteMany({ username: '' });
        //console.log(`Cleanup completed. Removed ${result.deletedCount} users with empty usernames.`);
    } catch (err) {
        //console.error('Error during cleanup:', err.message);
    }
};
const startServer = async () => {
    await connectDB();
    await cleanupUsers();
};
*/


const jwtsecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}))
app.get('/test', (req, res) => {
    res.json('test ok');
});
app.get('/profile', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, jwtsecret, {}, (err, userData) => {
            if (err) throw err;
            const { id, username } = userData;
            res.json(userData);
        });
    } else {
        res.status(401).json('no token');
    }

});
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findOne({ username });
    if (foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({ userId: foundUser._id, username }, jwtsecret, {}, (err, token) => {
                res.cookie('token', token, { sameSite: 'none', secure: true }).json({
                    id: foundUser._id,

                });
            });
        }
    }
});
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({ username: username, password: hashedPassword });
        jwt.sign({ userId: createdUser._id, username }, jwtsecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie("token", token, { sameSite: 'none', secure: true }).status(201).json({
                id: createdUser._id,

            });
        });
    } catch (err) {
        if (err) throw err;
        res.status(500).json("error");
    }
});


const server = app.listen(4040);

const wss = new ws.WebSocketServer([server]);
wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtsecret, {}, (err, userData) => {
                    if (err) throw err;

                })
            }
        }
    }
});
//mongodb password: iWQCyNI75ScHdCX4

