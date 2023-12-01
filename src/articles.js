const Article = require('../models/articleModel');
const User = require('../models/user');
const {Types} = require("mongoose");
const {isLoggedIn} = require("./auth");

module.exports = function(app) {

    app.get('/articles/:id?', isLoggedIn, async (req, res) => {
        try {
            if (req.params.id) {
                // Check if `id` is a valid ObjectId
                if (Types.ObjectId.isValid(req.params.id)) {
                    const article = await Article.findById(req.params.id);
                    res.json({ articles: [article] });
                } else {
                    const user = await User.findOne({ username: req.params.id });
                    const articles = await Article.find({ author: user._id });
                    res.json({ articles: articles });
                }
            } else {
                // Fetch articles for the logged-in user's feed
                const articles = await Article.find(); // Modify this as per your feed logic
                res.json({ articles: articles });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/allArticles', isLoggedIn, async (req, res) => {
        try {
            const articles = await Article.find().populate('author', 'username');
            res.json({ articles });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });


    app.put('/articles/:id', isLoggedIn, async (req, res) => {
        try {
            const { id } = req.params;
            const { text, commentId } = req.body;
            const userId = req.user._id;

            const article = await Article.findById(id);

            // Check if the article exists
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }

            if (commentId === undefined) {
                // Only allow article owner to update the article text
                if (!article.author.equals(userId)) {
                    return res.status(403).json({ error: 'Forbidden' });
                }
                article.content = text;
            } else if (commentId === -1) {
                // Allow any authenticated user to add a comment
                article.comments.push({ text, author: userId });
            } else {
                // Update an existing comment, but only if the user owns the comment
                const comment = article.comments.id(commentId);
                if (!comment || !comment.author.equals(userId)) {
                    return res.status(403).json({ error: 'Forbidden' });
                }
                comment.text = text;
            }

            await article.save();
            res.json({ articles: [article] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });



    app.post('/article', isLoggedIn, async (req, res) => {
        try {
            const { title, text, image } = req.body; // Extract text and optionally image from the request body
            const authorId = req.user._id; // Assuming the user ID is attached to the request

            const newArticle = new Article({
                title: title,
                content: text,
                image: image, // This will be undefined if no image is provided, which is okay
                author: authorId
            });

            await newArticle.save();
            res.json({ articles: [{ id: newArticle._id, author: authorId, content: text, image: image, comments: [], datePosted: newArticle.datePosted}] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
