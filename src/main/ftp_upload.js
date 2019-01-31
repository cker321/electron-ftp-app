let http = require('http');
let express = require('express');
let expressApp = express();
let server = http.createServer(expressApp);
let client = require('ftp');
let fs = require('fs');
let talk = '';
const dataOk = {code: '0000000', msg: '请求处理成功'};

expressApp.get('/startFtp', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    startFtp (req.query, function (data) {
        let resData = Object.assign({}, dataOk);
        resData.data = data
        res.send(resData);
    })

});

expressApp.get('/changePath', function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    let path = req.query.path;
    changePath(path, function (data) {
        let resData = Object.assign({}, dataOk);
        resData.data = data
        res.send(resData);
    })
})

let changePath = function (path, cb) {
    talk.pwd(function (err, dir) {
        if (err) throw err;
        talk.cwd(`${dir}/${path}`, function (err, currentDir) {
            if (err) throw err;
            getFileDir(cb);
            // cb && cb(currentDir);
        })
    })
}

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

server.listen(3009)
