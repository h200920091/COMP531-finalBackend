// auth.js

const User = require('../models/user')
const bcrypt = require('bcryptjs');
const Profile = require('../models/profileModel')
const crypto = require('crypto')
const {authenticate} = require("passport");
let sessionUser = {}
const cookieKey = 'sid'
PEPPER = "This is MY pepper"


function isLoggedIn(req, res, next) {
    // Assuming 'sessionId' is the name of the cookie where the session ID is stored
    const sessionId = req.cookies[cookieKey];
    if (sessionId && sessionUser[sessionId]) {
        // The user is logged in. Attach the user to the request object
        // so it can be accessed in the route handler
        req.user = sessionUser[sessionId];

        // Call next() to proceed to the route handler
        return next();
    } else {
        // If there's no session ID in the cookies, or the session ID
        // does not correspond to a user, send an unauthorized error
        res.status(401).json({ error: 'You must be logged in to do this action' });
    }
}

module.exports = {
    initializeAuth: function(app, sessionStore) {
        // Assuming sessionStore is some form of session management middleware
        app.post('/login', async (req, res) => {
            try {
                // Find the user by username
                const user = await User.findOne({username: req.body.username});
                if (!user) {
                    return res.status(401).json({error: 'Invalid credentials'});
                }

                // Combine the provided password with the pepper
                const pepperedPassword = req.body.password + PEPPER;

                // Compare the peppered and hashed password
                const isMatch = await bcrypt.compare(pepperedPassword, user.password);
                if (isMatch) {
                    // User is authenticated
                    // Set up your session or token here

                    const sessionKey = crypto.randomBytes(16).toString('hex');
                    sessionUser[sessionKey] = user

                    const profileData = {
                        userId: user._id,
                        username: user.username,
                        email: user.email,
                        dob: user.dob,
                        headline: user.headline,
                        phone: user.phone,
                        zipcode: user.zipcode,
                        avatar: user.avatar,
                        googleId: user.googleId
                    };

                    // const newProfile = new Profile(profileData);
                    // await newProfile.save();
                    // Clear the profiles collection
                    await Profile.deleteMany({});
                    const newProfile = new Profile(profileData);
                    await newProfile.save();

                    res.cookie(cookieKey, sessionKey, {
                        maxAge: 3600 * 1000,
                        httpOnly: true,
                        sameSite: 'None',
                        secure: true
                    })

                    // testing cookie
                    // res.cookie(cookieKey, sessionKey, { httpOnly: true });

                    res.json({username: req.body.username, result: "success"});
                } else {
                    res.status(401).json({error: 'Invalid credentials'});
                }
            } catch (error) {
                res.status(500).json({error: error.message});
            }
        });

        app.put('/logout', isLoggedIn, async (req, res) => {
            const sessionKey = req.cookies[cookieKey];
            if (sessionUser[sessionKey]) {
                await Profile.deleteOne({ userId: req.user._id });
                delete sessionUser[sessionKey]; // Invalidate the session
                res.clearCookie(cookieKey); // Clear the session cookie
                res.send('OK');
            } else {
                res.status(401).send('You are not logged in');
            }
        });

        app.post('/register', async (req, res) => {

            try {
                const pepperedPassword = req.body.password + PEPPER;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(pepperedPassword, salt);

                const user = new User({
                    username: req.body.username,
                    email: req.body.email,
                    dob: req.body.dob,
                    phone: req.body.phone,
                    zipcode: req.body.zipcode,
                    headline: req.body.headline || "Gimme rice!",
                    avatar: req.body.avatar || "http://res.cloudinary.com/hht4avzbk/image/upload/v1701055538/a27mzbgcefye6u6tkbuq.jpg",
                    password: hashedPassword, // Store the salted and peppered password
                });

                await user.save();

                const profileData = {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    dob: user.dob,
                    headline: user.headline,
                    phone: user.phone,
                    zipcode: user.zipcode,
                    avatar: user.avatar
                };

                // Create or update user profile
                await Profile.deleteMany({});
                const newProfile = new Profile(profileData);
                await newProfile.save();

                const sessionKey = crypto.randomBytes(16).toString('hex');
                sessionUser[sessionKey] = user;

                // Set the session cookie
                res.cookie(cookieKey, sessionKey, {
                    maxAge: 3600 * 1000, // Adjust the maxAge as needed
                    httpOnly: true,
                    sameSite: 'None', // or 'strict' based on your requirements
                    secure: true // set to true if using https
                });

                // Respond with success
                res.json({result: 'success', username: req.body.username});
            } catch (error) {
                res.status(500).json({error: error.message});
            }
        });

        app.put('/password', isLoggedIn, async (req, res) => {
            const newPassword = req.body.password;
            // Validate the new password
            if (!newPassword) {
                return res.status(400).json({error: 'Password must not be empty.'});
            }

            try {
                // Hash the new password with salt and pepper
                const pepperedPassword = newPassword + PEPPER; // Assuming you have a PEPPER constant
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(pepperedPassword, salt);

                // req.user is set by isLoggedIn middleware and contains the logged-in user's info
                const userId = req.user._id; // Use _id (or another unique identifier) to locate the user document

                // Update the user's password in the database
                const updatedUser = await User.findByIdAndUpdate(userId, {password: hashedPassword}, {new: true});

                // Check if the update was successful
                if (updatedUser) {
                    // Respond with success
                    res.json({username: updatedUser.username, result: 'success'});
                } else {
                    res.status(404).json({error: 'User not found'});
                }
            } catch (error) {
                // If there's an error, respond with an error message
                res.status(500).json({error: 'Internal server error'});
            }
        });

        app.post('/link-google', async (req, res) => {
            const { googleId, userId } = req.body;

            // Check if any user already has this Google ID
            const existingUser = await User.findOne({ googleId });
            if (existingUser) {
                return res.status(400).json({ error: 'This Google account is already linked.' });
            }

            // Link Google ID to the logged-in user
            const user = await User.findById(userId);
            if (user) {
                user.googleId = googleId;
                await user.save();
                res.json({ success: 'Google account linked successfully.' });
            } else {
                res.status(404).json({ error: 'User not found.' });
            }
        });

        app.post('/disconnect-google', async (req, res) => {
            const { userId } = req.body;

            // Find the user by ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // Check if the user already has a Google ID linked
            if (!user.googleId) {
                return res.status(400).json({ error: 'No Google account is linked to this user.' });
            }

            // Disconnect the Google account
            user.googleId = null; // or user.googleId = ""
            await user.save();

            res.json({ success: 'Google account disconnected successfully.' });
        });

        app.post('/login-with-google', async (req, res) => {
            const { googleId } = req.body;

            try {
                const user = await User.findOne({ googleId: googleId });
                if (user) {
                    // User is authenticated, set up your session or token here
                    const sessionKey = crypto.randomBytes(16).toString('hex');
                    sessionUser[sessionKey] = user;

                    const profileData = {
                        userId: user._id,
                        username: user.username,
                        email: user.email,
                        dob: user.dob,
                        headline: user.headline,
                        phone: user.phone,
                        zipcode: user.zipcode,
                        avatar: user.avatar,
                        googleId: user.googleId
                    };

                    // const newProfile = new Profile(profileData);
                    // await newProfile.save();
                    // Clear the profiles collection
                    await Profile.deleteMany({});
                    const newProfile = new Profile(profileData);
                    await newProfile.save();


                    // Set a cookie or return a token
                    res.cookie(cookieKey, sessionKey, {
                        maxAge: 3600 * 1000, // Adjust as needed
                        httpOnly: true,
                        sameSite: 'None',
                        secure: true // Use true if using https
                    });

                    res.json({ success: true, message: 'Logged in with Google successfully.' });
                } else {
                    res.status(404).json({ error: 'User not found.' });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });


    },
    isLoggedIn,
    cookieKey

};