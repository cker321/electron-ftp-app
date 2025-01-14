import ws from 'nodejs-websocket';
import { ftpUploads } from '../util/ftp_func';

const resTemplate = { type: 'uploading', data: 0, fileName: '', speed: 0 };

function createServer(onConnection) {
  const server = ws.createServer(conn => {
    console.log('New connection');
    
    conn.on('text', async function(str) {
      if (typeof str === 'string') {
        const data = JSON.parse(str);
        if (data && Array.isArray(data.filePaths)) {
          const filePaths = data.filePaths;
          const response = { ...resTemplate };
          
          try {
            await ftpUploads(
              filePaths,
              (percent, fileName, speed) => {
                response.data = percent;
                response.fileName = fileName;
                response.speed = speed;
                conn.sendText(JSON.stringify(response));
              },
              () => {
                response.type = 'uploaded';
                conn.sendText(JSON.stringify(response));
              }
            );
          } catch (error) {
            console.error('Upload error:', error);
            response.type = 'error';
            response.data = error.message;
            conn.sendText(JSON.stringify(response));
          }
        }
      }
    });
    
    conn.on('close', function(code, reason) {
      console.log('Connection closed');
    });
    
    if (typeof onConnection === 'function') {
      onConnection(conn);
    }
  });
  
  return server;
}

export { createServer };
