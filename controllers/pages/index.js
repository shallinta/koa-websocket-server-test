import React from 'react';
import ReactDOM from 'react-dom/server';

const method = 'get';
const path = ['/', '/index'];
const controller = async (ctx, next) => {
  ctx.type = 'text/html';
  ctx.body = ReactDOM.renderToString(
    <header>
      <h1>Koa。</h1>
      <p>Hello, world!</p>
    </header>
  );
};

export default {
  method,
  path,
  controller,
};
