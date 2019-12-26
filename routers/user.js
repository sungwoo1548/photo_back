const express = require("express");
const router = express.Router();

const { dbPool, dbconfig } = require("../dbPool");
// 신규 유저 등록
router.post("/join", (req, res) => {
    const { name } = req.body;
    dbPool.getConnection((err, connection) => { // 중복검사
        connection.query(`SELECT name FROM user where name = '${name}'`, (err, inqury_result) => {
            if (err) throw err;

            if (inqury_result.length == 0) { // 중복이 없을 때, DB 등록
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

// 유저 로그인
router.post("/login", (req, res) => {
    const { name } = req.body;
    dbPool.getConnection((err, connection) => { // 유저 이름 확인
        connection.query(`SELECT name FROM user WHERE name ='${name}'`, (err, inqury_result) => {
            connection.release();
            if (err) throw err;

            if (inqury_result != 0) { // 로그인 성공   * 세션 또는 토큰 사용하여 로그인 유지 필요.
                res.json(inqury_result[0]);
            } else {
                res.json({ msg: "없는 이름입니다.", result: false });
            }
        })

    });

});

module.exports = router;