// Setup ================================================
var express      = require('express');
var app          = express();
var mongoose     = require('mongoose');
var MongoStore   = require('connect-mongo')(express);
var passwordHash = require('password-hash');

var port = process.env.PORT || 3000;

// Configuration ========================================
mongoose.connect('mongodb://motivatr:4v417_6^=&zd2T0@novus.modulusmongo.net:27017/e8xobIde'); // connect to mongoDB at modulus.io

// Middleware
app.configure(function() {
  app.use('views', __dirname + '/views');
  app.use(express.static(__dirname + '/public')); // This is where static files are
  app.use(express.logger('dev'));                 // Ensure all console requests are logged
  app.use(express.json({strict: true}));          // Just accept JSON input (bodyParser is unsafe)
  app.use(express.methodOverride());              // Simulate DELETE/PUT
  app.use(express.cookieParser('fsd345'));        // Use cookies
  app.use(express.session({                       // Use sessions with Mongo Store
    store: new MongoStore({
      url: 'mongodb://motivatr:4v417_6^=&zd2T0@novus.modulusmongo.net:27017/e8xobIde',
    }, function () {
      console.log("db connection open");
    }),
    secret: '7E6287w0UyA5749h255nj7nyW'
  }));
  app.set('view engine', 'jade');                 // Use Jade for templating
});

// Define User model ====================================
var User = mongoose.model('user', {
  firstname : String,
  lastname  : String,
  username  : String,
  password  : String,
  email     : String,
  interests : [String],
  admin     : Boolean
});

// Define Thought model =================================
var Thought = mongoose.model('thought', {
  text   : String,
  author : String,
  date   : Date
});

// Routes ===============================================

// API --------------------------------------------------
// Create a user
app.post('/api/users', function(req, res) {
  /* We should really validate these details again, but
     we will rely on client-side validation for this
     prototypal system. */
  User.create({
    firstname : req.body.firstname,
    lastname  : req.body.lastname,
    username  : req.body.username,
    password  : passwordHash.generate(req.body.password),
    email     : req.body.email,
    interests : [],
    admin     : true, // For testing purposes, all new users are admins
    done      : false
  }, function(err, users) {
    if (err)
      res.send(err);
    res.json(users);
  });
});

// Get all users
app.get('/api/users', function(req, res) {
  User.find(function(err, users) {
    if (err)
      res.send(err);
    res.json(users);
  });
});

// Find a specific user by posted username
app.get('/api/users/:username', function(req, res) {
  User.findOne({
    username: req.params.username
  }, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
});

// Delete a user
app.delete('/api/users/:user_id', function(req, res) {
  User.remove({
    _id : req.params.user_id
  }, function(err, users) {
    if (err)
      res.send(err);
    User.find(function(err, users) {
      if (err)
        res.send(err);
      res.json(users);
    });
  });
});

// Update a user's details
app.post('/api/users/update', function(req, res) {
  User.findOne({
    username: req.session.user.username
  }, function(err, user) {
    if (err)
      res.send(err);
    // Update first name(s) if specified
    if (typeof req.body.firstname !== 'undefined') {
      user.firstname = req.body.firstname;
    }
    // Update last name if specified
    if (typeof req.body.lastname !== 'undefined') {
      user.lastname = req.body.lastname;
    }
    // Update session and local variable
    req.session.user = user;
    app.locals.user = user;

    // Retrieve updated list of users
    User.find(function(err, users) {
      if (err)
        res.send(err);
      res.json(users);
    });
  });
});

// Add a new interest
app.post('/api/users/interests', function(req, res) {
  User.findOneAndUpdate({ username: req.session.user.username },
  {$push: { 'interests' : req.body.interest }},
  {upsert: true},
  function(err, data) {
    if (err)
      res.send(err);
    // Update session and local variable
    req.session.user = data;
    app.locals.user = data;

    res.json(data.interests);
  });
});

// Get all interests for current user
app.get('/api/users/interests', function(req, res) {
  User.findOne({
    username: req.session.user.username
  }, function(err, user) {
    if (err)
      res.send(err);
    console.log(req.session.user.username);
    res.send("test");
  });
});

// Delete an interest
app.delete('/api/users/interests/:keyword', function(req, res) {
  User.findOneAndUpdate({ username: req.session.user.username },
  {$pull: { 'interests' : req.params.keyword }},
  function(err, data) {
    if (err)
      res.send(err);
    // Update session and local variable
    req.session.user = data;
    app.locals.user = data;

    res.json(data.interests);
  });
});

// Verify login details
app.post('/api/login', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err)
      res.send(err);
    // If the user was found, check the password against hash
    if(user) {
      if(passwordHash.verify(req.body.password, user.password)) {
        // Add user to session
        req.session.user = user;
        // Add session/user info to local variables
        app.locals.user = user;
        console.log('Successful login by ' + user.username);
        res.send('true');
      } else {
        console.log('Login error: Incorrect password.');
        res.send('false');
      }
    } else {
      console.log('Login error: Incorrect username.');
      res.send('false');
    }
  });
});

