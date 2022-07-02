const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

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

userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next()
    }
     
    this.password = await bcrypt.hash(this.password, 10)
})

//Compare user password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

//Return JWT token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

userSchema.methods.getResetPasswordToken = function(){

    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken
}

module.exports = mongoose.model('user', userSchema);