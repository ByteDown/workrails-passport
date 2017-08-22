const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const app = express();

const passport = require('passport');
const passportJWT = require('passport-jwt');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

app.use(passport.initialize());

// TODO: Port users to Postgres using Sequilize
const users = [
  {
    id: 1,
    name: 'elonmusk',
    password: 'musk'
  },
  {
    id: 2,
    name: 'stevejobs',
    password: 'jobs'
  }
];

const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'filecoinICO';

const strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('Payload recieved', jwt_payload);
  // TODO: Make this into a database call via Sequilize
  const user = users[_.findIndex(users, {id: jwt_payload.id})];
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

// Make testing with Postman easier
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.json({message: 'We are in business baby!'});
});

app.post('/login', function(req, res) {
  let name;
  let password;
  if (req.body.name && req.body.password) {
    name = req.body.name;
    password = req.body.password;
  }
  // TODO: Make this into a databse call via Sequilize
  const user = users[_.findIndex(users, {name: name})];
  if (!user) {
    res.status(401).json({message: 'User not found try hitting yourself over the head with a shovel'});
  }

  if (user.password == req.body.password) {
    // Identify the user by id by injecting it into the unique token
    const payload = {id: user.id};
    const token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({message: 'JWT', token: token});
  } else {
    res.status(401).json({message: 'password did not match'});
  }
});

app.listen(3000, function() {
  console.log('====Server Running PORT:3000====')
});
