const mysql = require("mysql");

const dbconfig = process.env.CLEARDB_DATABASE_URL && { host: "us-cdbr-iron-east-05.cleardb.net", user: "b6cae4aeb83344", password: "93fd146c", database: "heroku_939679a53fddc87" }
    || { host: "us-cdbr-iron-east-05.cleardb.net", user: "b6cae4aeb83344", password: "93fd146c", database: "heroku_939679a53fddc87" };

const dbPool = mysql.createPool({
    connectionLimit: 10,
    ...dbconfig
});

module.exports = { dbPool, dbconfig };