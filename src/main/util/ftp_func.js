/**
 * 定义前端使用的接口
 * @author zhuRui
 */
let fs = require('fs');
let client = require('ftp');
let talk = ''
let currentPath = ''
const ERROR_CODE = '0000001'

// 改变路径（相对）
function changePath (path, cb) {
    talk.pwd(function (err, dir) {
        if (err) throw err;
        talk.cwd(`${dir}/${path}`, function (err, currentDir) {
            if (err) throw err;
            getFileDir(cb);
        })
    })
}

// 改变路径（全）
function changePathFull (path, cb) {
    talk.cwd(path, function (err, currentDir) {
        if (err) throw err;
        getFileDir(cb);
    })
}

// 开启连接
function startFtp (obj, cb) {
    let params = Object.assign({}, obj);
    talk = new client();
    // 连接成功
    talk.on('ready', function() {
        getFileDir(cb);
    });
    // 连接错误
    talk.on('error', function (err) {
        cb(ERROR_CODE)
    })
    params.keepalive = 1000;
    // 开启连接
    talk.connect(params);

}

// 获取当前目录的文件
function getFileDir(cb) {
    talk.list(function (err, list) {
        if (err) throw err;
        cb && cb(list);
    })
}

// 获取当前目录层级
function getCurrentPath(cb) {
    talk.pwd(function (err, dir) {
        if (err) throw err;
        currentPath = dir;
        cb && cb(currentPath);
    })
}

// 上传文件
function ftpUpload(fileNameArr, cb) {
    let fileTemp = [];
    fileNameArr.forEach(function (fileName, index) {
        talk.put('./uploads/' + fileName, fileName, function(err) {
            if (err) throw err;
            fileTemp.push(fileName);
            if (index === fileNameArr.length - 1) {
                cb && cb(fileTemp);
            }
        });
    })
}

// 无http直接上传
// 上传文件
function ftpUploads(filePaths, res, cb, cbEnd) {
    let fileTemp = [];
    filePaths.forEach(function (fileObj, index) {
        let fileName = fileObj.name;
        let filePath = fileObj.path.replace(/\//g, '/');
        let readFile = fs.createReadStream(filePath),
        cur = 0,
        total = fs.statSync(filePath).size;
        // res.writeHeader(200, {"Content-Length": total});
        readFile.on('data', function(d) {
            // console.log(`接收到 ${cur} 字节的数据`);
            cur += d.length;
            // 返回实时进度
            cb && cb(total, ((cur / total) * 100).toFixed(1))
            // console.log(((cur / total) * 100).toFixed(1) + '% complete');
        });
        talk.put(readFile, fileName, function(err) {
            if (err) throw err;
            fileTemp.push(fileName);
            if (index === filePaths.length - 1) {
                cbEnd && cbEnd(fileTemp);
            }
        });
    })
}


// 新建文件夹
function mkdir(path, cb, newFolder) {
    getFileDir(function (list) {
        let index = list.findIndex(item => {return (item.name === newFolder && item.type === 'd')})
        if (index >= 0) {
            cb && cb('存在同名文件夹！');
            return;
        }
        talk.mkdir(path, function (err) {
            if (err) throw err;
            cb && cb();
        })
    });
}
// 删除文件夹
function rmdir(path, cb) {
    talk.rmdir(path, true, function (err) {
        if (err) throw err;
        cb && cb();
    })
}

// 删除文件
function deleteFile(path, cb) {
    talk.delete(path, function (err) {
        if (err) throw err;
        cb && cb();
    })
}

// 退出登录
function logOut (cb) {
    talk.logout(function (err) {
        if (err) throw err;
        cb && cb();
    })
}

// 删除本地缓存
function clearCache(path) {
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
    }
}

export {
    changePath,
    changePathFull,
    startFtp,
    getCurrentPath,
    ftpUpload,
    ftpUploads,
    mkdir,
    rmdir,
    logOut,
    deleteFile,
    clearCache
};
