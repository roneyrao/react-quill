const fs=require('fs-extra');
const cpx=require('cpx');
fs.copy('./node_modules/quill/dist/quill.core.css',  './dist/quill.core.css').catch(function(err){console.log(err.message);});;
fs.copy('node_modules/quill/dist/quill.snow.css', 'dist/quill.snow.css');
fs.copy('node_modules/quill/dist/quill.bubble.css', 'dist/quill.bubble.css');
fs.mkdirs('./lib'); 
cpx.copy('./src/*', './lib/');
