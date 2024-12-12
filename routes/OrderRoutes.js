const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getBestSelling,
  createPayment,
  executePayment,
  filterByOrderDate,
  getTopSellingWeek,
  getOrderByUserId,
  searchOrders
} = require("../controllers/OrderController");

router.get("/order/user/:userId", getOrderByUserId);
router.get("/order", getAllOrders);
router.post("/order", createOrder);
router.get('/order/search', searchOrders);
router.get("/order/:id", getOrderById);
router.put("/order/:id", updateOrder);
router.delete("/order/:id", deleteOrder);
router.get("/top-selling-products", getBestSelling);
router.post('/create-payment', createPayment);
router.get('/execute-payment', executePayment);
router.post('/order/filterOrderDate', filterByOrderDate);
router.get('/top-week', getTopSellingWeek);

module.exports = router;
