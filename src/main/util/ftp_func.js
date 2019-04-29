/**
 * 定义前端使用的接口
 * @author zhuRui
 */
const fs = require('fs');
const client = require('ftp');
// ftp会话对象
let talk = ''
// 错误码
const ERROR_CODE = '0000001'

// 改变路径（相对）
let changeDirectory = async function (path) {
    let currentDirectory = await new Promise((resolve, reject) => {
        talk.pwd(function (err, dir) {
            if (err) reject(err);
            resolve(dir)
        })
    });
    let fileDirectory = await new Promise((resolve, reject) => {
        talk.cwd(`${currentDirectory}/${path}`, function (err) {
            if (err) reject(err) ;
            resolve('ok')
        })
    });
    fileDirectory = await getFileDirectory();
    return fileDirectory;
}

// 改变路径（全）
let changeDirectoryFull = async function (path, cb) {
    let fileDirectory = await new Promise((resolve, reject) => {
        talk.cwd(path, function (err) {
            if (err) reject(err) ;
            resolve('ok')
        })
    });
    fileDirectory = await getFileDirectory();
    return fileDirectory;

    // talk.cwd(path, function (err, currentDir) {
    //     if (err) throw err;
    //     getFileDirectory(cb);
    // })
}

// 开启连接
let startFtp = async function (obj, cb) {
    let params = Object.assign({}, obj);
    let connection = await new Promise((resolve, reject) => {
        talk = new client();
        // 连接成功
        talk.on('ready', function() {
            // let fileDir = await getFileDirectory(cb);
            // return 'ok'
            console.log('oooooooooooooooooook')
            resolve('ok');
        });
        // 连接错误
        talk.on('error', function (err) {
            console.log('errerrerrerrerrerrerrerrerr')
            reject(ERROR_CODE);
        })
        // 会话保持时间
        params.keepalive = 1000;
        // 开启连接
        talk.connect(params);
    })
    return connection;
}

// 获取当前目录的文件
let getFileDirectory = async function () {
    let list = await new Promise((resolve, reject) => {
        talk.list(function (err, list) {
            console.log(list)
            if (err) reject(err);
            resolve(list);
        })
    });
    return list;
}

// 获取当前目录层级
let getCurrentPath = async function (cb) {
    let currentPath = await new Promise((resolve, reject) => {
        talk.pwd(function (err, dir) {
            console.log(dir)
            if (err) reject(err);
            resolve(dir);
        })
    });
    return currentPath;
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
let mkdir = async function (path, newFolder) {
    // 获取当前目录
    let currentDirectory = await getCurrentPath();
    // 获取当前目录文件
    let fileDirectory = await getFileDirectory();
    // 匹配是否有同名文件夹
    let index = fileDirectory.findIndex(item => {
        return item.name === newFolder && item.type === 'd'
    });
    // 返回
    let promise = await new Promise((resolve, reject) => {
        if (index >= 0) {
            reject('存在同名文件夹！');
            return;
        }
        talk.mkdir(currentDirectory + '/' + path, function (err) {
            if (err) reject(err);
            resolve('ok')
            // cb && cb();
        })
    });
    return promise;
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
    changeDirectory,
    changeDirectoryFull,
    startFtp,
    getCurrentPath,
    ftpUpload,
    ftpUploads,
    mkdir,
    rmdir,
    logOut,
    deleteFile,
    clearCache,
    getFileDirectory
};
