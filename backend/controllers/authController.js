const User  = require('../models/user')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncError');
const user = require('../models/user');
const sendToken = require('../utils/jwttoken');

//register a user  => /api/v1/register

exports.registerUser = catchAsyncError( async (req, res, next)=>{
    
    const {name, email, password} = req.body;

    const user = await User.create({
        name,
        email, 
        password,
        avatar:{
            public_id:'avatars/kccvibpsuiusmwfeb3m',
            url:'https://res.cloudinary.com/shopit/image/upload.png',
        }
    })

    sendToken(user, 200, res)
    // const token = user.getJwtToken();
    // res.status(201).json({
    //      success:true,
    //      token
    // })

})

exports.loginUser = catchAsyncError( async(req, res, next)=>{
    const {email, password } = req.body

    //Checking email and password
    if(!email || !password){
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    //Checking user in the database
    const user = await User.findOne({email}).select('+password')


    if(!user){
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    //Check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res)

})