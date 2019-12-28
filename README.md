# 사진 업로드 서버

## REST API

| 구분                    | URL              | method | parameter                                   | response (json)                                              |
| ----------------------- | ---------------- | ------ | ------------------------------------------- | ------------------------------------------------------------ |
| 가입                    | /user/join       | post   | name                                        | ok : insert_result<br />fail : {msg, result}                 |
| 로그인                  | /user/login      | post   | name                                        | ok : inquery_result<br />fail :{msg, result}                 |
| 폴더생성                | /user/mkdir      | post   | name, folderName                            | ok : {msg}<br />fail : {msg, result}                         |
| 이미지 저장             | /user/saveimg    | post   | name, folderName, imgArray[{url:[...tags]}] | ok : {msg}<br />lack of point : {msg, result}<br />fail : throw err |
| 포인트 미사용 폴더 조회 | /user/unspentdir | post   | name                                        | ok:[unspentPonitFolder]<br />fail : throw err                |
| 폴더조회                | /user/getdir     | post   | name                                        | ok : [folderList]<br />fail : throw err                      |
| 이미지 조회             | /user/getimg     | post   | name, folderName                            | ok : [imgURL_recent]<br />fail : throw err                   |
| top10 조회              | /user/top10      | get    | -                                           | ok : [tagSortedList]<br />fail : throw err                   |



## 서버 사용법

1.  git hub :  https://github.com/sungwoo1548/photo_back  에서
   $ git clone을 한다.

2. $ cd photo_back 
   $ yarn
   으로 의존성 모듈을 설치한다.

3.  PC에 mysql 서버를 설치한다. (설명 생략)
    photo_db 스키마를 만들고
    user 테이블을 생성한다 (다른 문서에서 테이블 sql문 참고)

4.  $ yarn start
   로 서버를 구동한다.

5.  브라우저에서
    localhost:3000/ 을 입력하면 
    화면에 {"msg":"connection test"} 라는 글씨가 보이면 
   정상적으로 서버가 가동된 것임.

6. POSTMAN 이라는 프로그램을 이용해 api test를 진행한다. (postman 사용법 생략)

7.  localhost:3000/user/join 으로
    post 방식 body에 {"name":"newname"} 전송하면 

    .../photo_back/user_dir_info 가 생긴다.

8.  user_dir_info 디렉토리는 
    유저 가입시 이름별로 json파일이 생성되어 저장된다.

    해당 json파일은

   1. 유저의 개인폴더 명
   2. 폴더에 할당된 포인트 및 사용된 포인트
   3. 이미지 주소 및 해당 이미지 별 태그정보

    가 저장되어있다.

9.  유저는 자신의 폴더를 만들어야 한다.
    localhost:3000/user/mkdir 으로
    post 방식 name 과 folderName을 보내면 
    유저 json파일에 정보가 기록된다.
    (실제 상황에서는 json파일의 역할을 index Server가 대신하고, 업로드된 이미지는 image Server에 저장된다고 할 수있다.)

10.  이후로는 본 문서의 api table을 보면서 기능 테스트를 진행하면 된다.