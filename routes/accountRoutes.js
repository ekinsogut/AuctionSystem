const express = require("express");
const router = express.Router();
const csrf = require("../middleware/csrf");

//-----------------------------------------------------

const accountController = require("../controllers/accountController");

//-----------------------------------------------------

router.get("/", csrf, accountController.getIndex);

//-----------------------------------------------------

router.get("/register", csrf, accountController.getRegister);
router.post("/register", csrf, accountController.postRegister);

//-----------------------------------------------------

router.get("/login", csrf, accountController.getLogin);
router.post("/login", csrf, accountController.postLogin);

//-----------------------------------------------------

router.get("/profile", csrf, accountController.getProfile);

//-----------------------------------------------------

router.get("/logout", csrf, accountController.getLogout);

//-----------------------------------------------------

router.get("/reset-password", csrf, accountController.getReset);
router.post("/reset-password", csrf, accountController.postReset);

//-----------------------------------------------------

router.get("/reset-password/:token", csrf, accountController.getNewPassword);
router.post("/new-password", csrf, accountController.postNewPassword);

//-----------------------------------------------------

router.get("/contact", csrf, accountController.getContact);
router.post("/contact", csrf, accountController.postContact);

//-----------------------------------------------------

module.exports = router;
