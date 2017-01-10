import React from 'react';
import ReactDOM from 'react-dom/server';

const method = 'post';
const path = ['/register'];
const controller = async (ctx, next) => {
  let body = ctx.request.body;
  let { name, age } = body;
  ctx.type = 'text/html';
  ctx.body = ReactDOM.renderToString(
    <article>
      <p>Welcome, {name}!</p>
      <p>You are now {age} years old.</p>
      <p><a href="/post">Go back</a></p>
    </article>
  );
};

export default {
  method,
  path,
  controller,
};
