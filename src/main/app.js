let express = require('express');
let app = express();
let fs = require('fs');
let multer  = require('multer')
let indexRouter = require('./router/index');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

let upload = multer({ storage: storage })

// fs.mkdir("./uploads",function(err){
//     if (err) {
//         return;
//     }
//     console.log("目录创建成功。");
// });

// 最多同时上传10个文件
app.use(upload.array('file', 10));

// 跨域设置
app.all("*", function(req, res, next) {
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Origin", "http://localhost:9080");
        res.header("Access-Control-Allow-Headers", "content-type, x-authorization");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        next();
    } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        next();
    }
});

app.use('/', indexRouter);

const port = process.env.PORT || 3009;

app.listen(port, () => {
    console.log(`server running @ http://localhost:${port}`);
});
