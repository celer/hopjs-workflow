Workflow.Task=function(input){
  /*
  //FIXME this may not be needed any more?
  var copyItems = ["do","put","post","get","delete","return","with","description","tests","use","value","source","index"];
  var self=this;
  copyItems.forEach(function(item){
    if(input[item]){
      self[item]=input[item];
    }
  })

  var scripts=["onComplete","onSuccess","onError","onLoop"];
  scripts.forEach(function(script){
    if(input[script]){
      self[script]=new Workflow.Script(input[script]);
    }
  });
  */
  this.data={};
  return this;
};

Workflow.Task.prototype.async=function(asyncGroup){
  this.data.asyncGroup=asyncGroup;
  return this;
};

Workflow.Task.prototype.run=function(context,onComplete){
  context._onStartTask(this);
  var self=this;

  var done = function(err,res,testResults,onCompleteTask){
      context._onCompleteTask(self,err,res,testResults);
      var tasks=0;
      if(((testResults && testResults.result===true) || (!testResults && res)) && self.data.onSuccess){
        tasks++;
        context.run(self.data.onSuccess,function(){
          tasks--;
          if(tasks===0){
            return onCompleteTask(err,res,testResults);
          }
        });     
      } else if(((testResults && testResults.result===false) || (!testResults && err)) && self.data.onError){
        tasks++;
        context.run(self.data.onError,function(){
          tasks--;
          if(tasks===0)
            return onCompleteTask(err,res,testResults);
        });     
      } else {
        if(tasks===0){
          return onCompleteTask(err,res,testResults);
        } else {
          
        }
      }
  };
  if(typeof self.data.asyncGroup==="string"){
    if(!context.asyncGroups[self.data.asyncGroup]){
      context.asyncGroups[self.data.asyncGroup]=0;
    }
    context.asyncGroups[self.data.asyncGroup]++;
    self.execute(context,function(err,res,testResults){
      done(err,res,testResults,function(err,res,testResults){
        context.asyncGroups[self.data.asyncGroup]--;
      });
    });
    onComplete(null,null,null);
  } else {
    self.execute(context,function(err,res,testResults){
      done(err,res,testResults,onComplete);
    });
  }
};

Workflow.Task.prototype.execute=function(context,onComplete){
  throw new Error("Execute for this task is not implemented");
};

Workflow.Task.prototype.runTests=function(context,err,output){
  var self=this;
  var results=[];
  var result=true;
  if(this.data.tests){
    for(var i in this.data.tests){
      var test = this.data.tests[i];
      if(Workflow.Tests[test.what]){
        var res = Workflow.Tests[test.what](output,err,test,context);
        res.test=test;
        results.push(res);
        if(res.result===false)
          result=false;
      } else throw new Error("Invalid test specified '"+test.what+"'");  
    }
  }
  return { result:result, results:results};
};

Workflow.Task.prototype.with=function(){
  this.data.with=Array.prototype.slice.call(arguments);
  return this;
};

Workflow.Task.prototype.onComplete=function(test){
  var tc = new Workflow.Script("onComplete");
  test(tc); 
  this.data.onComplete=tc;
  return this;
};

Workflow.Task.prototype.onSuccess=function(test){
  var tc = new Workflow.Script("onSuccess");
  test(tc); 
  this.data.onSuccess=tc;
  return this;
};

Workflow.Task.prototype.onError=function(test){
  var tc = new Workflow.Script("onError");
  test(tc); 
  this.data.onError=tc;
  return this;
};

Workflow.Task.prototype.describe=function(description){
  this.data.description=description;
  return this;
};

Workflow.Task.prototype.addOperation=function(test){
  if(!this.data.tests) this.data.tests=[];
  this.data.tests.push(test);
  return this;
};

Workflow.Task.prototype.errorContains=function(value){
  return this.addOperation({ value: value, what:"errorContains" });
};

Workflow.Task.prototype.errorIsNull=function(){
  return this.addOperation({what:"errorIsNull"});
};

Workflow.Task.prototype.outputIsNull=function(){
  return this.addOperation({what:"outputIsNull"});
};

Workflow.Task.prototype.outputContains=function(value){
  return this.addOperation({what:"outputContains", value: value });
};

