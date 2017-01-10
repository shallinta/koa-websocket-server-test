import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom/server';
import KoaRouter from 'koa-router';

const router = new KoaRouter();

const readFiles = (dir) => {
  return fs.readdirSync(dir).reduce((pre, next) => {
    let nextFile = path.join(dir, next);
    let stat = fs.statSync(nextFile);
    if(stat.isFile()) {
      return nextFile.endsWith('.js') ? pre.concat(nextFile) : pre;
    } else {
      return pre.concat(readFiles(nextFile));
    }
  }, []);
}

const routerFiles = readFiles(path.join(__dirname, 'controllers'));

routerFiles.forEach((file) => {
  let routerModule = require(file).default;
  router[routerModule.method.toLocaleLowerCase()](routerModule.path, routerModule.controller);
});

export default router;
