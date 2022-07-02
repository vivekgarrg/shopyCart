const Order = require('../models/order');
const Product = require('../models/product');


const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const order = require('../models/order');


//Create a new order => /api/v1/order/new
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

//Get single order ==> /api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new ErrorHandler('No order found with this id', 404));
    }

    res.status(200).json({
        success: true,
        order
    })
})

//Get loggedin user orders ==> /api/v1/order/me
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({
        user: req.user.id
    })

    if (!orders) {
        return next(new ErrorHandler('No order found with this user', 404));
    }

    res.status(200).json({
        success: true,
        orders
    })
})

//Get all orders  ==> /api/v1/admin/orders/
exports.allOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

// Update/Process orders  ==> /api/v1/admin/order/:id
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler('You have already delivered this order', 400))
    }

    let response;
    order.orderItems.forEach(async item=>{
      response =  await updateStock(item.product, item.quantity)
    })

    if(!response) return next(new ErrorHandler('No product find with this order', 400));

    order.orderStatus = req.body.orderStatus
    if(req.body.orderStatus==="Delivered")
     order.deliveredAt = Date.now()
    else
      order.lastUpdate = Date.now()   

    await order.save()

    res.status(200).json({
        success: true
    })
})

//Delete order ==> /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if(!order){
        return next(new ErrorHandler('Order not found with this id', 400));
    }

    res.status(200).json({
        success: true
    })
})

async function updateStock(id, quantity){
    const product = await Product.findById(id);

    if(!product) return false;
   
    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false }); 

    return true;
}