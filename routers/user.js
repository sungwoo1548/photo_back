const express = require("express");
const router = express.Router();
const fs = require("fs");

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

                    // 등록 시 인덱스용 파일 생성
                    fs.writeFile(`user_dir_info/${name}.json`, JSON.stringify([]), (err) => {
                        if (err) throw err;
                    });

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

/**
 * 폴더 생성 기능
 * 파일서버는 다른곳에 있음
 * 해당 유저의 이름과 폴더명이 맵핑되는 인덱싱용 json형식의 파일 생성
 */

router.post("/mkdir", (req, res) => {
    const { name, folderName } = req.body;

    fs.readFile(`user_dir_info/${name}.json`, (err, data) => {
        if (err) throw err;

        const pre_data = JSON.parse(data);
        const new_data = { folderName: folderName } // 추후 중복방지 필요
        pre_data.push(new_data);

        fs.writeFile(`user_dir_info/${name}.json`, JSON.stringify(pre_data), (err) => {
            if (err) throw err;
            res.json({ msg: "새로운 폴더 생성됨" });
        })
    });

});

/**
 * 이미지 저장 기능
 * 이미지 URL을 해당 folder 배열 아래에 추가하여 인덱싱용 파일을 업데이트함.
 * imgArray 는 imgURL과 tag배열을 포함한다.
 */

router.post("/saveimg", (req, res) => {
    const { name, folderName, imgArray } = req.body;

    fs.readFile(`user_dir_info/${name}.json`, async (err, data) => {
        if (err) throw err;

        const pre_data = JSON.parse(data);
        const folderIndex = await pre_data.findIndex(el => el.folderName == folderName);
        console.log(pre_data[folderIndex]);
        if (pre_data[folderIndex].imgURLs) {
            pre_data[folderIndex].imgURLs.push(...imgArray);
        } else {
            const new_data = { ...pre_data[folderIndex], imgURLs: imgArray }
            pre_data[folderIndex] = new_data;
        }

        fs.writeFile(`user_dir_info/${name}.json`, JSON.stringify(pre_data), (err) => {
            if (err) throw err;
            res.json({ msg: "내용 업데이트 됨" });
        })
    });

});


/**
 * 폴더 조회 기능
 * 생성한 순서대로 조회하고, 저장된 이미지 개수를 파악한다.
 */

router.post("/getdir", (req, res) => {
    const { name } = req.body;

    fs.readFile(`user_dir_info/${name}.json`, async (err, data) => { // 유저의 인덱싱용 파일을 읽어온다.
        if (err) throw err;

        const user_data = JSON.parse(data);

        const folderList = []; // [{ 폴더명 : 사진수 }]
        await user_data.map(el => {
            folderList.push({ folderName: el.folderName, imgNum: el.imgURLs.length });
        });
        res.json(folderList);
    });
});

/**
 * 특정 폴더에서 이미지 조회 기능
 * 최근 저장한 순서대로 조회된다.
 */

router.post("/getimg", (req, res) => {
    const { name, folderName } = req.body;

    fs.readFile(`user_dir_info/${name}.json`, async (err, data) => { // 유저의 인덱싱용 파일을 읽어온다.
        if (err) throw err;

        const user_data = JSON.parse(data);

        const folderData = await user_data.find(el => el.folderName == folderName);

        const imgURL_recent = [];

        await folderData.imgURLs.map(el => {
            imgURL_recent.push(Object.keys(el));
        })

        imgURL_recent.reverse(); // 최신순

        res.json(imgURL_recent);
    });
});


module.exports = router;