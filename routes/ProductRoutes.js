const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByCategoryId,
  searchProduct,
  filterByCreatedDate,
  moreSearchProduct,
} = require("../controllers/ProductController");
const upload = require("../config/cloudinaryConfig");

router.post("/products", upload.single("image"), createProduct);
router.get("/products", getAllProducts);
router.get("/products/admin/search", moreSearchProduct);
router.get("/products/search", searchProduct);
router.get("/products/:id", getProductById);
router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/products/category/:category_id", getProductByCategoryId);
router.post('/products/filterCreatedDate', filterByCreatedDate);


module.exports = router;
