const users = []

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim()
    room = room.trim().toLowerCase()

    //Validate data
    if(!username || !room){
        return {
            error: 'Username & Room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find( (user) => {
        return user.room === room && user.username.toLowerCase() === username.toLowerCase()
    })

    if(existingUser){
        return {
            error: 'Username already taken!'
        }
    }

    //Save user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = ((id) => {
    const index = users.findIndex( (user) => user.id === id ) //returns the index of the first match and stops

    if(index !== -1){    //if no match is found, index = -1
        return users.splice(index, 1)[0]   //splice removes an element based on the index
        //1 is provided to remove one element from the index, 2 will delete the current index and index+1
        //returns an array so we use [0] to return the first element removed as we only removing one user
    }
})

const getUser = ( (id) => {
    const user = users.find( (user) => user.id === id )

    if(!user)
        return undefined
    
    return user
})

const getUsersInRoom = ( (room) => {
    const usersInRoom = users.filter( (user) => user.room === room.toLowerCase())

    return usersInRoom
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
