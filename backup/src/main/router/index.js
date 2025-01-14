import express from 'express';
import bodyparser from 'body-parser';
import {
    changeDirectory,
    changeDirectoryFull,
    startFtp,
    getCurrentPath,
    ftpUpload,
    getFileDirectory,
    ftpUploads,
    mkdir,
    rmdir,
    logOut,
    deleteFile,
    clearCache
} from '../util/ftp_func';

const app = express();
const router = express.Router();

const ERROR_CODE = '0000001';
const dataEr = { code: ERROR_CODE, msg: '' };
const dataOk = { code: '0000000', msg: '请求处理成功' };

router.use(bodyparser.urlencoded({ extended: true }));
router.use(bodyparser.json());

router.get('/startFtp', async function(req, res) {
    try {
        const connectData = await startFtp(req.query);
        let resData = {};
        
        if (connectData === ERROR_CODE) {
            resData = { ...dataEr, msg: '登录失败！' };
        } else {
            const directories = await getFileDirectory();
            const currentPath = await getCurrentPath();
            resData = {
                ...dataOk,
                data: directories,
                currentPath: currentPath
            };
        }
        res.json(resData);
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

router.get('/changeDirectory', async function(req, res) {
    try {
        const path = req.query.path;
        if (typeof path !== 'string') {
            throw new Error('Invalid path parameter');
        }
        
        const directories = await changeDirectory(path);
        const currentPath = await getCurrentPath();
        res.json({
            ...dataOk,
            data: directories,
            currentPath: currentPath
        });
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

router.get('/changeDirectoryFull', async function(req, res) {
    try {
        const path = req.query.path;
        if (typeof path !== 'string') {
            throw new Error('Invalid path parameter');
        }
        
        const directories = await changeDirectoryFull(path);
        const currentPath = await getCurrentPath();
        res.json({
            ...dataOk,
            data: directories,
            currentPath: currentPath
        });
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

router.get('/getCurrentPath', async function(req, res) {
    try {
        const currentPath = await getCurrentPath();
        res.json({
            ...dataOk,
            data: currentPath
        });
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

router.post('/mkdir', async function(req, res) {
    try {
        const { path, newFolder } = req.body;
        if (typeof path !== 'string' || typeof newFolder !== 'string') {
            throw new Error('Invalid parameters');
        }
        
        await mkdir(path, newFolder);
        const directories = await getFileDirectory();
        res.json({
            ...dataOk,
            data: directories
        });
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

router.post('/rmdir', async function(req, res) {
    try {
        const { path } = req.body;
        if (typeof path !== 'string') {
            throw new Error('Invalid path parameter');
        }
        
        await rmdir(path);
        const directories = await getFileDirectory();
        res.json({
            ...dataOk,
            data: directories
        });
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

router.post('/deleteFile', async function(req, res) {
    try {
        const { path } = req.body;
        if (typeof path !== 'string') {
            throw new Error('Invalid path parameter');
        }
        
        await deleteFile(path);
        const directories = await getFileDirectory();
        res.json({
            ...dataOk,
            data: directories
        });
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

router.get('/logOut', async function(req, res) {
    try {
        await logOut();
        res.json(dataOk);
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

router.post('/clearCache', async function(req, res) {
    try {
        const { path } = req.body;
        if (typeof path !== 'string') {
            throw new Error('Invalid path parameter');
        }
        
        await clearCache(path);
        res.json(dataOk);
    } catch (error) {
        res.json({ ...dataEr, msg: error.message });
    }
});

app.use('/api', router);

export default app;
