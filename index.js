const express = require("express");
const mysql = require("mysql");

const app = express();

// DB creatConnection
const dbconfig = process.env.CLEARDB_DATABASE_URL || {
    host: "localhost",
    user: "root",
    password: "root",
    database: "photo_db"
};
const DBconnection = mysql.createConnection(dbconfig);


app.use((req, res, next) => {
    DBconnection.connect((err) => {
        if (err) console.error(err);
        else {
            console.log("DB connect!!");
            next();
        };
    })
});

app.use("/", require("./routers/home"));

app.use(() => DBconnection.end((err) => {
    if (err) console.error(err);
    else console.log("DB disconnect//")
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));