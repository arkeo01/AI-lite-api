const express = require('express');
const bcrypt = require('bcrypt-nodejs');    // other bcrypt package can be migrated to
const cors = require('cors');

const db = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'versilio',
      password : 'aniket123',
      database : 'ai_lite'
    }
});

const app = express();

// To parse the json data
app.use(express.json());
// To prevent Access-allow-control-origin error from chrome
app.use(cors());

app.get('/', (req, res) => {
    req.body
    // res.send(database.users);
});

app.post('/signin', (req, res) => {    

    db.select('email', 'hash')
        .from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if(isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => res.json(user[0]))
                    .catch(err => res.status(400).json('Error while fetching user!'))
            }else{
                res.status(400).json('Wrong Credentials!')
            }
        })
        .catch(err => res.status(400).json('Wrong Credentials'))
});

app.post('/register', (req, res) => {
    const {email, name, password} = req.body;

    const hash = bcrypt.hashSync(password);
    
    db.transaction(trx => {
        trx.insert({
            hash,
            email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                        joined: new Date()
                    })
                    .then(user => res.json(user[0]))
                    .catch(err => res.status(400).json('Error while registering user!'))
            })
            .then(trx.commit)
            .catch(trx.rollback);
    })

});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;

    db.select('*').from('users').where({id})
        .then(user => {
            if(user.length)
                res.json(user[0])
            else
                res.status(400).json('User not found!');
        })
        .catch(err => res.status(400).json('error getting user!'));
});

// Understand we do not pass id as a parameter here? Why is it passed in the body of the request?
// TODO: New Feature: Update the count only when the images are unique
app.put('/image', (req, res) => {
    const { id } = req.body;

    db('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => res.json(entries[0]))
        .catch(err => res.status(400).json('Unable to get entries!'))
})



app.listen(3000, () => console.log('app is running on port 3000'));


/*
INTIAL API DESIGN

/ --> res= this is working 
/signin --> POST = Success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/

