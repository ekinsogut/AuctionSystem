const User = require("../models/User");
const Login = require("../models/login");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Category = require("../models/Category");

//-----------------------------------------------------

const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

//-----------------------------------------------------

exports.getIndex = (req, res, next) => {
  Category.find()
    .then((categories) => {
      res.render("account/index", {
        title: "Index",
        path: "/",
        categories: categories,
      });
    })
    .catch((err) => {
      res.redirect("/500");
    });
};

//-----------------------------------------------------

exports.getRegister = (req, res, next) => {
  var errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("account/register", {
    path: "/register",
    title: "Register",
    errorMessage: errorMessage,
  });
};

//-----------------------------------------------------

exports.postRegister = (req, res, next) => {
  const name = req.body.name;
  const surname = req.body.surname;
  const birth = req.body.birth;
  const email = req.body.email;
  const password = req.body.password;
  const phone = req.body.phone;
  const country = req.body.country;
  const address = req.body.address;
  const cartNo = req.body.cartNo;
  const image = req.file;

  if (!image) {
    return res.render("account/register", {
      title: "Register",
      path: "/register",
      errorMessage: "Please choose image.",
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.session.errorMessage =
          "Previously registered with this e-mail address.";
        req.session.save(function (err) {
          console.log(err);
        });
        return res.redirect("/register");
      }
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      const newUser = new User({
        name: name,
        surname: surname,
        birth: birth,
        email: email,
        password: hashedPassword,
        phone: phone,
        country: country,
        address: address,
        cartNo: cartNo,
        imageUrl: image.filename,
        cart: { items: [] },
      });
      return newUser.save();
    })
    .then(() => {
      const message = "Registration succesful.";
      res.render("account/login", {
        path: "/login",
        title: "Login",
        errorMessage: message,
      });
    })
    .catch((err) => {
      if (err.name == "ValidationError") {
        let message = "";
        for (field in err.errors) {
          message += err.errors[field].message + "<br>";
        }
        res.render("account/register", {
          path: "/register",
          title: "Register",
          errorMessage: message,
        });
      } else {
        next(err);
      }
    });
};

//-----------------------------------------------------

exports.getLogin = (req, res, next) => {
  var errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("account/login", {
    path: "/login",
    title: "Login",
    errorMessage: errorMessage,
  });
};

//-----------------------------------------------------

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const loginModel = new Login({
    email: email,
    password: password,
  });

  loginModel
    .validate()
    .then(() => {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            req.session.errorMessage =
              "No records were found with this email address.";
            req.session.save(function (err) {
              return res.redirect("/login");
            });
          }
          bcrypt
            .compare(password, user.password)
            .then((isSuccess) => {
              if (isSuccess) {
                req.session.user = user;
                req.session.isAuthenticated = true;
                return req.session.save(function (err) {
                  var url = req.session.redirectTo || "/";
                  delete req.session.redirectTo;
                  return res.redirect(url);
                });
              }
              req.session.errorMessage = "False e-mail or password.";
              req.session.save(function (err) {
                return res.redirect("/login");
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      if (err.name == "ValidationError") {
        let message = "";
        for (field in err.errors) {
          message += err.errors[field].message + "<br>";
        }
        res.render("account/login", {
          path: "/login",
          title: "Login",
          errorMessage: message,
        });
      } else {
        next(err);
      }
    });
};

//-----------------------------------------------------

exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

//-----------------------------------------------------

exports.getProfile = (req, res, next) => {
  res.render("account/profile", {
    title: "Profile",
    path: "/profile",
    user: req.user,
  });
};

//-----------------------------------------------------

exports.getReset = (req, res, next) => {
  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;

  res.render("account/reset", {
    path: "/reset-password",
    title: "Reset Password",
    errorMessage: errorMessage,
  });
};

//-----------------------------------------------------

exports.postReset = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset-password");
    }

    const token = buffer.toString("hex");

    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.session.errorMessage = "Email address not found.";
          req.session.save(function (err) {
            console.log(err);
            return res.redirect("/reset-password");
          });
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        return user.save();
      })
      .then(() => {
        const transporter = nodemailer.createTransport(
          smtpTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
              user: process.env.USER,
              pass: process.env.PASSWORD,
            },
          })
        );

        const mailOptions = {
          from: "ekinsogut1@gmail.com",
          to: email,
          subject: "Reset Password",
          html: `<p>Parolanızı güncellemek için aşağıda ki linke tıklayınız!</p>
                <p><a href="http://localhost:3000/reset-password/${token}">Reset Password!</a></p>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email send.");
          }
        });
        res.redirect("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

//-----------------------------------------------------

exports.getNewPassword = (req, res, next) => {
  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;

  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
  })
    .then((user) => {
      res.render("account/new-password", {
        path: "/new-password",
        title: "New Password",
        errorMessage: errorMessage,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let _user;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
    _id: userId,
  })
    .then((user) => {
      _user = user;
      return bcrypt.hash(newPassword, 10);
    })
    .then((hashedPassword) => {
      _user.password = hashedPassword;
      _user.resetToken = undefined;
      _user.resetTokenExpiration = undefined;
      return _user.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};

//-----------------------------------------------------

exports.getContact = (req, res, next) => {
  var errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("account/contact", {
    path: "/contact",
    title: "Contact Us",
    errorMessage: errorMessage,
  });
};

//-----------------------------------------------------

exports.postContact = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const subject = req.body.subject;
  const message = req.body.message;

  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: email,
        pass: password,
      },
    })
  );

  const mailOptions = {
    from: email,
    to: process.env.USER,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email send.");
    }
  });
  res.redirect("/contact");
};

//-----------------------------------------------------
