const mongoose = require('mongoose')
const validator = require('validator')


const userSchema =  new mongoose.Schema({

    name:{
        type: String,
        required: [true, 'Please enter a name'],
        maxlength: [30, 'Your name must be at least 30 characters'],

    },
    email: {
        type: String,
        required:[true, 'Please enter email address'],
        unique: true,
        validate:[validator.isEmail, 'Please enter a valid email address']
    },
    password:{
        type: String,
        required:[true, 'Please enter a password'],
        minlength:[6, 'Your password must be at least 6 characters'],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    },
    role:{
        type: String,
        default:'user',

    },
    createdAt:{
        type: Date,
        default:Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
})

module.exports = mongoose.model('user', userSchema);