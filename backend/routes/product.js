const express = require('express')

const router = express.Router()

const {newProduct, getProduct, getSingleProduct, updateProduct, deleteProduct} = require('../controllers/prouctController')



router.route('/products')
.get(getProduct)

router.route('/product/:id')
.get(getSingleProduct)

router
.route('/admin/products/new')
.post(newProduct)

router.route('/admin/product/:id')
.put(updateProduct)
.delete(deleteProduct)


module.exports = router