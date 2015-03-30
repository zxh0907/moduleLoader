(function(global){
	global = global || this;
	/*存储已加载的模块，格式如{ 
	* 'moduleName': {         //模块名称
	*     "fn": function(){}, //模块函数
	*     "params":[]         //模块函数带的参数（即:依赖包对外接口）。如：模块A 依赖于模块B,C，那么参数为[B, C]
	*  }
	* 
	*/
	var cache = {}; 
	var config = {
		"baseUrl" : "/"
	}; 
	function loadScript(src, options){
		var head = document.head  || document.getElementsByTagName('head')[0] || document.documentElement
		var o = document.createElement("script");
		o.type = "text/javascript";
		o.src = src + "?rnd=" + Math.random();		
		if(options["onload"]){ o.onload = options["onload"]; }
		if(options["onerror"]){ o.onerror = options["onerror"]; }
		head.appendChild(o);
	}
	function _testType(obj , type){
		return Object.prototype.toString.call(obj) == "[object "+type+"]";
	}
	function require(modules, callback){
		if(_testType(modules, 'Array')){
			loadMod(modules,function(gettedMod){
				if(callback){
					callback.apply(global, gettedMod);
				} 
			});
		} else if(_testType(modules, 'String')){
			var mod = cache[modules];
			var modFn = mod.fn.apply(global,mod["params"]);
			return modFn;
		}
	}
	function loadMod(modAry, callback){
		var gettedMod = [];
		var n = 0;
		var load = function(){
			if(n >= modAry.length){ 				
				if(callback){ 
					callback(gettedMod);
				}
				return; 
			}
			var mod = modAry[n++];		
			if(!cache[mod]){
				loadScript(config.baseUrl + mod + ".js", {
					onload: function(){
						var tmpMod = require(mod);
						gettedMod.push(tmpMod);
						load();
					}
				});
			} else {
				gettedMod.push(cache[mod]["fn"]());
				load();
			}
		};

		load();
	}
	/***************
	* function @define: 定义模块
	* string @modName: 模块名称（必填，与文件名需保持一致）
	* 注：1.如需依赖模块，则第二个参数为array: modAry，第三个参数为模块方法
	*     2.如不需要依赖模块，则只需2个参数，第二个参数直接是function: 模块方法
	* 
	****************/
	function define(modName){
		var modAry = [], 
			callback;
		if(arguments.length == 2){
			if(_testType(arguments[1], 'Function')){
				callback = arguments[1];
			}
		} else if(arguments.length == 3){
			if(_testType(arguments[1], 'Array')){
				modAry = arguments[1];
			}
			if(_testType(arguments[2], 'Function')){
				callback = arguments[2];
			}
		}

		var onLoadMod = function(gettedMod){
			gettedMod = gettedMod || [];			
			cache[modName] = {
				"fn" : callback,
				"params": gettedMod
			};
			callback.apply(global, gettedMod);
		};
		if(modAry.length > 0){
			loadMod(modAry, onLoadMod);	
		} else {
			onLoadMod();
		}			
	}
	function setConfig(options){
		for(var k in options){
			config[k] = options[k];
		}
	}
	require["config"] = setConfig;
	require["cache"] = cache;
	require["testType"] = _testType;
	global.define = define;
	global.require = require;
	return require;
	
})(this);
