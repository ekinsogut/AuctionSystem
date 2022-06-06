const express = require("express");
const router = express.Router();
const csrf = require("../middleware/csrf");
const isAuthenticated = require("../middleware/authentication");

//-----------------------------------------------------

const shopController = require("../controllers/shopController");

//-----------------------------------------------------

router.get("/products", csrf, isAuthenticated, shopController.getProducts);

//-----------------------------------------------------

router.get(
  "/products/:productid",
  csrf,
  isAuthenticated,
  shopController.getProduct
);

//-----------------------------------------------------

router.get(
  "/categories/:categoryid",
  csrf,
  isAuthenticated,
  shopController.getProductsByCategoryId
);

//-----------------------------------------------------

router.get("/cart", csrf, isAuthenticated, shopController.getCart);

//-----------------------------------------------------

router.post("/cart", csrf, isAuthenticated, shopController.postCart);

//-----------------------------------------------------

router.post(
  "/delete-cartitem",
  csrf,
  isAuthenticated,
  shopController.postCartItemDelete
);

//-----------------------------------------------------

router.post("/bid", csrf, isAuthenticated, shopController.postBid);

//-----------------------------------------------------

router.post("/create-order", csrf, isAuthenticated, shopController.postOrder);

//-----------------------------------------------------

router.get("/orders", csrf, isAuthenticated, shopController.getOrders);

//-----------------------------------------------------

router.get(
  "/orders/:orderid",
  csrf,
  isAuthenticated,
  shopController.getPayment
);

router.post("/orders", csrf, isAuthenticated, shopController.postPayment);

//-----------------------------------------------------

router.get(
  "/confirmation",
  csrf,
  isAuthenticated,
  shopController.getConfirmation
);

//-----------------------------------------------------

router.post("/comment", csrf, isAuthenticated, shopController.postComment);

//-----------------------------------------------------

router.post("/search", csrf, isAuthenticated, shopController.postSearch);

//-----------------------------------------------------

module.exports = router;