Workflow.Task.prototype.outputDoesntContain=function(value){
  return this.addOperation({what:"outputDoesntContain", value: value });
};

Workflow.Task.prototype.outputIsNotNull=function(){
  return this.addOperation({what:"outputIsNotNull"});
};

Workflow.Task.prototype.outputIsArray=function(){
  return this.addOperation({what:"outputIsArray"});
};

Workflow.Task.prototype.arrayContains=function(array,value){
  return this.addOperation({what:"arrayContains", property:array, value:value });
};

Workflow.Task.prototype.arrayLengthIs=function(array,min,max){
  return this.addOperation({what:"arrayLengthIs", property:array, min:min, max:max });
};

Workflow.Task.prototype.arrayDoesntContain=function(arra,value){
  return this.addOperation({what:"arrayDoesntContain", property:array, value:value});
};

Workflow.Task.prototype.propertyIsNull=function(property){
  return this.addOperation({what:"propertyIsNull", property:property });
};

Workflow.Task.prototype.propertyContains=function(property, value){
  return this.addOperation({what:"propertyContains",property:property, value: value });
};

Workflow.Task.prototype.propertyDoesntContain=function(property, value){
  return this.addOperation({what:"propertyDoesntContain",property:property, value: value });
};

Workflow.Task.prototype.propertyIsNotNull=function(property){
  return this.addOperation({what:"propertyIsNotNull", property:property});
};

Workflow.Task.prototype.propertyIsArray=function(property){
  return this.addOperation({what:"propertyIsArray", property:property});
};

Workflow.Task.prototype.savePropertyAs=function(property,name){
  return this.addOperation({what:"savePropertyAs",property:property, name:name });
};

Workflow.Task.prototype.saveOutputAs=function(name){
  return this.addOperation({what:"saveOutputAs", name:name });
};

Workflow.Task.prototype.outputEval=function(func){
  return this.addOperation({ what:"outputEval",eval:func.toString()});
}; 

Workflow.Task.Wait=function(wait){
  Workflow.Task.call(this);
  this.data={ wait: wait||1000 };
};


Workflow.Script.prototype.wait=function(wait){
  var res = new Workflow.Task.Wait(wait);
  this.tasks.push(res);
  return null;
};
Workflow.Task.Wait.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Wait.constructor = Workflow.Task.Wait;

Workflow.Task.Wait.prototype.toString=function(){
  return "Wait "+this.data.wait+"ms";
};

Workflow.Task.Wait.prototype.execute=function(context,onComplete){
  var self=this;
  setTimeout(onComplete,self.data.wait);
};

Workflow.Task.Until=function(method,delay,times){
  Workflow.Task.call(this);

  this.data={ until: method, delay: delay||1000, times: times };
};

Workflow.Task.Until.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Until.constructor = Workflow.Task.Until;

Workflow.Task.Until.prototype.toString=function(){
  return "Until "+this.data.until+" every"+(typeof this.data.delay=="number"?" "+this.data.delay+"ms":"")+(typeof this.data.times=="number"?" "+this.data.times+" times":"");
};

Workflow.Task.Until.prototype.execute=function(context,onComplete){
  var self=this;
  if(context.do){
    if(this.data.with){
      var w = JSON.parse(JSON.stringify(this.data.with));
      input = w && Workflow.with(context,w);
    }
    var times = this.data.times;
    var until = function(){
      context._do(self.data.until,input,function(err,result){
        var testResults=self.runTests(context,err,result);
        if(!testResults.result){
          if(typeof times == "number"){
            times--;
            if(times<0)
              return onComplete(err,result,testResults);
          }
          context.intermediateResult(self,err,result,testResults);
          setTimeout(until,self.data.delay);
        } else {
          return onComplete(err,result,testResults);
        }
      });
    };
    until();
  } else throw new Error("'do' is not supported in this context");
};


Workflow.Task.Do=function(method){
  Workflow.Task.call(this);
  this.data={ do:method };
};

Workflow.Task.Do.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Do.constructor = Workflow.Task.Do;

Workflow.Task.Do.prototype.toString=function(){
  return "Do "+this.data.do+" with "+JSON.stringify(this.data.with);
};

