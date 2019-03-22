var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');

server.listen(3000);

var publicPath = path.join(__dirname, '/');
app.use(express.static(publicPath));

app.get('/', (request, response) => {
    response.sendFile(__dirname + "/index.html");
});
 
users = [];
arUsers = [];
arMsg = [];
connections = [];

io.sockets.on('ping', function(data){
    console.log('event fired');
});

io.sockets.on('pong', function(data){
    console.log('event fired');
});

io.sockets.on('connection', (socket) => {

    io.sockets.emit('add mess', arMsg);

    console.log("Успешное соединение");

    socket.on('disconnect', (data) => {

        for (let i = 0; i < arUsers.length; i++) {
            if (arUsers[i].name === socket.username) {
                arUsers.splice(i, 1);
            }
        }

        users.splice(users.indexOf(socket.username), 1);
        updateUserNames();
        connections.splice(connections.indexOf(socket), 1);
        console.log("Отключились");
    });

    socket.on('send mess', (data) => {
        let arr = [];
        let img = 'images/no-logo.png';

        if (!socket.userimg) {
            img = 'images/no-logo.png';
        } else {
            img = socket.userimg;
        }

        arMsg.push({
            mess : data.mess,
            userName : socket.username,
            userNik : socket.usernik,
            userImg : img
        });

        for (let i = 0; i < arMsg.length; i++) {
            if (socket.username === arMsg[i].userName) {
                if (socket.userimg === undefined) {
                    arMsg[i].userimg = 'images/no-logo.png';
                } else {
                    arMsg[i].userimg = socket.userimg;
                }
            }

            arr.push({
                mess : arMsg[i].mess,
                userName : arMsg[i].userName,
                userNik : arMsg[i].userNik,
                userImg : arMsg[i].userimg
            });
        }



        io.sockets.emit('add mess', arr);
    });

    socket.on('upload img', (data) => {
        socket.userimg = data.userImg;

        for (let i = 0; i < arUsers.length; i++) {
            if (arUsers[i].name === socket.username) {
                arUsers[i] = {
                    name : socket.username,
                    nik : socket.usernik,
                    img : data.userImg
                };
            }
        }

        updateUserInfo();
    });

    socket.on('new user', (data, callback) => {
        callback(data.userName);

        socket.usernik = data.userNik;
        socket.username = data.userName;

        users.push(socket.username);
        updateUserNames();

        arUsers.push({
            name : data.userName,
            nik : data.userNik
        });
    });

    let updateUserNames = () => {
        io.sockets.emit('get users', users);
    };

    let updateUserInfo = () => {
        io.sockets.emit('get users info', arUsers);
    };
});


















