const Discussion = require('../models/Discussion');

// @desc    Create a discussion post
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
    try {
        const discussion = new Discussion({
            title: req.body.title,
            content: req.body.content,
            author: req.user._id
        });
        const createdDiscussion = await discussion.save();
        res.status(201).json(createdDiscussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all discussions
// @route   GET /api/discussions
// @access  Private
const getDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.find({})
            .populate('author', 'email')
            .sort({ createdAt: -1 });
        res.json(discussions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add comment to discussion
// @route   POST /api/discussions/:id/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (discussion) {
            const comment = {
                content: req.body.content,
                author: req.user._id
            };
            discussion.comments.push(comment);
            await discussion.save();
            res.status(201).json(discussion);
        } else {
            res.status(404).json({ message: 'Discussion not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upvote a discussion
// @route   PUT /api/discussions/:id/upvote
// @access  Private
const upvoteDiscussion = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (discussion) {
            // Check if already upvoted
            if (!discussion.upvotes.includes(req.user._id)) {
                discussion.upvotes.push(req.user._id);
                await discussion.save();
            }
            res.json(discussion);
        } else {
            res.status(404).json({ message: 'Discussion not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createDiscussion,
    getDiscussions,
    addComment,
    upvoteDiscussion
};
