const mysql = require("mysql");

const dbconfig = process.env.CLEARDB_DATABASE_URL || {
    host: "localhost",
    user: "root",
    password: "root",
    database: "photo_db",
};

const dbPool = mysql.createPool({
    connectionLimit: 10,
    ...dbconfig
});

module.exports = { dbPool, dbconfig };