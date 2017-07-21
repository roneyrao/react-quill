'use strict';

import Delta from 'quill-delta';
import Emitter from '../node_modules/quill/core/emitter';
require('./ql-upload.css');

var Quill = require('quill');
export function registerImgPlugin(cfg){
	if(cfg.modules){
		if(cfg.modules.imageResize){
			const resize= require('quill-image-resize-module');
			Quill.register('modules/imageResize', resize.default);
		}
		if(cfg.modules.imageResize){
			const drop= require('quill-image-drop-module');
			Quill.register('modules/imageDrop', drop.ImageDrop);
		}
	}
}
class Progress{
	constructor(uploader){
		this.uploader=uploader;

		this.box = document.createElement('div');
		this.box.classList.add('ql-upload-prog')
		this.box.classList.add('ql-'+uploader.theme);
		let txtbox= document.createElement('div');
		txtbox.classList.add('ql-upload-prog-txtbox');
		txtbox.classList.add('ql-tooltip');
		this.box.appendChild(txtbox);
		this.txt = document.createElement('span');
		txtbox.appendChild(this.txt);
		this.btn = document.createElement('a');
		this.btn.classList.add('ql-action');
		txtbox.appendChild(this.btn);
		this.btn.addEventListener('click', this.cancel.bind(this));

		this.hide();
		this.uploader.quill.getModule('toolbar').container.parentNode.appendChild(this.box);
	}
	hide(){
		this.box.style.display='none';
	}
	show(){
		this.box.style.display='table-cell';
	}
	update(txt){
		this.txt.innerHTML=txt;
	}
	cancel(){
		this.hide();
		this.uploader.abort();
	}
}
export default class Uploader{
	units={'K':1024, 'M':1048576};
	constructor(quill, cfg){
		if(!cfg)return;
		this.quill=quill;
		this.theme=cfg.theme;
		this.cfg=cfg.imgUpload;
		if(!this.cfg||!this.cfg.path)return;
		//imgUpload:{
		//	path:'upload',
		//	width:300,
		//	height:300,
		//	maxWidth:300,
		//	maxHeight:300,
		//	minWidth:300,
		//	minHeight:300,
		//	multiple:true
		//	minSize: '10k'
		//	maxSize: '100k'
		//	maxCount=5	//max count allowed to upload once;
		//}
		if(!this.cfg.maxCount){
			this.cfg.maxCount=5; //default 5;
		}
		if(this.cfg.minSize){
			this.cfg.minSizeStr=this.cfg.minSize;
			this.cfg.minSize=this.calcSize(this.cfg.minSize);
		}else{
			this.cfg.minSize=0;
		}
		if(this.cfg.maxSize){
			this.cfg.maxSizeStr=this.cfg.maxSize;
			this.cfg.maxSize=this.calcSize(this.cfg.maxSize);
		}else{
			this.cfg.maxSize=Number.MAX_SAFE_INTEGER;
		}
		if(!(this.cfg.width|| this.cfg.height|| this.cfg.maxWidth|| this.cfg.maxHeight|| this.cfg.minWidth|| this.cfg.minHeight)){
			this.checkPic=this.uploadImg;
		}
		quill.getModule('toolbar').addHandler('image', this.imgHandler.bind(this));
	}
	showError(msg){
		alert(msg);
	}
	calcSize(str){
		if(!str)return null;
		var num=parseFloat(str);
		if(isNaN(num))return null;
		var unit=str[num.toString().length];
		var size;
		if(unit && this.units[unit]){
			size=this.units[unit] * num;
		}
		if(!size){
			size=num;
		}
		return size;
	}
	imgHandler(){
		this.getInput().click();
	}
	initFormats(){
		if(!this.formats){
			let formats=this.fmtStr=this.cfg.formats||'.jpg, .jpeg, .png, .gif, .ico, .bmp';
			formats=formats.split(',');
			for(var i=0, len=formats.length; i<len; i++){
				formats[i]=formats[i].trim();
			}
			this.formats=formats;
		}
	}
	getInput(){
		if (this.fileInput == null) {
			this.initFormats();
			const fileInput=this.fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('accept',this.fmtStr);
			if(this.cfg.multiple){
				fileInput.setAttribute('multiple','true');
			}
			fileInput.classList.add('ql-image');
			fileInput.addEventListener('change', () => {
				if (fileInput.files != null && fileInput.files.length){
					if(fileInput.files.length<=this.cfg.maxCount) {
						this.act();
					}else{
						this.showError(`一次最多选择${this.cfg.maxCount}张`);
					}
				}
			});
			this.quill.container.appendChild(fileInput);
		}
		return this.fileInput;
	}
	act(){
		this.files=Array.prototype.slice.call(this.fileInput.files, 0);
		this.fileInput.value = "";
		if(this.cfg.path){
			this.validImg();
		}else{
			this.embedImg();
		}
	}
	validImg(){
		let ix=this.files.find((file, ix)=>{
			if(file.size<this.cfg.minSize){
				this.showError(`图片${file.name}小于${this.cfg.minSizeStr}`);
				return ix;
			}else if(file.size>this.cfg.maxSize){
				this.showError(`图片${file.name}大于${this.cfg.maxSizeStr}`);
				return ix;
			}
		});
		//sizes have no problem;
		if(ix==undefined)this.checkPic(0);
	}
	checkPic(ix){
		if(!this.files[ix])return this.uploadImg(); //all files are passed;
		var r=new FileReader(), f=this.files[ix];
		r.onload=()=>{
			var img=new Image();
			img.onload=()=>{
				if(this.cfg.width && this.cfg.width!=img.width){
					this.showError(`图片"${f.name}"宽度必须为${this.cfg.width}像素`);
				}else if(this.cfg.height && this.cfg.height!=img.height){
					this.showError(`图片"${f.name}"高度必须为${this.cfg.height}像素`);
				}else if(this.cfg.maxWidth && this.cfg.maxWidth<img.width){
					this.showError(`图片"${f.name}"宽度不能超过${this.cfg.maxWidth}像素`);
				}else if(this.cfg.maxHeight && this.cfg.maxHeight<img.height){
					this.showError(`图片"${f.name}"高度不能超过${this.cfg.maxHeight}像素`);
				}else if(this.cfg.minWidth && this.cfg.minWidth>img.width){
					this.showError(`图片"${f.name}"宽度不能少于${this.cfg.minWidth}像素`);
				}else if(this.cfg.minHeight && this.cfg.minHeight>img.height){
					this.showError(`图片"${f.name}"高度不能少于${this.cfg.minHeight}像素`);
				}else{
					this.checkPic(ix+1);
				}
			};
			img.src=r.result;
		};
		r.readAsDataURL(f);
	}
	uploadImg(){
		this.progress=new Progress(this);
		var xhr=new XMLHttpRequest();
		var onError=(msg)=>{
			this.showError(msg||xhr.statusText);
		};
		xhr.onerror=onError;
		xhr.onload=function(){
			this.uploading=false;
			this.progress.hide();
			if(xhr.readyState === 4 && xhr.status === 200){
				if(xhr.responseText){
					var obj;
					try{
						obj=JSON.parse(xhr.responseText);
					}catch(e){
						console.error(xhr.responseText);
						onError(`${e.message}, ${xhr.responseText}`);
					}
					if(obj){ //{urls:[''], isSuccess:true, message:''}
						if(obj.isSuccess){
							obj.urls.forEach((el, ix)=>{
								this.insertImg(el);
							})
						}else{
							onError(obj.message);
						}
					}
				}else{
					onError();
				}
			}else{
				onError();
			}
		}.bind(this);
		xhr.upload.onprogress=function(e){
			if(e.lengthComputable){
				//this.domSign.html(Math.round((e.loaded*100)/e.total)+'%');
				this.progress.update(Math.round((e.loaded*100)/e.total)+'%');
			}
		}.bind(this);
		xhr.upload.onerror=function(e){onError(e.message)};

		this.abort=function(){
			if(xhr.readyState<xhr.DONE){xhr.abort();}
			this.uploading=false;
		};
		//this.ensureFree=function(){
		//	if(this.uploading){
		//		this.abort();
		//		this.progress.hide();
		//	}
		//};
		(this.uploadImg=()=>{
			this.uploading=true;
			xhr.open('post', this.cfg.path, true);
			let formData=new FormData();
			this.files.forEach(function(el, ix){
				formData.append('file', el);
			});
			xhr.send(formData);
			this.progress.update('0%');
			this.progress.show();
		})();
	}
	embedImg(){
		this.files.forEach((el, ix)=>{
			let reader = new FileReader();
			reader.onload = (e) => {
				this.insertImg(e.target.result);
			}
			reader.readAsDataURL(el);
		});

	}
	insertImg(src){
		let range = this.quill.getSelection(true);
		this.quill.updateContents(new Delta()
				.retain(range.index)
				.delete(range.length)
				.insert({ image: src })
				, Emitter.sources.USER);
	}
}
