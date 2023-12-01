const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Define the user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    dob: Date,
    phone: String,
    zipcode: String,
    headline: String,
    avatar: String,
    googleId: String,
    password: { type: String, required: true }, // Store a hashed version, not plain text
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

userSchema.pre('save', async function(next) {
    // Hash password if it's been modified (or is new)
    // if (this.isModified('password')) {
    //     this.password = await bcrypt.hash(this.password, 8);
    // }

    // Add the user's own _id to their following list if this is a new document
    if (this.isNew) {
        this.following.push(this._id);
    }

    next();
});


// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