app.get('/api/logout', function(req, res) {
  req.session.destroy();
  delete app.locals.user;
  console.log('Logged out.');
  res.redirect('/');
});


// Get all thoughts
app.get('/api/thoughts', function(req, res) {
  // Get all thoughts from Mongoose DB
  Thought.find(function(err, thoughts) {
    // If there's a retrieval error, send it.
    if (err)
      res.send(err)
    res.json(thoughts); // Return all thoughts in JSON format
  });
});

// Create a thought and send back all of the thoughts afterwards
app.post('/api/thoughts', function(req, res) {
  // Create a thought: the info comes from Angular AJAX request
  Thought.create({
    text   : req.body.text,
    author : req.session.user.firstname + ' ' + req.session.user.lastname,
    date   : new Date(),
    done   : false
  }, function(err, thoughts) {
    if (err)
      res.send(err);
    // Get and return all the thoughts after creating one
    Thought.find(function(err, thoughts) {
      if (err)
        res.send(err)
      res.json(thoughts);
    });
  });
});

// Delete a thought
app.delete('/api/thoughts/:thought_id', function(req, res) {
  Thought.remove({
    _id : req.params.thought_id
  }, function(err, thoughts) {
    if (err)
      res.send(err);
    // Get and return all the thoughts after deleting one
    Thought.find(function(err, thoughts) {
      if (err)
        res.send(err)
      res.json(thoughts);
    });
  });
});

// Application ------------------------------------------
// Pervasive variables
app.locals({
  site: {
    title:      'Motivatr',
    tagline:    'Make it happen.'
  },
  author: {
    name:       'Benjamin Brown',
    contact:    'ben@bcbrown.com'
  }
});

// Handle 
app.get('/', function(req, res) {
  if(typeof req.session.user != 'undefined') {
    res.redirect('/inspire');
  } else {
    res.redirect('/login');
  }
});
app.get('/login', function(req, res) {
  if(typeof req.session.user != 'undefined') {
    res.redirect('/');
  } else {
    app.locals.token = Math.floor(Math.random() * (1000 - 1));
    res.render('login', {pageTitle: 'login'});
  }
});
app.get('/login/:rs', function(req, res) {
  res.render('login', {
    pageTitle : 'login',
    msg       : 'Registration successful: you may now log in.'
  });
});
app.get('/register', function(req, res) {
  if(typeof req.session.user != 'undefined') {
    res.redirect('/');
  } else {
    res.render('register', {pageTitle: 'register'});
  }
});
app.get('/share', function(req, res) {
  if(typeof req.session.user != 'undefined') {
    res.render('share', {pageTitle: 'share'});
  } else {
    res.redirect('/login');
  }
});
app.get('/inspire', function(req, res) {
  if(typeof req.session.user != 'undefined') {
    res.render('inspire', {pageTitle: 'inspire'});
  } else {
    res.redirect('/login');
  }
});
app.get('/users', function(req, res) {
  if(typeof req.session.user != 'undefined' && req.session.user.admin == true ) {
    res.render('users', {pageTitle: 'users'});
  } else {
    console.log('not admin');
    res.redirect('/');
  }
});
app.get('/profile', function(req, res) {
  res.render('profile', {pageTitle: 'profile'});
});
app.get('/*', function(req, res) {
  console.log('404');
});

// Listen ===============================================
app.listen(port);
console.log("Server listening on port " + port);