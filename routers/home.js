const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    res.json({ msg: "connection test" });
})

module.exports = router;