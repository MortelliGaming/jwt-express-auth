import dotenv from 'dotenv';
dotenv.config()

import express from 'express';
import cors  from 'cors';
import bodyParser from 'body-parser';
import { auth, login, refreshToken } from './middleware/auth';
import { sequelize } from './database';

const app = express();
const port = process.env.PORT || '3000';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// enable cors
app.use(cors({
    origin: ['*'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// login and refresh endpoints
app.post('/login', login)
app.post('/refreshToken', refreshToken)

app.get('/secure-route', auth, (req, res) => {
    res.status(200).send({
        message: 'authorized'
    })
});

// check database connection
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
    app.listen(port, () => {
        return console.log(`Express is listening at http://localhost:${port}`);
    });
}).catch((error: any) => {
    console.error('Unable to connect to the database:', error);
})