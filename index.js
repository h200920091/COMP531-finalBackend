// index.js
const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config()
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const upCloud = require('./src/uploadImage')

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let sessionUser = {}
const cookieKey = 'sid'

const API_BASE_URL = 'https://thericecooker.surge.sh';

app.use(session({
    secret: 'doNotGuessTheSecret', // Replace with a real secret key
    resave: true,
    saveUninitialized: true
}));
// app.use(express.static('public'))

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use('google-link', new GoogleStrategy({
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
        callbackURL: "https://rcf-cc450a613e85.herokuapp.com/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        // Create a session object with relevant information
        const userSession = {
            googleId: profile.id,
            name: profile.displayName,
            accessToken: accessToken // Storing the access token
        };

        return done(null, userSession);
    }
));

passport.use('google-login', new GoogleStrategy({
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
        callbackURL: "https://rcf-cc450a613e85.herokuapp.com/auth/googleLogin/callback"
        // additional configuration...
},  function(accessToken, refreshToken, profile, done) {
        // Create a session object with relevant information
        const userSession = {
            googleId: profile.id,
            name: profile.displayName,
            accessToken: accessToken // Storing the access token
        };

        return done(null, userSession);
    }
));
app.get('/auth/google/callback',
    passport.authenticate('google-link', { failureRedirect: `${API_BASE_URL}/mainPage`}),
    function(req, res) {
        // Assuming you want to pass the Google ID and name to the frontend
        const googleId = req.user.googleId;
        const name = req.user.name;

        // Redirect with query parameters
        res.redirect(`${API_BASE_URL}/profile?googleId=${googleId}&name=${encodeURIComponent(name)}`);
    }
);

app.get('/auth/googleLogin/callback',
    passport.authenticate('google-login', { failureRedirect: `${API_BASE_URL}/`}),
    function(req, res) {
        // Assuming you want to pass the Google ID and name to the frontend
        const googleId = req.user.googleId;
        const name = req.user.name;

        // Redirect with query parameters
        res.redirect(`${API_BASE_URL}/?googleId=${googleId}&name=${encodeURIComponent(name)}`);
    }
);



app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
    //To allow requests from client
    origin: [
        "http://localhost:3000",
        "https://thericecooker.surge.sh"
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
};

app.get('/auth/google', passport.authenticate('google-link',{ scope: ['profile', 'email'] })); // could have a passport auth second arg {scope: 'email'}
app.get('/auth/googleLogin', passport.authenticate('google-login',{ scope: ['profile', 'email'] })); // could have a passport auth second arg {scope: 'email'}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
upCloud.setup(app)

const mongoURI = "mongodb+srv://zl157:cFiddgIeLhLX2oLM@cluster0.rw7g9br.mongodb.net/?retryWrites=true&w=majority";
// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connection established'))
    .catch(err => console.error('MongoDB connection error:', err));

// Require your stubs here
const auth = require('./src/auth');
const {authenticate} = require("passport");
const User = require("./models/user");
auth.initializeAuth(app, mongoose);
require('./src/articles')(app);
require('./src/profile')(app);
require('./src/following')(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

