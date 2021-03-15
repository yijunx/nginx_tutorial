const express = require('express');
// create the app
const app = express();


// routes
app.get('/', (req, res) => {
    res.send(`we are with APPID: ${process.env.APPID}`);
});

app.get('/app1', (req, res) => {
    res.send(`we are with APPID: ${process.env.APPID}, app1 says hello`);
});

app.get('/app2', (req, res) => {
    res.send(`we are with APPID: ${process.env.APPID}, app2 says hello`);
});

app.get('/admin', (req, res) => {
    res.send(`we are with APPID: ${process.env.APPID}, very few people can see this`);
});

app.listen(9999);