const express = require('express');
const bcrypt = require('bcrypt-nodejs');    // other bcrypt package can be migrated to
const cors = require('cors');

const app = express();

// To parse the json data
app.use(express.json());
// To prevent Access-allow-control-origin error from chrome
app.use(cors());

// Creating a temporary object for now but this data will be fetched from the database
const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ],
    login : [
        {
            id: '987',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}

// TODO: Fix this function and use it in /profile and /image routes
function matchUser(id){
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            return {
                found,
                user
            }
        }
    });
    if(!found) {
        return {
            found
        }
    }
}

app.get('/', (req, res) => {
    req.body
    res.send(database.users);
});

app.post('/signin', (req, res) => {

    // Load hash from your password DB.
    // bcrypt.compare("apples", '$2a$10$4sXA9BGYBR7y8n3t7tcxL.sEGa9jKB3As6eS.UB0uj8fWBnDxwKlG', function(err, res) {
    //     console.log('First Guess ', res);
    // });
    // bcrypt.compare("veggies", '$2a$10$4sXA9BGYBR7y8n3t7tcxL.sEGa9jKB3As6eS.UB0uj8fWBnDxwKlG', function(err, res) {
    //     console.log('Second Guess ', res);
    // });
    

    database.users.forEach(user => {
        if(req.body.email === user.email && req.body.password === user.password) {
            found = true
            return res.json(user);
        }
    });
    if(!found) {
        res.status(400).json('Invalid Credentials!');
    }
});

// TODO: Implement checks for uniqueness of user
app.post('/register', (req, res) => {
    const {email, name, password} = req.body;

    bcrypt.hash(password, null, null, function(err, hash) {
        console.log(hash);
    });
    
    database.users.push({
        // TODO: Implement function for creating random ids
        id: '125',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    });
    res.json(database.users[database.users.length - 1]);
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            return res.json(user);
        }
    });
    if(!found) {
        res.status(400).json('User not found!');
    }

    // const fetchUser = matchUser(id);
    // // res.json(fetchUser);
    // fetchUser.found ? res.json(fetchUser.user) : res.status(400).json('User not found!');
});

// Understand we do not pass id as a parameter here? Why is it passed in the body of the request?
// TODO: New Feature: Update the count only when the images are unique
app.put('/image', (req, res) => {
    const { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    });
    if(!found) {
        res.status(400).json('User not found!');
    }
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

