import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PostLikeSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const PostSchema = new Schema({
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    imgUrl: {
        type: String,
    },
    postTitle: {
        type: String,
        required: true,
        maxlength: 50,
    },
    postDesc: {
        type: String,
        maxlength: 400,
    },
    likes: {
        type: Number,
    },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'PostLike' }]
}, {
    timestamps: true,
});

const Post = mongoose.model('Post', PostSchema);
const PostLike = mongoose.model('PostLike', PostLikeSchema);


export { Post, PostLike };