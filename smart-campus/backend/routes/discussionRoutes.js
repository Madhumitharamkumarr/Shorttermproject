const express = require('express');
const router = express.Router();
const { createDiscussion, getDiscussions, addComment, upvoteDiscussion } = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

router.route('/')
    .post(protect, createDiscussion)
    .get(protect, getDiscussions);

router.route('/:id/comments')
    .post(protect, addComment);

router.route('/:id/upvote')
    .put(protect, upvoteDiscussion);

module.exports = router;
