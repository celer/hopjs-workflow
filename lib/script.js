var Workflow = require('./core');

Workflow.Script=function(input){
  if(typeof input=="string"){
    this.name=input;
    this.tasks=[];
  } else if(typeof input=="object"){
    this.name=input.name;
    var taskLists = [ "tasks", "setup", "tearDown" ];
    var self=this;
    taskLists.forEach(function(list){
      if(input[list] && input[list] instanceof Array){
        self[list]= input[list].map(function(task){
          return new Workflow.Task(task);
        });
      }
    });
  }
}

Workflow.Script.prototype.asyncWait=function(group){
  var res = new Workflow.Task.AsyncWait(group);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.times=function(times,onLoop){
  var res = new Workflow.Task.Times(times,onLoop);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.forEach=function(input,index,value,onLoop){
  var res = new Workflow.Task.ForEach(input,index,value,onLoop);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.do=function(method){
  var res = new Workflow.Task.Do(method);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.until=function(method,delay,times){
  var res = new Workflow.Task.Until(method,delay,times);
  this.tasks.push(res);
  return res;
}


Workflow.Script.prototype.use=function(url){
  var res = new Workflow.Task.Use(url);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.get=function(url){
  var res = new Workflow.Task.Get(url);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.post=function(url){
  var res = new Workflow.Task.Post(url);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.put=function(url){
  var res = new Workflow.Task.Put(url);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.delete=function(url){
  var res = new Workflow.Task.Delete(url);
  this.tasks.push(res);
  return res;
}

Workflow.Script.prototype.describe=function(description){
  this.description=description;
}

