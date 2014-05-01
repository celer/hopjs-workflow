// Require / load some of the packages we need for this RESTFul service
var express = require('express');
var Hop = require('hopjs');

//Create a new web app
var app = express();

//configure our new web app
app.configure(function(){
  //Set the port and load various handlers
  app.set('port', process.env.PORT || 3000);
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  app.use('/', express.static(__dirname));
  app.use(app.router);
});

app.get("/",function(req,res){
  res.redirect("/index.html");
}); 

CounterService={};

CounterService.counters={};

CounterService.create=function(input,onComplete){
  CounterService.counters[input.name]=0;
  return onComplete(null,new Hop.href("CounterService.read",input));
}

CounterService.read=function(input,onComplete){
  if(typeof CounterService.counters[input.name]=="undefined")
    return onComplete(null,null);
  return onComplete(null,{ count: CounterService.counters[input.name], name: input.name, href:new Hop.href("CounterService.read",input)  });
}

CounterService.increment=function(input,onComplete){
  if(typeof CounterService.counters[input.name]=="undefined")
    return onComplete(null,null);
  CounterService.counters[input.name]++;
  return onComplete(null,{ count: CounterService.counters[input.name], name: input.name, href:new Hop.href("CounterService.read",input) });
}

CounterService.update=function(input,onComplete){
  if(typeof CounterService.counters[input.name]=="undefined")
    return onComplete(null,null);
  CounterService.counters[input.name]=input.count;
  console.log("UPDATE",input,CounterService.counters[input.name]);
  return onComplete(null,{ count: CounterService.counters[input.name], name: input.name });
}

CounterService.delete=function(input,onComplete){
  if(typeof CounterService.counters[input.name]=="undefined")
    return onComplete(null,null);
  delete CounterService.counters[input.name];
  return onComplete(null,true);
}

CounterService.list=function(input,onComplete){
  var items=[];
  for(var i in CounterService.counters){
    items.push({
      name: i,
      href: new Hop.href("CounterService.read",{name:i}),
      count: CounterService.counters[i]
    });
  }
  return onComplete(null,{ items: items })
}

MockService={};

MockService.mirrorError=function(input,onComplete){
  return onComplete(input.error);
}

MockService.mirrorInput=function(input,onComplete){
  return onComplete(null,input.value);
}

MockService.now=function(input,onComplete){
  return onComplete(null,{ now: Date.now() });
}

MockService.delay=function(input,onComplete){
  setTimeout(function(){
    return onComplete(null,{ now: Date.now() });
  },input.delay);
}

Hop.defineClass("CounterService",CounterService,function(api){
  api.create("create","/counter/").demand("name");
  api.read("read","/counter/:name");
  api.post("increment","/counter/:name/increment");
  api.update("update","/counter/:name").demand("count");;
  api.del("delete","/counter/:name");
  api.list("list","/counter/");
});

Hop.defineClass("MockService",MockService,function(api){
  api.post("mirrorError","/mock/error").demand("error");
  api.post("mirrorInput","/mock/input").demand("value");
  api.get("now","/mock/now");
  api.get("delay","/mock/delay/:delay");
});


//Hang our restful service off of the /api/ path
Hop.apiHook("/api/",app);

//Start our webservice
app.listen(3000);
