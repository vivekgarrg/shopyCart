const User = require('../models/user')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncError');
const user = require('../models/user');
const sendToken = require('../utils/jwttoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


//register a user  => /api/v1/register

exports.registerUser = catchAsyncError(async (req, res, next) => {

    const {
        name,
        email,
        password
    } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'avatars/kccvibpsuiusmwfeb3m',
            url: 'https://res.cloudinary.com/shopit/image/upload.png',
        }
    })

    sendToken(user, 200, res)

})

exports.loginUser = catchAsyncError(async (req, res, next) => {
    const {
        email,
        password
    } = req.body

    //Checking email and password
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    //Checking user in the database
    const user = await User.findOne({
        email
    }).select('+password')


    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    //Check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res)

})

//Forgot Password--> api/v1/password/forgot

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({
        email: req.body.email
    });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    //Get reset token 
    const resetToken = user.getResetPasswordToken();

    await user.save({
        validateBeforeSave: false
    });

    //Create reset password url 
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email just ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopyCart Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({
            validateBeforeSave: false
        });

        return next(new ErrorHandler(err.message, 500));
    }
})

//Reset Password--> api/v1/password/reset:token

exports.resetPassword = catchAsyncError(async (req, res, next) => {

    //Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    })

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    //Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()

    sendToken(user, 200, res);

})

//Get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    console.log(req.user)

    const user = await User.findById(req.user.id);



    res.status(200).json({
        success: true,
        user
    })
})


// Update/Change password  => /api/v1/password/update
exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //Check previous user password 
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
        return next(new ErrorHandler('old password is incorrect'));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res);
})

//Update user profile => /api/v1/me/update
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    //Update avatar: Todo


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true
    })
})

exports.logOut = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.status(200).json({
        success: true,
        message: "Logged out success."
    })
})


//Admin Routes =====>


//Get all users
exports.allUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

//Get user details ==> api/v1/admin/user/:id
exports.getuserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found by id ${req.params.id}`, 400))
    }

    res.status(200).json({
        success: true,
        user
    })
})

//User profile update by id ==> api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorHandler(`User does not found by id ${req.params.id}`, 400))
    }

    res.status(200).json({
        success: true
    })
})

//User profile update by id ==> api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found by id ${req.params.id}`, 400))
    }

    //Delete avatar from cloudinary -todo

    res.status(200).json({
        success: true
    })
})