import Koa from 'koa';
import Socket from 'ws';
import BodyParser from 'koa-bodyparser';
import koaStatic from 'koa-static';

import router from './router';
import ws from './ws';

const app = new Koa();
const parser = new BodyParser();

app.use(parser);
app.use(koaStatic('./assets'));
app.use(router.routes());

const server = app.listen(3000);
console.log('Now app is listening at port 3000...');

const SocketServer = Socket.Server;
const io = new SocketServer({ server: server });

io.on('connection', (socket) => {
  ws(socket, io);
});
