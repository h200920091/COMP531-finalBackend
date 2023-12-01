const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    datePosted: {
        type: Date,
        default: Date.now
    }
});

const articleSchema = new mongoose.Schema({
    title: String,
    content: String, // The text of the article
    image: {
        type: String, // URL to the image
        required: false // Image is optional
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    datePosted: {
        type: Date,
        default: Date.now
    },
    comments: [commentSchema]
    // Add other fields as needed, like comments
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
