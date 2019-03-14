/**
 * 定义前端使用的接口
 * @author zhuRui
 */
let fs = require('fs');
let client = require('ftp');
let talk = ''
let currentPath = ''

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
    talk.on('ready', function() {
        getFileDir(cb);
    });
    params.keepalive = 1000;
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
    console.log(path)
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
    mkdir,
    rmdir,
    logOut,
    deleteFile,
    clearCache
};
