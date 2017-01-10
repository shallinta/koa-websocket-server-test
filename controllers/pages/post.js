import React from 'react';
import ReactDOM from 'react-dom/server';

const method = 'get';
const path = ['/post'];
const controller = async (ctx, next) => {
  ctx.type = 'text/html';
  ctx.body = ReactDOM.renderToString(
    <form action="/register" method="post">
      <label>Name: <input name="name" type="text" /></label>
      <label>Age: <input name="age" type="number" /></label>
      <input type="submit" value="Submit" />
    </form>
  );
};

export default {
  method,
  path,
  controller,
};
