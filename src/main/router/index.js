/**
 * 定义前端使用的接口
 * @author zhuRui
 */
import {
    changePath,
    changePathFull,
    startFtp,
    getCurrentPath,
    ftpUpload,
    mkdir,
    rmdir,
    logOut,
    deleteFile,
    clearCache
} from '../util/ftp_func'

const express = require('express')
const router = express.Router()
const dataOk = {code: '0000000', msg: '请求处理成功'};
const dataEr = {code: '0000001', msg: ''};

let currentPath = '';
let uploadFiles = []; // 上传的文件名

router.get('/startFtp', function(req, res, next) {
    startFtp (req.query, function (data) {
        getCurrentPath(function (currentPath) {
            let resData = Object.assign({}, dataOk);
            resData.data = data
            resData.currentPath = currentPath
            res.send(resData);
        });
    })
});

router.get('/changePath', function (req, res, next) {
    let path = req.query.path;
    changePath(path, function (data) {
        getCurrentPath( function (currentPath) {
            let resData = Object.assign({}, dataOk);
            resData.data = data
            resData.currentPath = currentPath
            res.send(resData);
        });

    })
})

router.get('/changePathFull', function (req, res, next) {
    let fullPath = req.query.fullPath;
    changePathFull(fullPath,function (data) {
        getCurrentPath(function (currentPath) {
            let resData = Object.assign({}, dataOk);
            resData.data = data
            resData.currentPath = currentPath
            res.send(resData);
        });
    })
})

// 文件上传
router.post('/fileUpload', function (req, res, next) {
    let resData = Object.assign({}, dataOk);
    uploadFiles = [];
    req.files.forEach(function (item) {
        uploadFiles.push(item.originalname)
    })
    ftpUpload (uploadFiles,function (fileNames) {
        resData.fileNames = fileNames
        clearCache('./uploads/')
        res.send(resData);
    })
})

// 新建文件夹
router.get('/newFolder', function (req, res, next) {
    let resData = {};
    getCurrentPath( function (currentPath) {
        try {
            mkdir(currentPath + '/' + req.query.newFolder, function (err) {
                if (err) {
                    resData = Object.assign({}, dataEr);
                    resData.msg = err;
                    res.send(resData);
                } else {
                    resData = Object.assign({}, dataOk);
                    res.send(resData);
                }
            }, req.query.newFolder)
        } catch (e) {
            console.log(e)
        }
    });
})

// 删除文件夹
router.get('/removeDirectory', function (req, res, next) {
    let resData = {};
    getCurrentPath( function (currentPath) {
        rmdir(currentPath + '/' + req.query.deleteFolder, function (err) {
            if (err) {
                resData = Object.assign({}, dataEr);
                resData.msg = err;
                res.send(resData);
            } else {
                resData = Object.assign({}, dataOk);
                res.send(resData);
            }
        })
    })
})

// 删除文件
router.get('/deleteFile', function (req, res, next) {
    let resData = {};
    getCurrentPath( function (currentPath) {
        console.log(req.query.fileName)
        deleteFile(currentPath + '/' + req.query.fileName, function (err) {
            if (err) {
                resData = Object.assign({}, dataEr);
                resData.msg = err;
                res.send(resData);
            } else {
                resData = Object.assign({}, dataOk);
                res.send(resData);
            }
        })
    })
})

// 退出登录
router.get('/logout', function (req, res, next) {
    let resData = Object.assign({}, dataOk);
    logOut(function () {
        res.send(resData);
    })
})

module.exports = router
