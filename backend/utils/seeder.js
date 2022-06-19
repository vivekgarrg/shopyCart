const Product = require('../models/product')
const dotenv = require('dotenv')
const connectDatabase = require('../config/databse')

const products = require('../data/product');


dotenv.config( { path: 'backend/config/config.env'})

connectDatabase()

const seedProducts = async () =>{
    try {

            await Product.deleteMany()
            console.log("Products deleted")

            await Product.insertMany(products)
            console.log("Products are added")

            process.exit();

    }catch(err){
        console.log(err.message)
        process.exit();
    }
}

seedProducts()