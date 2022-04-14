import express, { response } from 'express';

// vars
const router = express.Router();
import { Post, PostLike } from "../Models/Post.model.js";
import User from '../Models/User.model.js';


// to get all the posts
router.route('/all').get(async (req, res) => {
    try {
        const posts = await Post.find().skip(req.query.skip).limit(10);
        res.json(posts);

    } catch (error) {
        res.json(error);
    }
});

// to get latest posts
router.route('/latest').get(async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .skip(req.query.skip)
            .limit(10)
            .populate('likedBy')
            .populate('postedBy');

        res.json(posts);

    } catch (error) {
        res.json(error);
    }
});

// to get most liked post (trendings...)
router.route('/trending').get(async (req, res) => {
    try {
        const posts = await Post.find().sort({ likes: -1, createdAt: -1 })
            .skip(req.query.skip)
            .limit(10)
            .populate('likedBy')
            .populate('postedBy');

        res.json(posts);

    } catch (error) {
        res.json(error);
    }
});

// to get all the post posted by particular user
router.route('/all/by/:userId').get(async (req, res) => {
    try {
        const posts = await Post.find({ postedBy: req.params.userId }).sort({ createdAt: -1 }).populate('postedBy');
        res.json(posts);

    } catch (error) {
        res.json(error);
    }
});


// to get all post who are in user's circle (from followings)
router.route('/circle/:userId').get(async (req, res) => {

    const userId = req.params.userId;
    const skip = req.query.skip;

    try {
        const user = await User.findOne({ _id: userId });

        const posts = await Post.find({ postedBy: { $in: user.followingsList } }).sort({ createdAt: -1 }).skip(skip).limit(10).populate('likedBy').populate('postedBy');

        res.json(posts);

    } catch (error) {
        res.json(error);
    }
});


// to add a new post
router.route('/add').post((req, res) => {
    const postedBy = req.body.postedBy;
    const imgUrl = req.body.imgUrl;
    const postTitle = req.body.postTitle;
    const postDesc = req.body.postDesc;
    const likes = 0;

    const newPost = Post({ postedBy, imgUrl, postTitle, postDesc, likes });

    newPost.save()
        .then(async () => {
            await User.findOneAndUpdate({ _id: postedBy }, { $push: { 'posts': newPost._id } });
            res.json(newPost)
        })
        .catch(err => res.status(400).json('Error: ' + err));
});


// to get unique post
router.route('/:postId').get((req, res) => {
    Post.findOne({ _id: req.params.postId }).populate('likedBy').exec(function (err, post) {
        if (err) {
            res.json(err);
        } else {
            res.json(post);
        }
    })
});

// Add like to post
router.route('/addLike/:postId').put(async (req, res) => {

    const postId = req.params.postId;

    const userId = req.query.userId;

    try {
        PostLike.countDocuments({ postId: postId, userId: userId }, (err, count) => {
            if (count > 0) {
                res.json({ liked: true });
            } else {
                try {
                    const newPostLike = PostLike({ postId: postId, userId: userId });
                    newPostLike.save().then(async () => {
                        const post = await Post.findOneAndUpdate({ _id: postId }, { $push: { 'likedBy': newPostLike._id }, $inc: { 'likes': 1 } }, { new: true });
                        res.json(post);
                    })
                } catch (error) {
                    res.json('Error: ' + error);
                }
            }
        });
    } catch (error) {
        res.json(error);
    }

});

// remove like from post
router.route('/removeLike/:postId').delete(async (req, res) => {
    const postId = req.params.postId;

    const userId = req.query.userId;

    try {
        const deletedLikePost = await PostLike.findOneAndDelete({ postId: postId, userId: userId });
        const post = await Post.findOneAndUpdate({ _id: postId }, { $pull: { 'likedBy': deletedLikePost._id }, $inc: { 'likes': -1 } }, { new: true });
        res.json(post);
    } catch (error) {
        res.json('Error: ' + error);
    }
});

// to check whether user liked the post
router.route('/isLiked/:postId').get(async (req, res) => {
    const postId = req.params.postId;

    const userId = req.query.userId;

    try {
        PostLike.countDocuments({ postId: postId, userId: userId }, (err, count) => {
            if (count > 0) {
                res.json({ liked: true });
            } else {
                res.json({ liked: false });
            }
        })
    } catch (error) {
        res.json(error);
    }

});

// to delete the post
router.route('/delete/:postId').delete(async (req, res) => {

    // post id
    const postId = req.params.postId;

    // user's id is in postedBy
    const userId = req.query.userId;

    await User.findOneAndUpdate({ _id: userId }, { $pull: { 'posts': postId } });

    const deletedPost = Post.findOneAndDelete({ postedBy: userId, _id: postId }, async (err, response) => {
        if (response)
            await PostLike.deleteMany({ _id: { $in: response.likedBy } });
        else
            console.log("No such post exists!");
    });
    res.json({ deleted: true });
});

export default router;