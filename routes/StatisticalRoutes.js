const express = require('express');
const { totalAmount, totalAmountMonth, incomeStats, getOrderStatistics, getOrderStatusStatistics, statistics } = require('../controllers/StatisticalController');

const router = express.Router();

router.get("/total-amount", totalAmount)
router.get("/total-amount-month", totalAmountMonth)
router.get("/income-stats", incomeStats)
router.get("/orders/statistics", getOrderStatistics);
router.get("/orders/status-statistics", getOrderStatusStatistics);
router.get("/statistics", statistics);

module.exports = router;