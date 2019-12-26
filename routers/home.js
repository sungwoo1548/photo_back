const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    res.json({ msg: "connection test" });
    next();
});

module.exports = router;