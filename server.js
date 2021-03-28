const express = require('express');
const bcrypt = require('bcrypt-nodejs');    // other bcrypt package can be migrated to
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const Credentials = require('./creds');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : Credentials.POSTGRES_USER,
      password : Credentials.POSTGRES_PASSWORD,
      database : 'ai_lite'
    }
});

const app = express();

app.use(express.json());
// To prevent Access-allow-control-origin error from chrome
app.use(cors());

// TODO: Fix a bug that comes with returning the db.users
app.get('/', (req, res) => {
    req.body
    // res.send(db.users);
});

// Dependency Injection -> The way we have injected the db and bcrypt dependency in the handleRegister function.
// A different definition of handleSignin, Currying is used here. Check the definition in the signin file.
app.post('/signin', signin.handleSignin(db, bcrypt));
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt));
app.get('/profile/:id', (req, res) => profile.fetchProfileByID(req, res, db));

// Understand we do not pass id as a parameter here? Why is it passed in the body of the request?
// TODO: New Feature: Update the count only when the images are unique
app.put('/image', (req, res) => image.updateImageCount(req, res, db));
app.post('/imageUrl', (req, res) => image.handleApiCall(req, res));

app.listen(3000, () => console.log('app is running on port 3000'));

