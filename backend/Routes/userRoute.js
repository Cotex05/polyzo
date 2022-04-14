import express from 'express';

// vars
const router = express.Router();
import User from "../Models/User.model.js"

// to get all users
router.route('/all').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

// to get user by email
router.route('/byEmail/:email').get(async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

// to get a specific user by id
router.route('/byUserId/:userId').get(async (req, res) => {

    const userId = req.params.userId;

    try {
        const user = await User.findOne({ _id: userId }).populate('followersList').populate('followingsList');
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

// to get a specific user by username
router.route('/byUsername/:username').get(async (req, res) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({ username: username }).populate('followersList').populate('followingsList');
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

// to get a specific user by searching name
router.route('/search/:name').get((req, res) => {
    User.find({ $text: { $search: req.params.name } })
        .limit(10)
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

// to add new user
router.route('/add').post(async (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const about = req.body.about;

    try {
        const response = await User.findOneAndUpdate({ email: email }, { name: name, username: username, about: about }, { upsert: true, new: true });
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

router.route('/addProfilePhoto').post(async (req, res) => {
    const email = req.body.email;
    const imgUrl = req.body.imgUrl;

    try {
        const response = await User.findOneAndUpdate({ email: email }, { profileImage: imgUrl }, { new: true })
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

// update links
router.route('/addLinks').put(async (req, res) => {
    const userId = req.body.userId;
    const links = req.body.links;

    try {
        const response = await User.findOneAndUpdate({ _id: userId }, { links: links }, { new: true });
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

router.route('/addEthereumAddress').post(async (req, res) => {
    const userId = req.body.userId;
    const ethereumAddress = req.body.ethereumAddress;

    try {
        const response = await User.findOneAndUpdate({ _id: userId }, { ethereumAddress: ethereumAddress }, { new: true });
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

// to update user details
router.route('/update/:userId').patch(async (req, res) => {

    const userId = req.params.userId;
    const name = req.body.name;
    const username = req.body.username;

    let updates = { name: name, username: username };

    if (username == null && name != null) {
        updates = { name: name };
    } if (name == null && username != null) {
        updates = { username: username };
    } if (username == null && name == null) {
        res.json("No update field is requested!");
        return;
    }

    try {
        const updatedUser = await User.findOneAndUpdate({ _id: userId }, updates, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.json(error);
    }
});

// to update profile Image
router.route('/update/:userId').patch(async (req, res) => {

    const userId = req.params.userId;
    const profileImageUrl = req.body.profileImageUrl;

    try {
        const updatedUser = await User.findOneAndUpdate({ _id: userId }, { profileImage: profileImageUrl }, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.json(error);
    }
});

// to follow other user
router.route('/follow/:userId').put((req, res) => {
    // to follow
    const userId = req.params.userId;

    // following by
    const currUserId = req.body.currUserId;

    User.countDocuments({ _id: currUserId, followingsList: { $in: userId } }, async (err, count) => {
        if (count > 0) {
            res.json({ followed: true });
        } else {
            const followedResponse = await User.findOneAndUpdate({ _id: currUserId }, { $push: { 'followingsList': userId }, $inc: { 'followingsCount': 1 } }, { new: true });
            const followingResponse = await User.findOneAndUpdate({ _id: userId }, { $push: { 'followersList': currUserId }, $inc: { 'followersCount': 1 } }, { new: true });
            res.json(followingResponse);
        }
    });
});

// to check follow status 
router.route('/isFollowing/:userId/:currUserId').get((req, res) => {

    const userId = req.params.userId;

    const currUserId = req.params.currUserId;

    User.countDocuments({ _id: currUserId, followingsList: { $in: userId } }, (err, count) => {
        if (count > 0) {
            res.json({ followed: true });
        } else {
            res.json({ followed: false });
        }
    });
});

// to unfollow other
router.route('/unfollow/:userId').put((req, res) => {
    // to unfollow
    const userId = req.params.userId;

    // unfollowed by
    const currUserId = req.body.currUserId;

    User.countDocuments({ _id: currUserId, followingsList: { $in: userId } }, async (err, count) => {
        if (count > 0) {
            try {
                const unfollowedResponse = await User.findOneAndUpdate({ _id: currUserId }, { $pull: { 'followingsList': userId }, $inc: { 'followingsCount': -1 } }, { new: true });
                const unfollowingResponse = await User.findOneAndUpdate({ _id: userId }, { $pull: { 'followersList': currUserId }, $inc: { 'followersCount': -1 } }, { new: true });
                res.json(unfollowingResponse);
            } catch (error) {
                res.json('Error: ' + error);
            }
        } else {
            res.json({ followed: false });
        }
    });
});

export default router;