import React from 'react';
import ReactDOM from 'react-dom/server';

const method = 'get';
const path = '/im';
const controller = async (ctx, next) => {
  ctx.type = 'text/html';
  // ctx.sendfile('./im.html');
  ctx.body = ReactDOM.renderToString(
    <html>
      <head>
        <title>IM | websocket</title>
      </head>
      <body>
        <header>
          <h1>IM 聊天室</h1>
          <p>Websocket 应用实例</p>
        </header>
        <article>
          <ul id="im">
            <li>{new Date().toLocaleString()}</li>
            <hr />

          </ul>
          <form style={ { position: 'fixed', background: '#9cf', display: 'flex', alignItems: 'center', width: '100%', height: '40px', paddingLeft: '20px' } }>
            <input style={ { height: '26px', width: '200px', marginRight: '20px' } } id="input" name="input" type="text" />
            <input type="button" value="Send" />
          </form>
        </article>
      </body>
    </html>
  );
};

export default {
  method,
  path,
  controller,
};
