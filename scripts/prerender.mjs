import React from 'react';
import {renderToString} from 'react-dom/server';
import {createServer} from 'vite';
import {readFile,writeFile} from 'node:fs/promises';
const vite=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try{
  const {default:App}=await vite.ssrLoadModule('/src/App.tsx');
  const markup=renderToString(React.createElement(App));
  const path=new URL('../dist/index.html',import.meta.url);
  const html=await readFile(path,'utf8');
  if(!html.includes('<div id="root"></div>'))throw new Error('Root placeholder not found');
  await writeFile(path,html.replace('<div id="root"></div>','<div id="root">'+markup+'</div>'));
  console.log('Prerendered HTML for search crawlers');
}finally{await vite.close();}
