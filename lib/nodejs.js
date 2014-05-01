var hopjsRemote = require('hopjs-remote');
var Workflow = require('./core');
var request = require('request');
var colors = require('colors');

require('./context');

Workflow.Context.prototype.use=function(url,onComplete){
  hopjsRemote.remoteAPI(url,function(err,api){
    return onComplete(err,api);
  });   
};

Workflow.Context.prototype.do=function(method,input,onComplete){
  var methodParts=method.split(".");
  this.api[methodParts[0]][methodParts[1]](input,onComplete);
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
      return onComplete(err,body);
    } else return onComplete(body);
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
      return onComplete(err,body);
    } else return onComplete(body);
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
      return onComplete(err,body);
    } else return onComplete(body);
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
      return onComplete(err,body);
    } else return onComplete(body);
  });
};

Workflow.Context.prototype.logTaskStart=function(){
  var args = Array.prototype.slice.call(arguments);
  args=args.map(function(arg){
    if(typeof arg=="string") return arg.bold;
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

Workflow.Context.prototype.logFail=function(){
  var args = Array.prototype.slice.call(arguments);
  args=args.map(function(arg){
    if(typeof arg=="string") return arg.red;
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

Workflow.Context.prototype.logPass=function(){
  var args = Array.prototype.slice.call(arguments);
  args=args.map(function(arg){
    if(typeof arg=="string") return arg.green;
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

