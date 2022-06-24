const Product = require('../models/product')

const ErrorHandler  = require('../utils/errorHandler')
const catchAsyncErrors   = require('../middlewares/catchAsyncError')
const ApiFeatures   = require('../utils/apiFeatures')

exports.newProduct = catchAsyncErrors(async(req, res, next) => {

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