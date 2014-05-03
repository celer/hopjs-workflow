var hopjsRemote = require('hopjs-remote');
var Workflow = require('./core');
var request = require('request');
var colors = require('colors');
var url = require('url');

require('./context');

Workflow.Context.prototype.use=function(urlOrService,onComplete){
  var self=this;


  if(urlOrService.indexOf("http")==-1 && this.baseUrl){
    urlOrService = url.resolve(this.baseUrl,urlOrService);
  }

  console.log(urlOrService);
  if(/\/$/.test(urlOrService)){
    //urlOrService+="api.json";
    hopjsRemote.remoteAPI(urlOrService,function(err,service){
      if(err) return onComplete(err);
      for(var obj in service){
        self.api[obj]=service[obj];
      }
      return onComplete(null,self.api);
    });
  } else {
    request.get(urlOrService,function(err,ahr,data){
      if(err) return onComplete(err);
      if(!data) return onComplete("Error loading service:"+urlOrService); 
      eval(data);
      TestUse.test(null,function(){});
      onComplete(null,data);    
    }); 
  } 
};

Workflow.Context.prototype.do=function(method,input,onComplete){
  var methodParts=method.split(".");
  if(this.api[methodParts[0]] && this.api[methodParts[0]][methodParts[1]]){
    this.api[methodParts[0]][methodParts[1]](input,onComplete);
  } else {
    eval(method)(input,onComplete);
  }
};

Workflow.Context.prototype.get=function(url,onComplete){
  request({ 
    url: url,
    method:'GET',
  },function(err,res,body){
    if(res.statusCode>=200 && res.statusCode<300){
      try {
        body = JSON.parse(body);
      } catch(e){

      }
      return onComplete(err,body,res);
    } else return onComplete(body,null,res);
  });
};

Workflow.Context.prototype.post=function(url,input,onComplete){
  request({ 
    url: url,
    method:'POST',
    json:true,
    body: input
  },function(err,res,body){
    if(res.statusCode>=200 && res.statusCode<300){
      try {
        body = JSON.parse(body);
      } catch(e){

      }
      return onComplete(err,body,res);
    } else return onComplete(body,null,res);
  });
};

Workflow.Context.prototype.put=function(url,input,onComplete){
  request({ 
    url: url,
    method:'PUT',
    json:true,
    body: input
  },function(err,res,body){
    if(res.statusCode>=200 && res.statusCode<300){
      try {
        body = JSON.parse(body);
      } catch(e){

      }
      return onComplete(err,body,res);
    } else return onComplete(body,null,res);
    onComplete(err,body);
  });
};

Workflow.Context.prototype.delete=function(url,input,onComplete){
  request({ 
    url: url,
    method:'DELETE',
    json:true,
    body: input
  },function(err,res,body){
    if(res.statusCode>=200 && res.statusCode<300){
      try {
        body = JSON.parse(body);
      } catch(e){

      }
      return onComplete(err,body,res);
    } else return onComplete(body,null,res);
  });
};

Workflow.Context.prototype.logTaskStart=function(){
  var args = Array.prototype.slice.call(arguments);
  var colors=Workflow.useColors;
  args=args.map(function(arg){
    if(typeof arg=="string") return (colors?arg.bold:arg);
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

Workflow.Context.prototype.logFail=function(){
  var args = Array.prototype.slice.call(arguments);
  var colors=Workflow.useColors;
  args=args.map(function(arg){
    if(typeof arg=="string") return (colors?arg.red:arg);
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

Workflow.Context.prototype.logPass=function(){
  var args = Array.prototype.slice.call(arguments);
  var colors=Workflow.useColors;
  args=args.map(function(arg){
    if(typeof arg=="string") return (colors?arg.green:arg);
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

