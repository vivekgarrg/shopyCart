const express = require('express')

const router = express.Router()

const {
    newProduct,
    getProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/prouctController')

const { isAuthenticatedUser, authorizedRole } = require('../middlewares/auth')

router.route('/products')
    .get( getProduct)

router.route('/product/:id')
    .get(getSingleProduct)

router
    .route('/admin/products/new')
    .post(isAuthenticatedUser,  authorizedRole("user"), newProduct)

router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizedRole("admin"), updateProduct)
    .delete(isAuthenticatedUser,  authorizedRole("admin"), deleteProduct)


module.exports = router