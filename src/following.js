// following.js

const User = require('../models/user');
const { isLoggedIn } = require('./auth'); // Assuming you have this middleware

module.exports = function(app) {

    // Get the list of users being followed by the requested user
    app.get('/following/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.user.username;
        try {
            const user = await User.findOne({ username: username }).populate('following', 'username');
            res.json({ username: user.username, following: user.following.map(u => u.username) });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/followingIds/:user?', isLoggedIn, async (req, res) => {
        const username = req.params.user || req.user.username;
        try {
            const user = await User.findOne({ username: username }).populate('following', '_id');
            res.json({ username: user.username, followingIds: user.following.map(u => u._id) });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Add a user to the following list for the logged-in user
    app.put('/following/:user', isLoggedIn, async (req, res) => {
        try {
            const userToFollow = await User.findOne({ username: req.params.user });
            const currentUser = await User.findById(req.user._id);

            if (!currentUser.following.includes(userToFollow._id)) {
                currentUser.following.push(userToFollow._id);
                await currentUser.save();
            }

            const updatedUser = await User.findById(req.user._id).populate('following', 'username');
            const followingUsernames = updatedUser.following.map(u => u.username);
            res.json({ username: currentUser.username, following: followingUsernames });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Remove a user from the following list for the logged-in user
    app.delete('/following/:user', isLoggedIn, async (req, res) => {
        try {
            const userToUnfollow = await User.findOne({ username: req.params.user });
            const currentUser = await User.findById(req.user._id);

            currentUser.following = currentUser.following.filter(followedUserId => !followedUserId.equals(userToUnfollow._id));
            await currentUser.save();

            const updatedUser = await User.findById(req.user._id).populate('following', 'username');
            const followingUsernames = updatedUser.following.map(u => u.username);
            res.json({ username: currentUser.username, following: followingUsernames });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/users', async (req, res) => {
        try {
            // Retrieve all users from the database
            const users = await User.find({}).select('-password'); // Exclude password for security
            res.json({ users });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

};
