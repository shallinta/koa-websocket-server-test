import React from 'react';
import ReactDOM from 'react-dom/server';

const method = 'get';
const path = ['/about'];
const controller = async (ctx, next) => {
  ctx.type = 'text/html';
  ctx.body = ReactDOM.renderToString(
    <header>
      <h1>About koa。</h1>
      <p>koa@2.0.0-alpha.7</p>
    </header>
  );
};

export default {
  method,
  path,
  controller,
};
