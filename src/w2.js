;(function(){
    //alert("ww");
	//var win=window,doc=document;
	//console.log(win);
	//console.log(doc);
	if(window.vcredit){
		//如果window已经定义了vcredit对象，不用重新加载
		return;
	}
	var custom_scheme="vcredit",//jsbridge协议定义的名称
		callback_initid=1,//回调函数初始化ID
		callback_functions={},//定义的回调函数集合,可以通过回调函数ID查找得到回调函数
		localh5_functions={},//存放本地注册的方法集合,原生只能调用本地注册过的方法
		version="0.1"+"_"+Date.now();
		
	//console.log(custom_scheme);
	var tool={
		//公用的工具方法
		getType:function(data){
			return Object.prototype.toString.call(data);
		},
		getCallbackId:function(){
			return "cbid_"+(callback_initid++)+"_"+Date.now();
		},
		getUrl:function(message){
			var url=custom_scheme+"://",callbackid,method,source,params;
			callbackid=message.callbackId;
			method=message.method;
			source=message.source;
			params=message.data;
			url+=source+"/"+method+"/"+callbackid+"?"+JSON.stringify(params);
			return url;
		},
		createCall:function(message,callback){
			/**
			*创建iframe发起请求
			*message  json对象	调用的方法详情,包括方法名,传递的数据,请求来源
			*callback 函数类型	native方法执行完后的回调方法
			*/
			console.log("message===",message)
			console.log(callback)
			//没有回调的情况下
			message['callbackId']="nocallback";
			if(callback&&typeof callback==="function"){
				//有回调
				console.log("========有回调=========")
				var callbackid=tool.getCallbackId();
				callback_functions[callbackid]=callback;
				message['callbackId']=callbackid;
			}
			console.log("callback_initid==",callback_initid)
			if(!message.data){
				//没有data
				message.data={};
			}
			var url=tool.getUrl(message);
			console.log("url===",url);
			var iframe = document.createElement("iframe");
			iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.style.display = 'none';
            iframe.src = url;
			document.documentElement.appendChild(iframe);
			
			setTimeout(function(){
               iframe.parentNode.removeChild(iframe);
				iframe = null;
            }, 100);
			
			//分析url模拟原生调用h5
			resolveUrl(url);
		}
	};

	//h5调用native的功能
	function call(method,source,data,callback){
		/**
		*method   字符串类型	方法名  必填项
		*source   字符串类型	项目名,用来标记请求来源,必填项
		*data	  json对象	    传递的数据,非必填项
		*callback 函数类型 	    native方法执行完后的回调方法,非必填项
		*/
		console.log(method)
		console.log(data)
		console.log(callback)
		console.log("实参长度arguments.length==",arguments.length);//实参长度
		console.log("形参长度arguments.callee.length==",arguments.callee.length);//形参长度
		//===vcredit://elearning/getuser/1253452?a=3&b=www
		//情况1:由于前2个参数是必填,只传一个参数属于不正确的调用,只给调试提示，不产生调用
		if(arguments.length===1){
			console.log("分支1");
			console.log("分支1参数错误===调用时不能只传一个参数");
		}
		//情况2:由于前2个参数是必填,只传两个参数,则第一个参数是method,第二个参数是source,其他情况属于不正确的调用,只给调试提示，不产生调用
		if(arguments.length===2){
			console.log("分支2");
			if(typeof method==="string"&&typeof source==="string"&&method.trim().length!==0&&source.trim().length!==0){
				console.log("分支2继续走");
				//===call(method,source)
				tool.createCall({
					method:method.trim(),
					source:source.trim()
				});
			}else{
				console.log("分支2参数错误===调用时参数类型错误或者参数不能为空字符串");
			}
		}
		//情况3:由于前2个参数是必填,只传三个参数,则第一个参数是method,第二个参数是source,第三个参数是data或者callback
		if(arguments.length===3){
			console.log("分支3");
			if(typeof method==="string"&&typeof source==="string"&&tool.getType(data) ==="[object Object]"&&method.trim().length!==0&&source.trim().length!==0){
				console.log("分支3-1继续走");
				//===call(method,source,data)
				tool.createCall({
					method:method.trim(),
					source:source.trim(),
					data:data
				});
			}else if(typeof method==="string"&&typeof source==="string"&&tool.getType(data) ==="[object Function]"&&method.trim().length!==0&&source.trim().length!==0){
				console.log("分支3-2继续走");
				//===call(method,source,callback)
				//此时第三个参数data就是callback
				tool.createCall({
					method:method.trim(),
					source:source.trim()
				},data);
			}else{
				console.log("分支3参数错误===");
			}
		}
		//情况4:由于前2个参数是必填, 传四个参数代表全传
		if(arguments.length===4){
			console.log("====传了4个参数===");
			if(typeof method==="string"&&typeof source==="string"&&tool.getType(data) ==="[object Object]"&&tool.getType(callback) ==="[object Function]"&&method.trim().length!==0&&source.trim().length!==0){
				console.log("分支4");
				console.log("分支4继续走");
				//===call(method,source,data,callback)
				tool.createCall({
					method:method.trim(),
					source:source.trim(),
					data:data
				},callback);
			}else{
				console.log("分支4参数错误===");
			}
		}
	}
	
	//native调用h5的方法
	function callh5(message){
		/**
		*message json对象 传递的数据
		*{callbackid,reponsedata}
		*{funname,data}
		*/
		
		var msg=typeof message==="string"?JSON.parse(message):message;
		var callback=null;
		if(msg.callbackid){
			console.log("===native开始执行回调===");
			//此时是h5调用native且有回调的情况下去执行回调
			console.log("======此时是h5调用native且有回调的情况下去执行回调=====");
			callback=callback_functions[msg.callbackid];
			if(!callback){
				//没找到回调id对应的回调方法就返回
				console.log("没找到回调id对应的回调方法");
				return;
			}
			callback(msg.reponsedata);
			//回调执行完后被删除
			delete callback_functions[msg.callbackid];
		}else{
			//此时是native直接调用h5本地的函数====有执行回调但未实现通知native
			console.log("======native直接调用h5本地的函数=====");
			console.log("msg===",msg);
			var fun=localh5_functions[msg.funname];
			if(fun){
				//本地注册过此函数
				console.log("========本地注册过此函数========");
				fun(msg.data,function(data){
					console.log("===接收native直接调用h5后执行回调传的data===")
					console.log(data)
				});
			}else{
				console.log("==============本地没有注册此函数,调用失败================")
			}
		}
		
	}
	
	function registerLocalFunction(funname,fun){
		//存储本地注册过的方法,native可直接调用
		console.log("===registerLocalFunction被调用了===")
		localh5_functions[funname]=fun;
		console.log(localh5_functions)
	}
	
	//模拟h5调用原生
	function resolveUrl(url){
		var a=url.split("//")[1].split("?");
		//console.log(a);
		var data=a[1],
			info=a[0].split("/"),
			project=info[0],
			action=info[1],
			callbackid=info[2];
		console.log("data==",data);
		console.log("action==",action);
		console.log("callbackid==",callbackid);
		
		var msg={};
		if(data!=="{}"){
			msg.h5data=data;
		}
		if(action==="getname"){
			console.log("==正在模拟执行原生的功能==")
		}
		if(callbackid!=="nocallback"){
			msg.callbackid=callbackid;
			msg.reponsedata="我是执行native功能后执行回调的数据"
			//通过callh5执行回调
			console.log("msg==",msg);
			callh5(msg);
		}else{
			//没有回调，不去调用callh5
			console.log("====没有回调，不去调用callh5====")
		}
		console.log("msg==",msg);
		
		
	}
	//resolveUrl("vcredit://elearning/getuser/nocallback?{}")
	
	
	//对外提供接口
	var _vcredit={
		call:call,
		callh5:callh5,
		registerLocalFunction:registerLocalFunction,
		vhash:version
	};
	//win.vcredit=_vcredit;
	
	/*
	console.log("==========native开始直接调用h5=========");
	callh5({
		data:"111",
		funname:"getAge"
	});
	*/

    // AMD && CMD
    if(typeof define === 'function'){
		console.log("======系统1=======");
        define(function(){
            return _vcredit;
        });
    // CommonJS
    }else if(typeof module !== "undefined" && module !== null){
		console.log("======系统2=======");
        module.exports = _vcredit;
    // window
    }else{
		console.log("======系统3=======");
        window.Vcredit = _vcredit;
    }
	
	//自定义VcreditReady事件,当执行到此此处时Vcredit已经挂载到了window上
	//这段代码必须放在最下面因为此时Vcredit已经挂载到了window上
	var readyEvent = document.createEvent('HTMLEvents');
    readyEvent.initEvent('VcreditReady',false,false);
    readyEvent.bridge = _vcredit;
    document.dispatchEvent(readyEvent);
})();