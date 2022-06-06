const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Comment = require("../models/Comment");
const { text } = require("express");

//-----------------------------------------------------

exports.getProducts = (req, res, next) => {
  Product.find({ isActive: true })
    .then((products) => {
      return products;
    })
    .then((products) => {
      Category.find().then((categories) => {
        res.render("shop/products", {
          title: "Products",
          products: products,
          path: "/products",
          categories: categories,
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getProductsByCategoryId = (req, res, next) => {
  const categoryid = req.params.categoryid;
  const model = [];

  Category.find()
    .then((categories) => {
      model.categories = categories;
      return Product.find({
        categories: categoryid,
        isActive: true,
      });
    })
    .then((products) => {
      res.render("shop/products", {
        title: "Products",
        products: products,
        categories: model.categories,
        selectedCategory: categoryid,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getProduct = (req, res, next) => {
  const model = [];

  Product.findById(req.params.productid)
    .then((product) => {
      model.product = product;

      return Comment.find({ productId: product._id });
    })
    .then((comments) => {
      res.render("shop/product-detail", {
        title: "Product Detail",
        product: model.product,
        comments: comments,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      res.render("shop/cart", {
        title: "Cart",
        path: "/cart",
        products: user.cart.items,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

//-----------------------------------------------------

exports.postCartItemDelete = (req, res, next) => {
  const productid = req.body.productid;
  req.user.deleteCartItem(productid).then(() => {
    res.redirect("/cart");
  });
};

//-----------------------------------------------------

exports.postBid = (req, res, next) => {
  const current_bid = req.body.current_bid;

  const model = [];

  Product.findById(req.body.productId)
    .then((product) => {
      product.current_bid = current_bid;
      product.last_bidder = req.user;

      product.save();

      model.product = product;

      return Comment.find({ productId: product._id });
    })
    .then((comments) => {
      res.render("shop/product-detail", {
        title: "Product Detail",
        product: model.product,
        comments: comments,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.postOrder = (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
      if (product.start_bid === product.current_bid) {
        product.isActive = false;
        product.isSold = false;

        product.save();

        res.redirect("/");
      } else {
        const order = new Order({
          productName: product.name,
          productImg: product.imageUrl,
          productCurrentBid: product.current_bid,
          productId: product._id,
          sellerUserId: product.userId,
          buyerUserId: product.last_bidder,
          isPayment: false,
        });

        product.isActive = false;
        product.isSold = true;

        product.save();
        order.save();

        res.redirect("/");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getOrders = (req, res, next) => {
  Order.find({ buyerUserId: req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        title: "My Orders",
        orders: orders,
        path: "/orders",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getPayment = (req, res, next) => {
  const id = req.params.orderid;

  Order.findById(id)
    .then((order) => {
      res.render("shop/payment", {
        title: "Payment",
        order: order,
        path: "/orders",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.postPayment = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const address = req.body.address;
  const zipcode = req.body.zipcode;
  const city = req.body.city;
  const country = req.body.country;
  const cartNumber = req.body.cartNumber;
  const expiry = req.body.expiry;
  const cvc = req.body.cvc;
  const orderid = req.body.orderid;
  const selleruserid = req.body.selleruserid;

  const payment = new Payment({
    name: name,
    email: email,
    address: address,
    zipCode: zipcode,
    city: city,
    country: country,
    cartNumber: cartNumber,
    expiry: expiry,
    cvc: cvc,
    orderId: orderid,
  });

  payment.save();

  Order.findById(orderid, function (err, order) {
    if (err) {
      console.log(err);
    } else {
      if (order) {
        order.isPayment = true;
        order.save();
      }
    }
  });

  User.findById(selleruserid)
    .then((user) => {
      res.render("shop/confirmation", {
        title: "Confirmation",
        path: "/confirmation",
        user: user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getConfirmation = (req, res, next) => {
  res.render("shop/confirmation", {
    path: "/confirmation",
    title: "Confirmation",
  });
};

//-----------------------------------------------------

exports.postComment = (req, res, next) => {
  const userName = req.user.name;
  const userImg = req.user.imageUrl;
  const userid = req.user._id;
  const productId = req.body.productId;
  const commentContent = req.body.commentContent;

  const comment = new Comment({
    userName: userName,
    userImg: userImg,
    userid: userid,
    productId: productId,
    commentContent: commentContent,
  });

  comment.save();

  Product.findById(productId, function (err, product) {
    if (err) {
      console.log(err);
    } else {
      if (product) {
        return product.addToCart(comment);
      }
    }
  });

  const model = [];

  Product.findById(productId)
    .then((product) => {
      model.product = product;
      return Comment.find({ productId: product._id });
    })
    .then((comments) => {
      res.render("shop/product-detail", {
        title: "Product Detail",
        product: model.product,
        comments: comments,
        path: "/products",
      });
    });
};

//-----------------------------------------------------

exports.postSearch = (req, res, next) => {
  const searchText = req.body.sText;
  //{ isActive: true, name: searchText }
  if (searchText !== null) {
    Product.find({name: { $regex: '.*' + searchText + '.*' } })
      .then((products) => {
        return products;
      })
      .then((products) => {
        Category.find().then((categories) => {
          res.render("shop/products", {
            title: "Products",
            products: products,
            path: "/products",
            categories: categories,
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

//-----------------------------------------------------
