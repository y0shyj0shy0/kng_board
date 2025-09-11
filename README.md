# Node.js + MySQL 게시판 프로젝트  

이 프로젝트는 **Node.js(Express)** 와 **MySQL**을 활용하여 구현한 풀스택 게시판입니다.  
사용자는 회원가입, 로그인 후 게시글 작성, 댓글 작성, 좋아요, 게시글/댓글 삭제 등의 기능을 이용할 수 있습니다.  

---

## 주요 기능  

### 사용자 관리  
- **회원가입**: ID, 비밀번호, 닉네임 중복 검사 후 신규 유저 등록  
- **로그인 / 로그아웃**: 세션(Session) 기반 로그인/로그아웃 처리  
- **세션 관리**: 로그인 상태 유지, 닉네임 표시  

### 게시글 관리  
- **게시글 목록 조회** (`/`)  
  - 페이지네이션 (9개 게시글 단위로 표시)  
- **게시글 작성** (`/write`)  
  - 로그인한 사용자만 작성 가능  
- **게시글 상세보기** (`/views?id=...`)  
  - 게시글 내용, 작성자, 작성일시 표시  
  - 댓글 목록, 댓글 작성 기능 포함  
- **게시글 삭제** (`/delete?id=...`)  
  - 게시글 및 해당 게시글의 댓글 함께 삭제  

### 댓글 관리  
- **댓글 작성** (`/views` POST)  
- **댓글 삭제** (`/cmt_delete?id=...&cmtid=...`)  

### 좋아요 기능  
- **좋아요 / 좋아요 취소** (`/like?id=...`)  
  - 좋아요 수(post.like_cnt) 증가/감소  
  - 사용자별 좋아요 여부 DB에 저장 (`like_table`)  

### REST API 제공  
- **게시글 목록 API** (`/api/posts?page=n`)  
  - JSON 응답: 게시글 목록, 페이지 정보  
- **게시글 상세 API** (`/api/post/:id`)  
  - JSON 응답: 게시글 + 댓글 목록  

---
## 게시판 이미지
<img width="628" height="495" alt="myboard" src="https://github.com/user-attachments/assets/891437df-a187-4832-a031-831a339b3a27" />

---
## 데이터베이스 구조 (예시)  

```sql
-- 유저 테이블
CREATE TABLE user (
    user_id VARCHAR(50) PRIMARY KEY,
    user_pw VARCHAR(100) NOT NULL,
    user_nickname VARCHAR(50) UNIQUE NOT NULL
);

-- 게시글 테이블
CREATE TABLE post (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    board_id INT NOT NULL,
    user_nickname VARCHAR(50) NOT NULL,
    post_title VARCHAR(200) NOT NULL,
    post_content TEXT NOT NULL,
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    like_cnt INT DEFAULT 0
);

-- 댓글 테이블
CREATE TABLE comment (
    cmt_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_nickname VARCHAR(50) NOT NULL,
    cmt_content TEXT NOT NULL,
    cmt_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 좋아요 테이블
CREATE TABLE like_table (
    user_nickname VARCHAR(50) NOT NULL,
    post_id INT NOT NULL,
    PRIMARY KEY (user_nickname, post_id)
);
