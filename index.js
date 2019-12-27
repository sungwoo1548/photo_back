const express = require("express");

const app = express();
app.use(express.json());

app.use("/", require("./routers/home"));
app.use("/user", require("./routers/user")); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));