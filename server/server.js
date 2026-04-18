const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const movieModel = require('./movie-model.js');

const app = express();

app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'files')));

/* GET /genres */
app.get('/genres', function (req, res) {
  const genresSet = new Set();

  Object.values(movieModel).forEach(movie => {
    movie.Genres.forEach(genre => genresSet.add(genre));
  });

  const genres = Array.from(genresSet).sort();
  res.send(genres);
});

/* GET /movies (mit Filter) */
app.get('/movies', function (req, res) {
  let movies = Object.values(movieModel);
  const genre = req.query.genre;

  if (genre) {
    movies = movies.filter(movie =>
      movie.Genres.includes(genre)
    );
  }

  res.send(movies);
});

/* GET single movie */
app.get('/movies/:imdbID', function (req, res) {
  const id = req.params.imdbID;

  if (id in movieModel) {
    res.send(movieModel[id]);
  } else {
    res.sendStatus(404);
  }
});

/* PUT movie */
app.put('/movies/:imdbID', function(req, res) {
  const id = req.params.imdbID;
  const exists = id in movieModel;

  movieModel[id] = req.body;
  
  if (!exists) {
    res.status(201).send(req.body);
  } else {
    res.sendStatus(200);
  }
});

app.listen(3000);
console.log("Server now listening on http://localhost:3000/");