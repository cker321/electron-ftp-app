/**
 * 定义ftp方法的接口
 * @author zhuRui
 */
import fs from 'fs';
import Client from 'ftp';
import path from 'path';
import { promisify } from 'util';

const ERROR_CODE = '0000001';
let ftp = new Client();
let currentPath = '';

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

function formatFileSize(size) {
    if (typeof size !== 'number') return '0 B';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function formatDate(date) {
    if (!(date instanceof Date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function startFtp(config) {
    return new Promise((resolve, reject) => {
        if (!config || typeof config !== 'object') {
            reject(new Error('Invalid configuration'));
            return;
        }

        ftp.connect({
            host: config.host,
            port: parseInt(config.port) || 21,
            user: config.user,
            password: config.password
        });

        ftp.on('ready', () => {
            console.log('FTP Connected');
            resolve('success');
        });

        ftp.on('error', (err) => {
            console.error('FTP Error:', err);
            reject(ERROR_CODE);
        });
    });
}

async function getFileDirectory() {
    return new Promise((resolve, reject) => {
        ftp.list((err, list) => {
            if (err) {
                reject(err);
                return;
            }

            const files = list.map(item => ({
                name: item.name,
                type: item.type,
                size: formatFileSize(item.size),
                date: formatDate(item.date),
                rights: item.rights
            }));

            resolve(files);
        });
    });
}

function getCurrentPath() {
    return new Promise((resolve, reject) => {
        ftp.pwd((err, path) => {
            if (err) {
                reject(err);
                return;
            }
            currentPath = path;
            resolve(path);
        });
    });
}

function changeDirectory(dirPath) {
    return new Promise((resolve, reject) => {
        if (typeof dirPath !== 'string') {
            reject(new Error('Invalid directory path'));
            return;
        }

        ftp.cwd(dirPath, async (err) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const files = await getFileDirectory();
                resolve(files);
            } catch (error) {
                reject(error);
            }
        });
    });
}

function changeDirectoryFull(fullPath) {
    return new Promise((resolve, reject) => {
        if (typeof fullPath !== 'string') {
            reject(new Error('Invalid full path'));
            return;
        }

        ftp.cwd(fullPath, async (err) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const files = await getFileDirectory();
                resolve(files);
            } catch (error) {
                reject(error);
            }
        });
    });
}

async function ftpUpload(filePath, progressCallback, completeCallback) {
    if (typeof filePath !== 'string') {
        throw new Error('Invalid file path');
    }

    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;
    let uploadedSize = 0;
    let lastTime = Date.now();
    let speed = 0;

    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(filePath);
        
        readStream.on('data', (chunk) => {
            uploadedSize += chunk.length;
            const currentTime = Date.now();
            const timeDiff = currentTime - lastTime;
            
            if (timeDiff >= 1000) {
                speed = (uploadedSize / timeDiff) * 1000; // bytes per second
                lastTime = currentTime;
            }

            const percent = Math.floor((uploadedSize / fileSize) * 100);
            if (typeof progressCallback === 'function') {
                progressCallback(percent, fileName, formatFileSize(speed) + '/s');
            }
        });

        ftp.put(readStream, fileName, (err) => {
            if (err) {
                reject(err);
                return;
            }
            if (typeof completeCallback === 'function') {
                completeCallback();
            }
            resolve();
        });
    });
}

async function ftpUploads(filePaths, progressCallback, completeCallback) {
    if (!Array.isArray(filePaths)) {
        throw new Error('Invalid file paths array');
    }

    try {
        for (const filePath of filePaths) {
            await ftpUpload(filePath, progressCallback, completeCallback);
        }
    } catch (error) {
        throw error;
    }
}

function mkdir(path, folderName) {
    return new Promise((resolve, reject) => {
        if (typeof path !== 'string' || typeof folderName !== 'string') {
            reject(new Error('Invalid path or folder name'));
            return;
        }

        ftp.mkdir(path + '/' + folderName, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function rmdir(path) {
    return new Promise((resolve, reject) => {
        if (typeof path !== 'string') {
            reject(new Error('Invalid path'));
            return;
        }

        ftp.rmdir(path, true, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function deleteFile(path) {
    return new Promise((resolve, reject) => {
        if (typeof path !== 'string') {
            reject(new Error('Invalid path'));
            return;
        }

        ftp.delete(path, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function logOut() {
    return new Promise((resolve) => {
        ftp.end();
        resolve();
    });
}

async function clearCache(dirPath) {
    if (typeof dirPath !== 'string') {
        throw new Error('Invalid directory path');
    }

    try {
        const files = await readdir(dirPath);
        await Promise.all(files.map(file => unlink(path.join(dirPath, file))));
    } catch (error) {
        throw error;
    }
}

export {
    startFtp,
    getFileDirectory,
    getCurrentPath,
    changeDirectory,
    changeDirectoryFull,
    ftpUpload,
    ftpUploads,
    mkdir,
    rmdir,
    deleteFile,
    logOut,
    clearCache
};