Workflow.Task.Do.prototype.execute=function(context,onComplete){
  var self=this;
  var input;
  if(context.do){
    if(this.data.with){
      var w = JSON.parse(JSON.stringify(this.data.with));
      input = w && Workflow.with(context,w);
    }
    
    context._do(this.data.do,input,function(err,result){
      var testResults = self.runTests(context,err,result);
      return onComplete(err,result,testResults);
    });
  } else throw new Error("'do' is not supported in this context");
};

Workflow.Task.Times=function(times,onLoop){
  Workflow.Task.call(this);
  this.data={ times:times };
  this.data.script = new Workflow.Script("Times:"+times);
  onLoop(this.data.script); 
};

Workflow.Task.Times.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Times.constructor = Workflow.Task.Times;

Workflow.Task.Times.prototype.toString=function(){
  return "Execute block "+this.data.times+" times";
};

Workflow.Task.Times.prototype.execute=function(context,onComplete){
  var self=this;
  var times = this.data.times;
  var doLoop = function(){
    if(times>0){
      context.run(self.data.script,function(err,res){
        context.intermediateResult(self,err,res);
        times--;
        doLoop();
      });
    } else {
      onComplete(null,null);
    }
  };
  doLoop();
};

Workflow.Task.ForEach=function(input,index,value,onLoop){
  Workflow.Task.call(this);
  this.data={};
  this.data.input=input;
  this.data.index=index;
  this.data.value=value;
  this.data.script = new Workflow.Script("ForEach:"+input);
  onLoop(this.data.script); 
};

Workflow.Task.ForEach.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.ForEach.constructor = Workflow.Task.ForEach;

Workflow.Task.ForEach.prototype.toString=function(){
  return "ForEach "+this.data.input+" as "+this.data.index+" -> "+this.data.value;
};

Workflow.Task.ForEach.prototype.execute=function(context,onComplete){
  var self=this;
  var input = this.data.input && Workflow.with(context,[ this.data.input ]);  
  var index=0;
  if(input instanceof Array){
    index=0;
    var doLoopArray = function(){
      if(index<input.length){
        context.saveValue(self.data.index,index);
        context.saveValue(self.data.value,input[index]);
        context.run(self.data.script,function(){
          index++;
          doLoopArray();
        });
      } else {
        return onComplete(null,null);
      }
    };
    doLoopArray();
  } else if(typeof input == "object") {
    index=0;
    var keys = Object.keys(input);
    var doLoopObject = function(){
      if(index<keys.length){
        context.saveValue(self.data.index,keys[index]);
        context.saveValue(self.data.value,input[keys[index]]);
        context.run(self.data.script,function(){
          index++;
          doLoopObject();
        });
      } else {
        return onComplete(null,null);
      }
    };
    doLoopObject();
  } else {
    throw new Error("Invalid iteration value:"+JSON.stringify(input));
  }
};


Workflow.Task.Use=function(url){
  Workflow.Task.call(this);
  this.data={};
  this.data.use=url;
};

Workflow.Task.Use.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Use.constructor = Workflow.Task.Use;

Workflow.Task.Use.prototype.execute=function(context,onComplete){
  var self=this;
  if(context.use){ 
    var url = this.data.use;
    url=url.replace(/\#{[^}]+}/g,function(m){
      return Workflow.resolve(context,m);
    });
    context.use(url,function(err,api){
      //FIXME What happens if we get an error here? Do we fail the entire workflow and try to do the cleanup?
      if(!context.api) context.api={};
      for(var i in api){
        context.api[i]=api[i];
      }  
      return onComplete(err,api);
    });
  } else throw new Error("'use' is not supported in this context");
};

Workflow.Task.Use.prototype.toString=function(){
  return "Use the API from "+this.data.use;
};

Workflow.Task.AsyncWait=function(group){
  Workflow.Task.call(this);
  this.data={};
  this.data.asyncWait=group;
};

Workflow.Task.AsyncWait.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.AsyncWait.constructor = Workflow.Task.AsyncWait;

Workflow.Task.AsyncWait.prototype.toString=function(){
  return "Async wait for group "+this.data.asyncWait;
};

