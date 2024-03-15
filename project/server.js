const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const dbConnect = mysql.createConnection({
    host : '10.100.54.111',
    user : 'kng',
    port : '3306',
    password : 'Hackinghajima_5',
    database : 'my_board'
});
const hostname = '10.100.54.111';
const port = 3003;

// 외부접속 : 아이피 주소 확인 -> 포트 열기 -> 포트포워딩 -> 접속

let lgnStatus;

dbConnect.connect((error) => {
    if (error) console.log(error);
    else console.log("db connected");
});

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");
app.set("views", "./views");

app.listen(port, hostname, () =>
    console.log("running on port 3003")
);

app.get('/', (req, res) => {
    let datas = [];
    let page = 1;
    if(req.query && req.query.page) {
        page = req.query.page;
    }
    const cntPerPage = 9;
    //페이지 정의 
    
    dbConnect.query('SELECT count(*) as total FROM post where board_id = 1', (error, rows) => {
        if (error) throw error;

        let totalCnt = rows[0]['total'];
        let maxPage = Math.floor(totalCnt/cntPerPage) + ((totalCnt%cntPerPage>0) ? 1:0);
        
        console.log("page", page, "maxPage", maxPage, "total", totalCnt);
        if (page < 0) {
            res.redirect("./?page=1");
        }
        else if (page > maxPage+1) {
            res.redirect("./?page="+maxPage);
        }
        else {
            dbConnect.query('SELECT * FROM post where board_id = 1 order by post_id desc limit ?,?',
                [cntPerPage*(page-1), cntPerPage], (error, rows) => {
                    if (error) throw error;
                    for(let i = 0; i < rows.length; i++) {
                    let date = new Date(rows[i]['post_date']);
                    let dateStr = `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                    datas.push({
                        'id' : rows[i]['post_id'],
                        'date' : dateStr,
                        'title' : rows[i]['post_title'],
                        'content' : rows[i]['post_content']
                    });
                }
                        
                res.render('listpage', {
                    "datas": datas,
                    "cnt": datas.length,
                    "prevPage": page-1>0 ? page-1:1,
                    "nextPage": page+1<maxPage ? page+1:maxPage,
                    "maxPage": maxPage,
                });
            });
        }
    });
});

app.get('/views', (req, res) => {
    let postId = req.query.id;
    
    dbConnect.query('select * from post where board_id = 1 and post_id=?', [postId], (error, rows) => {
        if (error) throw error;
        let date = new Date(rows[0]['post_date']);
        let dateStr = `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        let viewData = {
            title: rows[0]['post_title'],
            content: rows[0]['post_content'],
            date: dateStr
        };
        dbConnect.query('select * from comment where post_id=?', [postId], (error, rows) => {
            if (error) throw error;

            let cmtDatas = [];
            for (let i = 0; i < rows.length; i++) {
                let date = new Date(rows[i]['cmt_date']);
                let dateStr = `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

                cmtDatas.push({
                    content: rows[i]['cmt_content'],
                    date: dateStr
                });
            }
            res.render('viewpage', {
                "post": viewData,
                "cmts": cmtDatas,
                "postId": postId
            });
        });
        
    });

});

app.post('/views', (req, res) => {
    //req.body로 input 받을 땐 input name 기준.
    //html script에서 getElement 할때는 input id 기준. 즉 input name과 id가 동시에 있어야 인식함;
    
    let postId = req.query.id;
    let comment_in = req.body.comment_input;
    console.log('comment req body data :', req.body.comment_input);
    
    dbConnect.query('INSERT INTO comment (post_id, cmt_content, cmt_date) VALUE (?, ?, now())', [postId, comment_in], (error) => {
        if(error) throw error;
        res.redirect('/views?id='+postId);
    });

});

app.get('/write', (req, res) => {
    res.render('writepage');
});

app.post('/write', (req, res) => {
    let title_in = req.body.title;
    let content_in = req.body.content;
    let date = new Date();
    let dateStr = `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    console.log('req body data : ', req.body);
    if (req.body.title == '' && req.body.content == '') {
        res.redirect('/write');
    }
    else {
        dbConnect.query('INSERT INTO post (board_id, post_title, post_content, post_date) VALUE (1, ?, ?, now())', [title_in, content_in], (error) => {
            if (error) throw error;
        });
        dbConnect.query('SELECT post_id FROM post ORDER BY post_id DESC LIMIT 1', (error, rows) => {
            if (error) throw error;
            let postID = rows[0]['post_id'];
            res.redirect('/views?id='+postID);
        }); //가장 최근 작성된 글로 이동
    }
});

app.get('/login', (req, res) => {
    res.render('loginpage');
});


app.post('/login', (req, res) => {
    let id_in = req.body.inputID;
    let pw_in = req.body.inputPW;
    dbConnect.query('SELECT user_id, user_pw FROM user WHERE user_id=? and user_pw=?', [id_in, pw_in], (error, rows) => {
        if (error) throw error;
        if (rows.length == 0) {
            res.send(`
            <script>
                alert("아이디 또는 비밀번호가 일치하지 않습니다.");
                document.location.href="/login";
            </script>
            `);
        }
        else {
            res.send(`
            <script>
                alert("로그인 성공!");
                document.location.href="/";
            </script>
            `);
        }
    });
});
    
