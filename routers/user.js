const express = require("express");
const router = express.Router();

const { dbPool, dbconfig } = require("../dbPool");

// 신규 유저 등록
router.post("/join", (req, res) => {
    const { name } = req.body;
    dbPool.getConnection((err, connection) => { // 중복검사
        connection.query(`SELECT name FROM user where name = '${name}'`, (err, inqury_result) => {
            if (err) throw err;

            if (inqury_result.length == 0) { // DB 등록
                connection.query(`INSERT INTO user (name) VALUES ('${name}')`, (err, insert_result) => {
                    connection.release();
                    if (err) throw err;

                    res.json(insert_result);
                });
            } else {
                connection.release();
                res.json({ msg: "중복된 이름입니다.", result: false });
            }

        })

    });

});

module.exports = router;