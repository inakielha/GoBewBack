const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderProduct = require("../models/orderProduct");
const Product = require("../models/Product");
const ObjectId = mongoose.Types.ObjectId;
/**
{
  userId: '629a6e92b98b31e4c460864b',
  orderTotal: 186471,
  shippingAddressId: '',
  cart: [
    {
      _id: '6290d8e06655f25f6df9a9f8',
      quantity: 2,
      productPrice: 20001,
      productName: 'Celular ZTEA'
    },
    {
      _id: '6290d9a66655f25f6df9a9fc',
      quantity: 1,
      productPrice: 146469,
      productName: 'Celular Xiaomi Redmi Note 10 PRO 8GB + 128 GB Onyx Grey'
    }
  ]
}
 */
const createOrder = async (req, res) => {
    const { userId, orderTotal } = req.body;

    const session = await Order.startSession();
    session.startTransaction();
    try {
        
        const opts = { session };
        const newOrder = new Order({userId, orderTotal, orderState:0 });
        await newOrder.save(opts);

        const orderId = newOrder._id;
        const orderProduct = req.body.cart.map(item => {
            return {
                orderId,
                productId: item._id,
                productCant: item.quantity,
                productPrice: item.productPrice
            }
        })
        
        const cart = await OrderProduct.insertMany(orderProduct, opts);
        
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            ok: true,
            orderId: newOrder._id,
            userId: newOrder.userId,
            orderTotal: newOrder.orderTotal,
            shippingAddressId: '',
            cart
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(501).json({
            ok: false,
            msg: error
        });
    }
}

//Carrito es una orden con estado 0
const getCarritoByUser = async (req, res) => {
    const { userId } = req.params;
    const order = await Order
    .aggregate([
        {$match: {userId: ObjectId(userId),orderState:0}},
        {$lookup: {
            from: 'orderproducts',
            localField:  '_id',
            foreignField:'orderId',
            as: 'cart'            
        }}
    ])
    if(!order){
        return res.status(404).json({
            ok: false,
            msg: 'El usuario no tiene un carrito de compras'
        })
    }

    const products = order[0].cart.map(item =>  item.productId)
        
    const productsDB = await Product.find({_id: {$in: products}}).select('_id productName')
    // console.log(productsDB)
    const obj = {
        orderId : order[0]._id,
        _id : order[0]._id,
        orderState : order[0].orderState,
        orderTotal : order[0].orderTotal,
        userId : order[0].userId,
        shippingAddressId : order[0].shippingAddressId,
        cart : order[0].cart.map(item => {
            return {
                _id : item._id,
                productId : item.productId,
                productName: productsDB.filter(product => product._id.toString() === item.productId.toString())[0].productName,
                productCant : item.productCant,
                productPrice : item.productPrice
            }
        })
    }
  

    res.status(200).json({
        ok: true,
        obj
        // ,
        // order,
        // productsDB
    })
}

module.exports = {
    createOrder,
    getCarritoByUser
}