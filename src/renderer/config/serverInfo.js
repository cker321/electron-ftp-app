const IN_DEV = process.env.NODE_ENV === 'development';
export default IN_DEV ? {
    host: '192.168.40.48',
    user: 'root',
    password: 'Zr59901212',
    port: '21',
    parser: 'utf-8',
} : {
    host: '',
    user: '',
    password: '',
    port: '21',
    parser: 'utf-8',
};
