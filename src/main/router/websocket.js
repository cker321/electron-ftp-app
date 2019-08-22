let websocket = {};
let resTemplate = {type: 'uploading', data: 0, fileName: '', speed: 0}
const ws = require('nodejs-websocket');
import {
    ftpUploads
} from '../util/ftp_func';

websocket.createServer = () => {
    let server = ws.createServer(connection => {
        connection.on('text', function(result) {
            if (result.path) {
                console.log(result.path);
            } else {
                let newResult = JSON.parse(result);
                ftpUploads(newResult.path, function (total, percentage, speed) {
                    resTemplate.type = 'uploading';
                    resTemplate.data = percentage;
                    resTemplate.speed = speed;
                    connection.sendText(JSON.stringify(resTemplate))
                }, function (fileName) {
                    resTemplate.type = 'success';
                    resTemplate.data = 100;
                    resTemplate.fileName = fileName;
                    resTemplate.speed = 0;
                    connection.sendText(JSON.stringify(resTemplate))
                });
            }
        })
        connection.on('connect', function(code) {
            console.log('开启连接', code)
        })
        connection.on('close', function(code) {
            console.log('关闭连接', code)
        })
        connection.on('error', function(code) {
            console.log('异常关闭', code)
        })
    })
    return server
}
module.exports = websocket;
