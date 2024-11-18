const { Server } = require('socket.io');

let userSockets = {}

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        // console.log("Socket is ON")

        socket.on('authenticate', (data) => {
            try {
                userSockets[data?.userId] = socket.id;
                console.info(`User ${data?.userId} connected with socket ID ${socket.id}`);

                // socket.emit('authenticated', { message: 'Successfully logged in' });
            }
            catch (err) {
                console.error('Authentication error:', err)
                socket.emit('error', { message: 'Invalid or expired token' });
            }
        });



        socket.on("disconnect", () => {
            console.log("A user disconnected");
            for (let userId in userSockets) {
                if (userSockets[userId] === socket.id) {
                    delete userSockets[userId];
                    break;
                }
            }
        })

    });

    return io;
}


module.exports = { initializeSocket, userSockets };
