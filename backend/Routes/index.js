const express = require("express");
const router = express.Router();
const admin = require("./admin");
const intern = require("./internship");
const job = require("./job");
const application=require("./application")
const payment = require("./payment");
const resume = require("./resume");
const language = require("./language");
const loginhistory = require("./loginhistory");
const post = require("./post");

router.use("/admin", admin);
router.use("/internship", intern);
router.use("/job", job);
router.use("/application", application);
router.use("/payment", payment);
router.use("/resume", resume);
router.use("/language", language);
router.use("/loginhistory", loginhistory);
router.use("/post", post);

module.exports = router;
