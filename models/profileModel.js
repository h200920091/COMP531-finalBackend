const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    dob: Date,
    phone: String,
    zipcode: String,
    headline: String,
    avatar: String,
    googleId: String
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
