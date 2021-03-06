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
 * ++ 기능 추가 : 포인트 기능
 */

router.post("/mkdir", (req, res) => {
    const { name, folderName } = req.body;

    fs.readFile(`user_dir_info/${name}.json`, (err, data) => {
        if (err) throw err;

        const pre_data = JSON.parse(data);
        const duplicate = pre_data.findIndex(el => el.folderName == folderName);
        if (duplicate == -1) { // 폴더명 중복 방지
            const new_data = { folderName: folderName, point: 1000, spent_point: 0 }; // 포인트 지급
            pre_data.push(new_data);

            fs.writeFile(`user_dir_info/${name}.json`, JSON.stringify(pre_data), (err) => {
                if (err) throw err;
                res.json({ msg: "새로운 폴더 생성됨" });
            })
        } else {
            res.json({ msg: "같은 이름의 폴더가 있습니다.", result: false });
        }

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

        const pointList = [];
        pre_data.map(el => pointList.push({ point: el.point, spent_point: el.spent_point }));

        const all_point = pointList.map(el => el.point).reduce((acc, cur) => acc + cur);
        const all_spent_point = pointList.map(el => el.spent_point).reduce((acc, cur) => acc + cur);
        const usablePoint = all_point - all_spent_point;
        console.log(usablePoint); // 디버그용

        if (usablePoint < 100 * imgArray.length) { // 이미지 등록 1개당 100포인트
            res.json({ msg: "포인트 부족", result: false });

        } else { // 포인트가 있는 경우
            const pointListIndex = Math.floor(all_spent_point / 1000); // 선입선출용 index 구하기
            console.log(pointListIndex);

            const folderIndex = await pre_data.findIndex(el => el.folderName == folderName);
            console.log(pre_data[folderIndex]); // 디버그용

            if (pre_data[folderIndex].imgURLs) { // 추가 등록
                pre_data[folderIndex].imgURLs.push(...imgArray);

                // 포인트 사용 적용
                // 인출 대상 폴더의 남은 포인트 만큼 채운 후 몫,나머지 이용해서 계산
                const costPoint = 100 * imgArray.length;
                const cur_folderBudget = pre_data[pointListIndex].point - pre_data[pointListIndex].spent_point;

                const costRemain = costPoint - cur_folderBudget;
                console.log(costRemain);

                if (costRemain <= 0) {
                    pre_data[pointListIndex].spent_point += costPoint;
                } else {
                    pre_data[pointListIndex].spent_point = 1000;
                    
                    const quotient = Math.floor(costRemain / 1000);
                    const remainder = costRemain % 1000;

                    for (i = 0; i < quotient; i++) {
                        pre_data[pointListIndex + i + 1].spent_point = 1000;
                    }
                    pre_data[pointListIndex + quotient + 1].spent_point = remainder;

                }
            } else { // 신규 등록
                const new_data = { ...pre_data[folderIndex], imgURLs: imgArray }
                pre_data[folderIndex] = new_data;

                // 포인트 사용 적용
                // 인출 대상 폴더의 남은 포인트 만큼 채운 후 몫,나머지 이용해서 계산
                const costPoint = 100 * imgArray.length;
                const cur_folderBudget = pre_data[pointListIndex].point - pre_data[pointListIndex].spent_point;

                const costRemain = costPoint - cur_folderBudget;

                if (costRemain <= 0) {
                    pre_data[pointListIndex].spent_point += costPoint;
                } else {
                    pre_data[pointListIndex].spent_point = 1000;

                    const quotient = Math.floor(costRemain / 1000);
                    const remainder = costRemain % 1000;

                    for (i = 0; i < quotient; i++) {
                        pre_data[pointListIndex + i + 1].spent_point = 1000;
                    }
                    pre_data[pointListIndex + quotient + 1].spent_point = remainder;

                }
            }

            fs.writeFile(`user_dir_info/${name}.json`, JSON.stringify(pre_data), (err) => {
                if (err) throw err;
                res.json({ msg: "내용 업데이트 됨" });
            });
        };

    });

});

/**
 * 포인트 미사용 폴더 조회
 */
router.post("/unspentdir", (req, res) => {
    const { name } = req.body;

    fs.readFile(`user_dir_info/${name}.json`, async (err, data) => {
        if (err) throw err;

        const userData = JSON.parse(data);
        const unspentPointFolder = userData.filter(el => el.spent_point == 0);
        res.json(unspentPointFolder);
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

/**
 * 태그 서비스 
 * 이미지 등록시 api /user/saveimg 에서 사용되는 파라미터 imgArray 는 imgURLs:[{imgURL1:["tag",""...]},{imgURL2:["tag",""...]}...]형식으로 구성됨
 * top10 서비스 기능 구현
 * 각 유저의 인덱싱파일을 읽어 전체 사진에 대해 태그순으로 정렬
 */

router.get("/top10", (req, res) => {
    const tagSortedList = [];
    const fileList = fs.readdirSync(`user_dir_info/`);

    fileList.map(fileName => {
        const userFolder = fs.readFileSync(`user_dir_info/${fileName}`);
        const folderList = JSON.parse(userFolder);

        folderList.map(folder => {

            for (i = 0; i < folder.imgURLs.length; i++) {
                const imgURL = (Object.keys(folder.imgURLs[i]))[0]
                tagSortedList.push({
                    name: fileName.split(".")[0],
                    folderName: folder.folderName,
                    imgURL,
                    tagNum: folder.imgURLs[i][imgURL].length,
                });
            }
        })
    });

    // tagNum 순으로 내림차순 정렬
    tagSortedList.sort(function (a, b) {
        if (a.tagNum > b.tagNum) {
            return -1;
        }
        if (a.tagNum < b.tagNum) {
            return 1;
        }
        return 0;
    });
    // console.log(tagSortedList);  // 디버그용

    // res.json(tagSortedList);  // 전체 반환 후 client에서 top10 처리

    // top10 만 반환
    if (tagSortedList.length < 10) {
        res.json(tagSortedList);
    } else {
        res.json(tagSortedList.slice(0, 10));
    }
});

module.exports = router;