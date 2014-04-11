var hopjsRemote = require('hopjs-remote');
var Workflow = require('./core');
var request = require('request');

require('./context');

Workflow.Context.prototype.use=function(url,onComplete){
  hopjsRemote.remoteAPI(url,function(err,api){
    return onComplete(err,api);
  });   
}

Workflow.Context.prototype.do=function(method,input,onComplete){
  var method=method.split(".");
  this.api[method[0]][method[1]](input,onComplete);
}

Workflow.Context.prototype.get=function(url,onComplete){
  request({ 
    url: url,
    method:'GET',
  },function(err,res,body){
    try {
      body = JSON.parse(body);
    } catch(e){

    }
    onComplete(err,body);
  });
}

Workflow.Context.prototype.post=function(url,input,onComplete){
  request({ 
    url: url,
    method:'POST',
    json:true,
    body: input
  },function(err,res,body){
    try {
      body = JSON.parse(body);
    } catch(e){

    }
    onComplete(err,body);
  });
}

Workflow.Context.prototype.put=function(url,input,onComplete){
  request({ 
    url: url,
    method:'PUT',
    json:true,
    body: input
  },function(err,res,body){
    try {
      body = JSON.parse(body);
    } catch(e){

    }
    onComplete(err,body);
  });
}

Workflow.Context.prototype.delete=function(url,input,onComplete){
  request({ 
    url: url,
    method:'DELETE',
    json:true,
    body: input
  },function(err,res,body){
    try {
      body = JSON.parse(body);
    } catch(e){

    }
    onComplete(err,body);
  });
}

