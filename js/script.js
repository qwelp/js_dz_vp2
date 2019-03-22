let socket = io.connect();
let form = document.querySelector('#js-msgForm');
let msgInput = document.querySelector('#js-msg');
let msgList = document.querySelector('#js-msgList');
let userName = document.querySelector('#js-userName');
let userNik = document.querySelector('#js-userNik');
let userItems = document.querySelector('#js-userItems');
let login = document.querySelector('#js-login');
let usersCount = document.querySelector('#js-usersCount');
let blockUsersTitle = document.querySelector('#js-blockUsersTitle');
let userFoto = document.querySelector('#js-userFoto');
let addImgInput = document.querySelector('#js-addImgInput');
let addImgUpload = document.querySelector('#js-addImg-upload');
let addImgCancel = document.querySelector('#js-addImg-cancel');
let addImg = document.querySelector('#js-addImg');
let name = document.querySelector('#js-name');
let fileReader = new FileReader();

userFoto.addEventListener('click', () => {
    addImg.style.display = 'block';
});

addImgUpload.addEventListener('click', (e) => {
    e.preventDefault();

    socket.emit('upload img', { userImg: fileReader.result });

    userFoto.src = fileReader.result;

    addImg.style.display = 'none';
    addImgInput.innerHTML = '<div class="addImgInput__msg">перетащите сюда фото</div>';

    form.dispatchEvent(new Event('submit'));
});

addImgCancel.addEventListener('click', (e) => {
    e.preventDefault();
    addImg.style.display = 'none';
    addImgInput.innerHTML = '<div class="addImgInput__msg">перетащите сюда фото</div>';
});

fileReader.addEventListener('load', () => {
    addImgInput.innerHTML = `<img src="${fileReader.result}" >`;
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();

    if (e.target.className === "addImgInput") {
        let file = e.dataTransfer.files[0];

        if (file.size > 512 * 1024) {
            alert('Максимальный размер 512кб');
            return false;
        }

        if (file.type !== 'image/jpeg') {
            alert('Модно загрузить только JPG-файлы');
            return false;
        }

        fileReader.readAsDataURL(file);
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.emit('send mess', { mess: msgInput.value, userName : userName.value });
    msgInput.value = '';

    setTimeout(() => {
        msgList.scrollTop = msgList.scrollHeight;
    }, 10);
});

login.addEventListener('submit', (e) => {
    e.preventDefault();

    socket.emit('new user', { userName: userName.value, userNik: userNik.value }, (data) => {
        name.textContent = data
    });

    login.style.display = 'none';
    userName.value = '';
    userNik.value = '';
});

socket.on('get users', (data) => {
    userItems.innerHTML = '';

    for (let i = 0; i < data.length; i++) {
        userItems.insertAdjacentHTML('beforeend',`<li><b>${data[i]}</li>`);
    }

    usersCount.textContent = data.length;
    blockUsersTitle.style.display = 'block';
});

socket.on('get users info', (data) => {
    userItems.innerHTML = '';

    for (let i = 0; i < data.length; i++) {
        userItems.insertAdjacentHTML('beforeend',`<li><b>${data[i].name}</li>`);
    }
});

socket.on('add mess', (data) => {
    msgList.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        if (data[i].mess !== "") {
            let img = `<div class="msgList__col"><div class="msgList__img"><img class="msgList__pic" src="${data[i].userImg}"></div></div>`;
            let text = `<div class="msgList__col"><div class="msgList__date"><b>${data[i].userNik}</b> ${getDate()}</div><div class="msgList__text">${data[i].mess}</div></div>`;
            msgList.insertAdjacentHTML('beforeend',`<li>${img} ${text}</li>`);
        }
    }
});

let getDate = () => {
    let tm = new Date();
    let minute = tm.getMinutes();
    let month = tm.getMonth();

    if (minute < 10) {
        minute = '0' + minute;
    }
    if (month < 10) {
        month = '0' + month;
    }

    return `${tm.getHours()}:${minute}`;
};