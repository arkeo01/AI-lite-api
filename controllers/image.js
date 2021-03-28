const Clarifai = require('clarifai');
const Credentials = require('../creds');

const app = new Clarifai.App({
    apiKey: Credentials.CLARIFAI_API_KEY
});

// Here instead of ImageUrl, input is passed as it would give an error and 
// it is an advanced topic about the way setState works
const handleApiCall = (req, res) => {
    app.models
        .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
        .then(data => {
            res.json(data);
        })
        .catch(err => res.status(400).json('Unable to work with API'));
}

const updateImageCount = (req, res, db) => {
    const { id } = req.body;

    db('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => res.json(entries[0]))
        .catch(err => res.status(400).json('Unable to get entries!'))
}

module.exports = {
    updateImageCount,
    handleApiCall
}