import express from 'express';
import cors  from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { auth, login, refreshToken } from './middleware/auth';

dotenv.config()

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

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});