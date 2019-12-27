# 사진 업로드 서버

## REST API

| 구분        | URL           | method | parameter                  | response (json)                              |
| ----------- | ------------- | ------ | -------------------------- | -------------------------------------------- |
| 가입        | /user/join    | post   | name                       | ok : insert_result<br />fail : {msg, result} |
| 로그인      | /user/login   | post   | name                       | ok : inquery_result<br />fail :{msg, result} |
| 폴더생성    | /user/mkdir   | post   | name, folderName           | ok : {msg}<br />fail : throw err             |
| 이미지 저장 | /user/saveimg | post   | name, folderName, imgArray | ok : {msg}<br />fail : throw err             |
| 폴더조회    | /user/getdir  | post   | name                       | ok : [folderList]<br />fail : throw err      |
| 이미지 조회 | /user/getimg  | post   | name, folderName           | ok : [imgURL_recent]<br />fail : throw err   |

