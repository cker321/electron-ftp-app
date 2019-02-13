// 未被使用
let http = require('http');
let express = require('express');
let expressApp = express();
let server = http.createServer(expressApp);
let client = require('ftp');
let fs = require('fs');
let multer  = require('multer')
let talk = '';
let currentPath = '';
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
let upload = multer({ storage: storage })
let uploadFiles = []; // 上传的文件名

fs.mkdir("./uploads",function(err){
    if (err) {
        return console.error(err);
    }
    console.log("目录创建成功。");
});

const dataOk = {code: '0000000', msg: '请求处理成功'};

expressApp.use(upload.array('file', 10));

// expressApp.all('*', function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
// })

expressApp.get('/startFtp', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    startFtp (req.query, function (data) {
        getCurrentPath(function () {
            let resData = Object.assign({}, dataOk);
            resData.data = data
            resData.currentPath = currentPath
            res.send(resData);
        });
    })

});

expressApp.get('/changePath', function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    let path = req.query.path;
    changePath(path, function (data) {
        getCurrentPath(function () {
            let resData = Object.assign({}, dataOk);
            resData.data = data
            resData.currentPath = currentPath
            res.send(resData);
        });

    })
})

expressApp.get('/changePathFull', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    let fullPath = req.query.fullPath;
    changePathFull(fullPath, function (data) {
        getCurrentPath( function () {
            let resData = Object.assign({}, dataOk);
            resData.data = data
            resData.currentPath = currentPath
            res.send(resData);
        });
    })
})

// 文件上传
expressApp.post('/fileUpload', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    let resData = Object.assign({}, dataOk);
    uploadFiles = [];
    req.files.forEach(function (item) {
        uploadFiles.push(item.originalname)
    })
    ftpUpload (uploadFiles, function () {
        clearCache('./uploads/')
        res.send(resData);
    })
})

// 新建文件夹
expressApp.get('/newFolder', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    let resData = Object.assign({}, dataOk);
    getCurrentPath();
    mkdir(currentPath + '/' + req.query.newFolder, function () {
        res.send(resData);
    })
})

// 改变路径（相对）
let changePath = function (path, cb) {
    talk.pwd(function (err, dir) {
        if (err) throw err;
        talk.cwd(`${dir}/${path}`, function (err, currentDir) {
            if (err) throw err;
            getFileDir(cb);
        })
    })
}

// 改变路径（全）
let changePathFull = function (path, cb) {
    talk.cwd(path, function (err, currentDir) {
        if (err) throw err;
        getFileDir(cb);
    })
}

// 开启连接
let startFtp = function (obj, cb) {
    let params = Object.assign({}, obj);
    talk = new client();
    talk.on('ready', function() {
        getFileDir(cb);
    });
    params.keepalive = 1000;
    talk.connect(params);
}

// 获取当前目录的文件
let getFileDir = function (cb) {
    talk.list(function (err, list) {
        if (err) throw err;
        cb && cb(list);
    })
}

// 获取当前目录层级
let getCurrentPath = function (cb) {
    talk.pwd(function (err, dir) {
        if (err) throw err;
        currentPath = dir;
        cb && cb();
    })
}

// 上传文件
let ftpUpload = function (fileNameArr, cb) {
    fileNameArr.forEach(function (fileName, index) {
        talk.put('./uploads/' + fileName, fileName, function(err) {
            if (err) throw err;
            if (index === fileNameArr.length - 1) {
                cb && cb();
            }
        });
    })
}

// 新建文件夹
let mkdir = function (path, cb) {
    talk.mkdir(path, function (err) {
        if (err) throw err;
        cb && cb();
    })
}


// 删除本地缓存
let clearCache = function (path) {
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                clearCache(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        // fs.rmdirSync(path);
    }
}

server.listen(3009)
