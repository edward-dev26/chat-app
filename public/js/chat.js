const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormButton = document.querySelector('button');
const $messageFormInput = document.querySelector('[name="message"]');
const $shareLocationBtn = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', ({ text, createdAt, username }) => {
    const html = Mustache.render(messageTemplate, {
        message: text,
        createdAt: moment(createdAt).format('HH:mm'),
        username,
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', ({ url, createdAt, username }) => {
    const html = Mustache.render(locationTemplate, {
        url,
        username,
        createdAt: moment(createdAt).format('HH:mm'),
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    console.log(users);
    $sidebar.innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;


    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Message delivered!');
    });
});

$shareLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!');
    }

    $shareLocationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(({ coords }) => {
        socket.emit(
            'sendLocation',
            {
                latitude: coords.latitude,
                longitude: coords.longitude,
            },
            (error) => {
                $shareLocationBtn.removeAttribute('disabled');

                if (error) {
                    return console.log(error);
                }

                console.log('Location shared!');
            }
        );
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        window.location.href = '/';
    }

    console.log(`${username} has joined`);
});