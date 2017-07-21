//require('babel-polyfill');
//require("babel-register");
const URL = require('url');
const path = require('path');
const  Form= require('formidable');
const uploadDir= './uploads/';
module.exports=function(req, res){
	const url=URL.parse(req.url);
	if(url.pathname=='/upload' && req.method=='POST'){
		res.setHeader('Content-type', 'text/javascript');
		// create an incoming form object
		var form = new Form.IncomingForm();
		// store all uploads in the /uploads directory
		form.uploadDir = path.join(process.cwd(), uploadDir);
		form.keepExtensions  = true;
		form.multiples  = true;


		// log any errors that occur
		//form.on('error', function(err) {
		//});

		// once all the files have been uploaded, send a response to the client
		//form.on('end', function() {
		//	res.end('success');
		//});

		// parse the incoming request containing the form data
		form.parse(req, function(err, fields, files){
			files=files.file;
			if(!Array.isArray(files)){
				files=[files];
			}
			if(err){
				res.end(`{"message":"${err.message}", "isSuccess":false}`);
			}else{
				let urls=files.map(function(f){
					return `${uploadDir}${path.basename(f.path)}`;
				});
				setTimeout(function(){
					res.end(JSON.stringify({"urls":urls, "isSuccess":true}));
				}, 3000);
			}
		});
		return true;
	}
};