Workflow.Task.AsyncWait.prototype.execute=function(context,onComplete){
  var self=this;
  if(typeof context.asyncGroups[self.data.asyncWait]!="undefined"){
    var wait=function(){
      if(context.asyncGroups[self.data.asyncWait]>0){
        setTimeout(wait,50);
      } else onComplete();
    };
    wait();
  } else {
    onComplete();
  }
};

Workflow.Task.Get=function(url){
  Workflow.Task.call(this);
  this.data={};
  this.data.get=url;
};

Workflow.Task.Get.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Get.constructor = Workflow.Task.Get;

Workflow.Task.Get.prototype.toString=function(){
  return "Get "+this.data.get;
};

Workflow.Task.Get.prototype.execute=function(context,onComplete){
  var self=this;
  if(context.get){
    var input={};
    if(this.data.with){
      var w = JSON.parse(JSON.stringify(this.data.with));
      input = w && Workflow.with(context,w);
    }
    var url = this.data.get;
    console.log(this.data);
    url=url.replace(/\#{[^}]+}/g,function(m){
      return Workflow.resolve(context,m);
    });
    console.log("URL",url);
    context.get(url,function(err,result){
      var testResults = self.runTests(context,err,result);
      onComplete(err,result,testResults);
    });    
  } else throw new Error("'get' is not supported in this context'");
};


Workflow.Task.Post=function(url){
  Workflow.Task.call(this);
  this.data={};
  this.data.post=url;
};

Workflow.Task.Post.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Post.constructor = Workflow.Task.Post;

Workflow.Task.Post.prototype.toString=function(){
  return "Post "+this.data.post;
};

Workflow.Task.Post.prototype.execute=function(context,onComplete){
  var self=this;
  if(context.post){
    var input;
    if(this.data.with){
      var w = JSON.parse(JSON.stringify(this.data.with));
      input = w && Workflow.with(context,w);
    }
    var url = this.data.post;
    url=url.replace(/\#{[^}]+}/g,function(m){
      return Workflow.resolve(context,m);
    });
    context.post(url,input,function(err,result){
      var testResults = self.runTests(context,err,result);
      onComplete(err,result,testResults);
    });    
  } else throw new Error("'post' is not supported in this context'");
};

Workflow.Task.Put=function(url){
  Workflow.Task.call(this);
  this.data={};
  this.data.put=url;
};

Workflow.Task.Put.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Put.constructor = Workflow.Task.Put;

Workflow.Task.Put.prototype.toString=function(){
  return "Put "+this.data.put;
};

Workflow.Task.Put.prototype.execute=function(context,onComplete){
  var self=this;
  if(context.put){
    var input;
    if(this.data.with){
      var w = JSON.parse(JSON.stringify(this.data.with));
      input = w && Workflow.with(context,w);
    }
    var url = this.data.put;
    url=url.replace(/\#{[^}]+}/g,function(m){
      return Workflow.resolve(context,m);
    });
    context.put(url,input,function(err,result){
      var testResults = self.runTests(context,err,result);
      onComplete(err,result,testResults);
    });    
  } else throw new Error("'post' is not supported in this context'");
};
Workflow.Task.Delete=function(url){
  Workflow.Task.call(this);
  this.data={};
  this.data.delete=url;
};

Workflow.Task.Delete.prototype = Object.create(Workflow.Task.prototype);
Workflow.Task.Delete.constructor = Workflow.Task.Delete;

Workflow.Task.Delete.prototype.toString=function(){
  return "Delete "+this.data.delete;
};

Workflow.Task.Delete.prototype.execute=function(context,onComplete){
  var self=this;
  if(context.delete){
    var indelete;
    if(this.data.with){
      var w = JSON.parse(JSON.stringify(this.data.with));
      indelete = w && Workflow.with(context,w);
    }
    var url = this.data.delete;
    url=url.replace(/\#{[^}]+}/g,function(m){
      return Workflow.resolve(context,m);
    });
    context.delete(url,indelete,function(err,result){
      var testResults = self.runTests(context,err,result);
      onComplete(err,result,testResults);
    });    
  } else throw new Error("'post' is not supported in this context'");
};
