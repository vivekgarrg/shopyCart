const Product = require('../models/product')

const ErrorHandler  = require('../utils/errorHandler')
const catchAsyncErrors   = require('../middlewares/catchAsyncError')
const ApiFeatures   = require('../utils/apiFeatures')

exports.newProduct = catchAsyncErrors(async(req, res, next) => {
    
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    });
}) 

exports.getProduct = catchAsyncErrors(async(req, res, next) => {

    const resPerPage = 4
    const productCount = await Product.countDocuments();
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
                        .search()
                        .filter()
                        .pagination(resPerPage)

    const products = await apiFeatures.query;
    res.status(200).json({
        message: 'All products',
        count: products.length,
        productCount,
        products
    })
})

exports.getSingleProduct = catchAsyncErrors(async(req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next( new ErrorHandler('Product not found', 404) );
    }

    res.status(200).json({
        success: true,
        product
    });
})

exports.updateProduct = catchAsyncErrors(async(req, res,next) => {

    const product = await Product.findById(req.params.id);
    if(!product){
        return next( new ErrorHandler('Product not found', 404) );
    }

    const responce = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});

    res.status(200).json({
        success: true,
        responce
    })

})

exports.deleteProduct = catchAsyncErrors(async(req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next( new ErrorHandler('Product not found', 404) );
    }

    const deleteProduct = await Product.findByIdAndDelete(req.params.id)
    res.status(200).json({
        success: true,
        message: 'Product Deleted'
    })
})

//Create new review => /api/v1/review/
exports.createProductReview = catchAsyncErrors(async (req, res, next)=>{
    const {rating, comment, productId} = req.body;

    const review = {
        user: req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(r=>r.user.toString()===req.user._id.toString())

    if(isReviewed){
        product.reviews.forEach(rev=>{
            if(rev.user.toString()===req.user._id.toString()){
                rev.comment = comment;
                rev.rating = rating;
            }
        })
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    product.ratings = product.reviews.reduce((acc, item)=>item.rating+acc, 0)/product.reviews.length

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success:true
    })
})

// Get Product Reviews => /api/v1/reviews/  this id will come in query
exports.getProductReview = catchAsyncErrors(async (req, res, next)=>{
    const product = await Product.findById(req.query.id);


    res.status(200).json({
        success:true,
        reviews: product?.reviews || []
    })
})

// Delete Product Reviews => /api/v1/reviews/  this id will come in query
exports.DeleteReview = catchAsyncErrors(async (req, res, next)=>{
    const product = await Product.findByIdAndDelete(req.query.productId);


    const reviews = product.reviews.filter(review=>review._id.toString() !== req.query.id.toString())

    const numOfReviews = reviews.length;
      
    const ratings = product.ratings = product.reviews.reduce((acc, item)=>item.rating+acc, 0)/reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, { new:true})

    res.status(200).json({
        success:true
    })
})

