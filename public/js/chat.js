//this is client side app
const socket = io() //socket allows client to contact the server

//Elements, the $ is just a convention
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const loactionTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) //this Qs script is loaded at chat.html page

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationMessage', ({ username, url, createdAt }) => {
    const html = Mustache.render(loactionTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('message', ({ username, text, createdAt }) => { //this fn displays the messege sent by the server to the webpage
    const html = Mustache.render(messageTemplate, {
        username,
        message: text,
        createdAt: moment(createdAt).format('hh:mm a')  //this moment js is loaded in script tag of chat.html, visit website for docs
    })
    $messages.insertAdjacentHTML('beforeend', html) //renders the messege before the div ending

    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room.toUpperCase(),
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    //disable send button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $messageFormInput.value
    $messageFormInput.value = ''
    $messageFormInput.focus()

    socket.emit('sendMessage', message, (err) => {
        //enabling send button after receieving Acknowledgement
        $messageFormButton.removeAttribute('disabled')

        if(err){
            return alert(err)
        }
        console.log('Delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    //disable send location button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (err) => {
            if(err){
                alert(err)
            }

            //enable send location button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('joinChat', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})













// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count)
// })

// document.querySelector('#inc').addEventListener('click', () => {
//     console.log('Clicked')  //when button is clicked, it sends an event to the server
//     socket.emit('increment')    //which makes it understand that count has to increase
// })