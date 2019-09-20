const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, './client')));

const server = app.listen(88, () => {
    console.log('listen at  http://localhost:88')
})
