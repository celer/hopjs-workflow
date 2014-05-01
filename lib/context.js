
Workflow.Context=function(){
  this.stack=[];
  this.values={};
  this.asyncGroups={};
  this.api={};
  this.depth=0;
};

Workflow.Context.prototype.saveValue=function(name,value){
  this.values[name]=value;
  return value;
};

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
};

Workflow.Context.prototype._onStartTask=function(task){
  this.tasks++;
  this.onStartTask(task);
};

Workflow.Context.prototype._do=function(method,input,onComplete){
  this.onTaskInput(input);
  this.do(method,input,onComplete);
}; 

Workflow.Context.prototype._onCompleteTask=function(task,err,result,testResults){
  var self=this;
  if(testResults){
    testResults.results.forEach(function(result){
      if(result.result===true){
        self.pass++;
      } else {
        self.fail++; 
      } 
    });
  }
  this.onCompleteTask(task,err,result,testResults);
};

Workflow.Context.prototype.summarize=function(){
  return { tasks: this.tasks, fail: this.fail, pass: this.pass, duration: this.finishTime-this.startTime };
};

Workflow.Context.prototype.setStepper=function(stepper){
  this.stepper = stepper;
};

Workflow.Context.prototype.run=function(script,onComplete){
  var self = this;
  if(this.depth===0){
    this.startTime = Date.now();
    this.tasks=0;
    this.pass=0;
    this.fail=0;

    script.validate(this);

  }
  var tasks = script.tasks;
  var step = 0;
  var stepper = this.stepper||function(step){ step(); };

  this.depth++;

  var next=function(){
    if(step < tasks.length){
      tasks[step].run(self,function(){
        step++;
        stepper(next); 
      });
    } else {
      self.depth--;
      self.finishTime = Date.now();
      var summary = self.summarize();
      if(self.depth===0)
        self.log("("+script.name+")","tasks:",summary.tasks,"pass",summary.pass,"fail",summary.fail);
      onComplete(null,self.summarize());
    }
  };
  stepper(next);
};

Workflow.Context.prototype.get=function(url,onComplete){
  throw new Error("Not implemented");
};

Workflow.Context.prototype.post=function(url,input,onComplete){
  throw new Error("Not implemented");
};

Workflow.Context.prototype.put=function(url,input,onComplete){
  throw new Error("Not implemented");
};

Workflow.Context.prototype.delete=function(url,input,onComplete){
  throw new Error("Not implemented");
};

Workflow.Context.prototype.use=function(url,onComplete){
  throw new Error("Not implemented");
};

Workflow.Context.prototype.do=function(method,input,onComplete){
  throw new Error("Not implemented");
};

Workflow.Context.prototype.onStartTask=function(task){
  this.currentTask = { task: task.toString() };
  this.logTaskStart(task.toString());
  this.log("");
};

Workflow.Context.prototype.log=function(){
  var args = Array.prototype.slice.call(arguments);
  
  var str = "";
  for(var i=0;i<this.depth;i++) str+="\t";

  args.unshift(str);

  console.log.apply(console,args);
};

Workflow.Context.prototype.logTaskStart=Workflow.Context.prototype.log;

Workflow.Context.prototype.logFail=Workflow.Context.prototype.log;

Workflow.Context.prototype.logPass=Workflow.Context.prototype.log;

Workflow.Context.prototype.onTaskInput=function(input){
  this.log("\tInput:",JSON.stringify(input));
};

Workflow.Context.prototype.intermediateResult=function(task,err,res){
  if(typeof err=="undefined" && typeof res=="undefined") return;
  this.log("\t(Error:",err,"Result:",JSON.stringify(res),")");
};

Workflow.Context.prototype.onCompleteTask=function(task,err,result,testResults){
  var self=this;

  this.log("\tError",err);
  this.log("\tOutput",JSON.stringify(result));
  this.log("");

  if(testResults){
    testResults.results.forEach(function(result){
      if(result.result){
        self.logPass("\t\t",result.msg);
      } else { 
        self.logFail("\t\t",result.msg);
      } 
    });
  }
  this.log("");
};

