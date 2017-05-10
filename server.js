// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    auth = require('./resources/auth');

// require and load dotenv
require('dotenv').load();

// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve static files from public folder
app.use(express.static(__dirname + '/public'));

// connect to mongodb
mongoose.connect('mongodb://localhost/angular_auth');

// require User and Post models
var User = require('./models/user');


// require SQL User
var sqlUser = require('./models/user_sql');

/* SQL API Routes */

/*
  To use Sequelize instead of Mongoose,
  just replace "sqlapi" with "api"
  in these routes
*/

app.get('/sqlapi/me', auth.ensureAuthenticated, function (req, res) {
  sqlUser.findById(req.user).then(function (user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found.' });
    }
    res.send(user);
  });
});

app.put('/sqlapi/me', auth.ensureAuthenticated, function (req, res) {
  sqlUser.findById(req.user).then(function (user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found.' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.save().then(function(result) {
      if (!result) {
        res.status(500).send({ message: "Oh noes an error!" });
      }      
      res.send(result);
    });
  });
});

/* SQL Auth Routes */
/*
  To use Sequelize instead of Mongoose, 
  just replace "sqlauth" with "auth"
  in these routes
*/

app.post('/sqlauth/signup', function (req, res) {
  sqlUser.findOne({where: { email: req.body.email }}).then(function (existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken.' });
    }
    var user = sqlUser.build({
      displayName: req.body.displayName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    user.save().then(function (result) {
      if (!result) {
        res.status(500).send({ message: "Oh noes an error!" });
      }
      res.send({ token: auth.createJWT(result) });
    });
  });
});

app.post('/sqlauth/login', function (req, res) {
  sqlUser.findOne({where: { email: req.body.email }}).then(function (existingUser) {
    if (!existingUser) {
      return res.status(401).send({ message: 'Invalid email or password.' });
    }
    var validPassword = existingUser.comparePassword(req.body.password);
    if (!validPassword) {
      return res.status(401).send({ message: 'Invalid email or password.' });
    }
    res.send({ token: auth.createJWT(existingUser) });
  });
});


/*
 * API Routes
 */

app.get('/api/me', auth.ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    res.send(user.populate('posts'));
  });
});

app.put('/api/me', auth.ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found.' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.send(user);
    });
  });
});

app.get('/api/posts', function (req, res) {
  res.json([
  {
    title: "Hardcoded Title",
    content: "Here is some great hardcoded content for the body of a blog post. Happy coding!"
  },
  {
    title: "Another Post",
    content: "MEAN stack is the best stack."
  }
  ]);
});


/*
 * Auth Routes
 */

app.post('/auth/signup', function (req, res) {
  User.findOne({ email: req.body.email }, function (err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken.' });
    }
    var user = new User({
      displayName: req.body.displayName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function (err, result) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.send({ token: auth.createJWT(result) });
    });
  });
});

app.post('/auth/login', function (req, res) {
  User.findOne({ email: req.body.email }, '+password', function (err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Invalid email or password.' });
    }
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid email or password.' });
      }
      res.send({ token: auth.createJWT(user) });
    });
  });
});

/*
 * Catch All Route
 */
app.get(['/', '/signup', '/login', '/profile'], function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


/*
 * Listen on localhost:9000
 */
app.listen(9000, function() {
  console.log('server started');
});
