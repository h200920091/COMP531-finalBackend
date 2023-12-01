// profile.js
const {isLoggedIn} = require("./auth");
const User = require('../models/user');
const Profile = require('../models/profileModel')


module.exports = function(app) {

    app.get('/email/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.user.username; // Use logged in user if no username is provided
        try {
            const user = await User.findOne({ username: username });
            res.json({ username: user.username, email: user.email });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/email', isLoggedIn, async (req, res) => {
        const newEmail = req.body.email;
        try {
            const updatedUser = await User.findByIdAndUpdate(req.user._id, { email: newEmail }, { new: true });
            res.json({ username: updatedUser.username, email: updatedUser.email });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/zipcode/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.user.username;
        try {
            const user = await User.findOne({ username: username });
            res.json({ username: user.username, zipcode: user.zipcode });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/zipcode', isLoggedIn, async (req, res) => {
        const newZipCode = req.body.zipcode;
        try {
            const updatedUser = await User.findByIdAndUpdate(req.user._id, { zipcode: newZipCode }, { new: true });
            res.json({ username: updatedUser.username, zipcode: updatedUser.zipcode });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/dob/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.user.username;
        try {
            const user = await User.findOne({ username: username });
            res.json({ username: user.username, dob: user.dob.getTime() }); // Convert Date to milliseconds
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/phone/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.user.username;
        try {
            const user = await User.findOne({ username: username });
            res.json({ username: user.username, phone: user.phone });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/phone', isLoggedIn, async (req, res) => {
        const newPhoneNumber = req.body.phone;
        try {
            const updatedUser = await User.findByIdAndUpdate(req.user._id, { phone: newPhoneNumber }, { new: true });
            res.json({ username: updatedUser.username, phone: updatedUser.phone });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/avatar/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.user.username;
        try {
            const user = await User.findOne({ username: username });
            res.json({ username: user.username, avatar: user.avatar }); // Assuming avatar URL is stored
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/avatar', isLoggedIn, async (req, res) => {
        const newAvatar = req.body.avatar;
        try {
            const updatedUser = await User.findByIdAndUpdate(req.user._id, { avatar: newAvatar }, { new: true });
            res.json({ username: updatedUser.username, avatar: updatedUser.avatar });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });


    app.get('/headline/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.user.username; // Use logged-in user if no username is provided
        try {
            const user = await User.findOne({ username: username });
            res.json({ username: user.username, headline: user.headline }); // Assuming headline is a field in User model
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/headline', isLoggedIn, async (req, res) => {
        const newHeadline = req.body.headline;
        try {
            const updatedUser = await User.findByIdAndUpdate(req.user._id, { headline: newHeadline }, { new: true });
            res.json({ username: updatedUser.username, headline: updatedUser.headline });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/profile', isLoggedIn, async (req, res) => {
        try {
            const profiles = await Profile.find({});
            res.json({ profiles: profiles });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

};
