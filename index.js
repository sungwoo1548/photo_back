const express = require("express");
const mysql = require("mysql");

const app = express();

app.use("/home", require("./routers/home"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));