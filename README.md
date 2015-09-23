# JANDI V1.1.2
## Release note
- **web_landing**
  - 없음
- **web_client**
  - file upload modal에서 comment 입력 되도록 수정
  - center chat에 이미지 붙여넣기시 file upload 가능 하도록 수정
  - 폴더를 접을 때  … 아이콘 위에 빨간 unread badge가 오버랩 되었다가 사라지는 현상 해결 
  - [Refresh token 갱신 이슈](http://its.tosslab.com/browse/JND-3451)
    - refresh token 이 존재하고, 401 응답 시 token refresh 로직 수행
    - 아래의 경우시 admin 페이지로 이동
      - 403 오류일 때 admin 페이지로 이동
      - 로그인 시 token 정보와 cookie 의 토큰 정보가 다를 경우
- **web_admin**
  - 없음

