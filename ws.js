export default (socket, io) => {

  io.broadcast = (message) => {
    io.clients.forEach((client) => {
      client.send(message);
    });
  }

  setInterval(() => {
    socket.send(JSON.stringify({
      type: 'time',
      data: {
        time: new Date().toLocaleString()
      },
    }));
  }, 200);

  socket.on('message', (message) => {
    const { type, data } = JSON.parse(message);
    io.broadcast(message);
  });
};
