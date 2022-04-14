import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxLength: 40,
    },
    username: {
        type: String,
        required: true,
        maxLength: 30,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    about: {
        type: String,
        maxlength: 300
    },
    ethereumAddress: {
        type: String,
    },
    links: {
        type: Schema.Types.Array
    },
    followersCount: {
        type: Number,
        default: 0
    },
    followingsCount: {
        type: Number,
        default: 0
    },
    profileImage: {
        type: String,
        default: "https://www.kindpng.com/picc/m/171-1712282_profile-icon-png-profile-icon-vector-png-transparent.png"
    },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    followersList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followingsList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true
});

UserSchema.index({ name: 'text' });

const User = mongoose.model('User', UserSchema);

export default User;