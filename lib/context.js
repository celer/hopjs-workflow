var Workflow = require('./core');
var hopjsRemote = require('hopjs-remote');
var colors = require('colors');

Workflow.Context=function(){
  this.stack=[];
  this.values={};
  this.asyncGroups={};
  this.api={};
  this.depth=0;
}

Workflow.Context.prototype.saveValue=function(name,value){
  this.values[name]=value;
  return value;
}

Workflow.Context.prototype.loadValue=function(name){
  if(typeof name=="string"){
    if(typeof this.values!="undefined"){
      with(this.values){
        try {
          return eval(name);
        } catch(e){
          return undefined;
        }
      }
    }
  }
  return undefined;
} 

Workflow.Context.prototype.onStartTask=function(task){
  var str="";
  for(var i=1;i<this.depth;i++) str+="\t";
  console.log(str,task.toString());
  console.log("\n");
}

Workflow.Context.prototype.intermediateResult=function(task,err,res){
  var str="";
  for(var i=1;i<this.depth;i++) str+="\t";
  console.log(str,"\t(Error:",err, "Result:",JSON.stringify(res),")");
}

Workflow.Context.prototype.onCompleteTask=function(task,err,result,testResults){
  var str="";
  for(var i=1;i<this.depth;i++) str+="\t";
  console.log(str,"\tError",err);
  console.log(str,"\tOutput",JSON.stringify(result));
  if(testResults){
    testResults.results.forEach(function(result){
      if(result.result)
        console.log(str,"\t\t",result.msg.green);
      else
        console.log(str,"\t\t",result.msg.red);
    });
  }
  console.log("\n");
}

Workflow.Context.prototype.setStepper=function(stepper){
  this.stepper = stepper;
}

Workflow.Context.prototype.run=function(script,onComplete){
  var self = this;
  var tasks = script.tasks;
  var step = 0;
  var stepper = this.stepper||function(step){ step() };

  this.depth++;

  var next=function(){
    if(step < tasks.length){
      tasks[step].run(self,function(){
        step++;
        stepper(next); 
      });
    } else {
      self.depth--;
      onComplete();
    }
  }

  stepper(next);


}


Workflow.Context.prototype.use=function(url,onComplete){
  hopjsRemote.remoteAPI(url,function(err,api){
    return onComplete(err,api);
  });   
}

Workflow.Context.prototype.do=function(method,input,onComplete){
  var method=method.split(".");
  context.api[method[0]][method[1]](input,onComplete);
}

