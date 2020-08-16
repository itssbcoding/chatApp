//this is server side
const express = require('express')
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('../src/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const staticPath = path.join(__dirname,'../public')

app.use(express.static(staticPath))

//let count = 0

io.on('connection', (socket) => {   //socket allows server to contact with client
    console.log('New Connection')

    socket.on('joinChat', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!')) //this sends messege to single user

        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`)) //send message to every user except the current user

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    
    socket.on('sendMessage', (message, callback) => {
        filter = new Filter()       //this is a message filtering library

        if(filter.isProfane(message)){
            return callback('You can not use Abusive Languages')
        }

        const user = getUser(socket.id)

        if(!user){
            return callback('Error: User not Registered!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))     //this sends messege to every user
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id)

        if(!user){
            return callback('Error: User not Registered!')
        }

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    }) 
})

server.listen(port, () => {
    console.log('Server is up on PORT ',port)
})





// socket.emit('countUpdated', count)  //sent 0 to the client

    // socket.on('increment', () => {  //the server increases the count when the event occured
    //     count++
    //     // socket.emit('countUpdated', count) //the server sends the updated count to the client
    //     io.emit('countUpdated', count) //this broadcast the data to every client
    // })