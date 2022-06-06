const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const fs = require("fs");

//-----------------------------------------------------

exports.getCategories = (req, res, next) => {
  Category.find()
    .then((categories) => {
      res.render("admin/categories", {
        title: "Categories",
        path: "/admin/categories",
        categories: categories,
        action: req.query.action,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .populate("userId", "name -_id")
    .select(
      "name start_bid sale_price imageUrl userId current_bid isActive isSold"
    )
    .then((products) => {
      res.render("admin/products", {
        title: "Admin Products",
        products: products,
        path: "/admin/products",
        action: req.query.action,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getAddCategory = (req, res, next) => {
  res.render("admin/add-category", {
    title: "New Category",
    path: "/admin/add-category",
  });
};

//-----------------------------------------------------

exports.postAddCategory = (req, res, next) => {
  const name = req.body.name;
  const description = req.body.description;
  const image = req.file;

  if (!image) {
    return res.render("admin/add-category", {
      title: "New Category",
      path: "/admin/add-category",
      errorMessage: "Please choose image.",
    });
  }

  const category = new Category({
    name: name,
    description: description,
    imageUrl: image.filename,
  });

  category
    .save()
    .then((result) => {
      res.redirect("/admin/categories?action=create");
    })
    .catch((err) => {
      if (err.name == "ValidationError") {
        let message = "";
        for (field in err.errors) {
          message += err.errors[field].message + "<br>";
        }
        res.render("admin/add-category", {
          path: "/admin/add-category",
          title: "New Category",
          errorMessage: message,
        });
      } else {
        next(err);
      }
    });
};

//-----------------------------------------------------

exports.getEditCategory = (req, res, next) => {
  Category.findById(req.params.categoryid)
    .then((category) => {
      res.render("admin/edit-category", {
        title: "Edit Category",
        path: "/admin/categories",
        category: category,
      });
    })
    .catch((err) => console.log(err));
};

//-----------------------------------------------------

exports.postEditCategory = (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const description = req.body.description;
  const image = req.file;

  Category.findById(id)
    .then((category) => {
      category.name = name;
      category.description = description;

      if (image) {
        fs.unlink("public/projectImages/" + category.imageUrl, (err) => {
          if (err) {
            console.log(err);
          }
        });
        category.imageUrl = image.filename;
      }
      return category.save();
    })
    .then(() => {
      res.redirect("/admin/categories?action=edit");
    })
    .catch((err) => console.log(err));
};

//-----------------------------------------------------

exports.postDeleteCategory = (req, res, next) => {
  const id = req.body.categoryid;

  Category.findById(id, function (err, category) {
    if (err) {
      console.log(err);
    } else {
      if (category) {
        fs.unlink("public/projectImages/" + category.imageUrl, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    }
  });

  Category.findByIdAndRemove(id)
    .then(() => {
      res.redirect("/admin/categories?action=delete");
    })
    .catch((err) => {
      next(err);
    });
};

//-----------------------------------------------------

exports.getAddProduct = (req, res, next) => {
  Category.find()
    .then((categories) => {
      res.render("admin/add-product", {
        title: "New Product",
        path: "/admin/add-product",
        categories: categories,
      });
    })
    .catch((err) => console.log(err));
};

//-----------------------------------------------------

exports.postAddProduct = (req, res, next) => {
  const name = req.body.name;
  const description = req.body.description;
  const image = req.file;
  const start_bid = req.body.start_bid;
  const sale_price = req.body.sale_price;
  const last_date = req.body.last_date;
  const ids = req.body.categoryids;

  if (!image) {
    return res.render("admin/add-product", {
      title: "New Product",
      path: "/admin/add-product",
      errorMessage: "Please choose a picture!",
    });
  }
  const product = new Product({
    name: name,
    description: description,
    imageUrl: image.filename,
    start_bid: start_bid,
    current_bid: start_bid,
    sale_price: sale_price,
    last_date: last_date,
    categories: ids,
    userId: req.user,
    isActive: false,
  });
  product
    .save()
    .then(() => {
      res.redirect("/admin/products?action=create");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        let message = "";
        for (field in err.errors) {
          message += err.errors[field].message + "<br>";
        }
        res.render("admin/add-product", {
          title: "New Product",
          path: "/admin/add-product",
          errorMessage: message,
        });
      } else {
        res.status(500).render("admin/add-product", {
          title: "New Product",
          path: "/admin/add-product",
          errorMessage: "Unexpected error. Please try again!",
        });
      }
    });
};

//-----------------------------------------------------

exports.getEditProduct = (req, res, next) => {
  Product.findOne({ _id: req.params.productid, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      return product;
    })
    .then((product) => {
      Category.find().then((categories) => {
        categories = categories.map((category) => {
          if (product.categories) {
            product.categories.find((item) => {
              if (item.toString() === category._id.toString()) {
                category.selected = true;
              }
            });
          }
          return category;
        });

        res.render("admin/edit-product", {
          title: "Edit Product",
          path: "/admin/products",
          product: product,
          categories: categories,
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const description = req.body.description;
  const image = req.file;
  const start_bid = req.body.start_bid;
  const sale_price = req.body.sale_price;
  const last_date = req.body.last_date;
  const ids = req.body.categoryids;

  Product.findOne({ _id: id, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }

      product.name = name;
      product.description = description;
      product.start_bid = start_bid;
      product.sale_price = sale_price;
      product.last_date = last_date;
      product.categories = ids;

      if (image) {
        fs.unlink("public/projectImages/" + product.imageUrl, (err) => {
          if (err) {
            console.log(err);
          }
        });
        product.imageUrl = image.filename;
      }

      return product.save();
    })
    .then((result) => {
      res.redirect("/admin/products?action=edit");
    })
    .catch((err) => console.log(err));
};

//-----------------------------------------------------

exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.productid;

  Product.findOne({ _id: id, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return next(new Error("Not found the product for delete!"));
      }
      fs.unlink("public/projectImages/" + product.imageUrl, (err) => {
        if (err) {
          console.log(err);
        }
      });

      return Product.deleteOne({ _id: id, userId: req.user._id });
    })
    .then((result) => {
      if (result.deletedCount === 0) {
        return next(new Error("Not found the product for delete!"));
      }
      res.redirect("/admin/products?action=delete");
    })
    .catch((err) => {
      next(err);
    });
};

//-----------------------------------------------------

exports.postisActive = (req, res, next) => {
  const id = req.body.productid;

  Product.findOne({ _id: id, userId: req.user._id })
    .then((product) => {
      if (product.isActive === true) {
        product.isActive = false;
      } else {
        product.isActive = true;
      }
      return product.save();
    })
    .then((result) => {
      res.redirect("/admin/products?action=change");
    })
    .catch((err) => console.log(err));
};

//-----------------------------------------------------

exports.getOrders = (req, res, next) => {
  Order.find({ sellerUserId: req.user._id })
    .then((orders) => {
      res.render("admin/my-orders", {
        title: "Admin Orders",
        orders: orders,
        path: "/admin/orders",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getBuyerUser = (req, res, next) => {
  User.findById(req.params.buyerid)
    .then((user) => {
      res.render("admin/buyer-user", {
        title: "Buyer User",
        user: user,
        path: "/admin/buyer_user",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

