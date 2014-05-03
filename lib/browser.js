
Workflow.Context.prototype.use=function(url,onComplete){
  //FIXME load in context
  if(/\.js$/.test(url)){
    //Do nothing if we are asking for a specific JS file
  } else {
    url+="api/api.js";
  }
  $.getScript(url,function(data, textStatus, jqxhr){
    if(jqxhr.status==200){
      return onComplete(null,true);
    } else return onComplete(textStatus);
  });
};

Workflow.Context.blobFromURL=function(url,onComplete){
    var xhr = new XMLHttpRequest();
    xhr.open("get",url);
    xhr.responseType="blob";
    xhr.onload=function(e){
      if(this.response instanceof Blob){
        return onComplete(null,this.response);
      } else {
        return onComplete(null,new Blob([this.response]));
      }
    };  
    xhr.send();
};

Workflow.Context.prototype.do=function(method,inputValue,onComplete){
  //FIXME this should have options for headers and what not 
  var xhrTasks = [];
  for(var i in inputValue){
    var input = inputValue[i];
    if(input!==null && typeof input._fileFromURL!=="undefined"){
      xhrTasks.push({ url: input._fileFromURL, field: i });  
    }
  }
  var times = 1; 
  var run = function(){
    if(xhrTasks.length>0){
      var xhrTask = xhrTasks.shift();
      Workflow.Context.blobFromURL(xhrTask.url,function(err,blob){
        inputValue[xhrTask.field]=blob;  
        run();
      });
    } else {
      try {
        (eval(method))(inputValue,onComplete);
      } catch(e){
        if(typeof eval(method)=="undefined"){
          return onComplete("Invalid method call:"+method);
        } else return onComplete(e);
      }  
    }
  };
  run();
};

Workflow.Context.prototype.get=function(url,onComplete){
  $.ajax({
    url: url,
    type:'GET',
  }).done(function(data,textStatus,jqXHR){
    if(data && jqXHR.status>=200 && jqXHR.status<300){
      return onComplete(null,data,jqXHR);
    } else return onComplete(jqXHR.responseText,null,jqXHR);
  }).fail(function(jqXHR,textStatus,errorThrown){
    return onComplete(jqXHR.responseText,null,jqXHR);
  });
};

Workflow.Context.prototype.post=function(url,input,onComplete){
  $.ajax({
    url: url,
    type:'POST',
    dataType:"json",
    data: JSON.stringify(input),
    contentType:'application/json',
  }).done(function(data,textStatus,jqXHR){
    if(data && jqXHR.status>=200 && jqXHR.status<300){
      return onComplete(null,data,jqXHR);
    } else return onComplete(jqXHR.responseText,null,jqXHR);
  }).fail(function(jqXHR,textStatus,errorThrown){
    return onComplete(jqXHR.responseText,null,jqXHR);
  });
};

Workflow.Context.prototype.put=function(url,input,onComplete){
  $.ajax({
    url: url,
    type:'PUT',
    dataType:"json",
    data: JSON.stringify(input),
    contentType:'application/json',
  }).done(function(data,textStatus,jqXHR){
    if(data && jqXHR.status>=200 && jqXHR.status<300){
      return onComplete(null,data,jqXHR);
    } else return onComplete(jqXHR.responseText,null,jqXHR);
  }).fail(function(jqXHR,textStatus,errorThrown){
    return onComplete(jqXHR.responseText,null,jqXHR);
  });
};

Workflow.Context.prototype.delete=function(url,input,onComplete){
  $.ajax({
    url: url,
    type:'DELETE',
  }).done(function(data,textStatus,jqXHR){
    if(data && jqXHR.status>=200 && jqXHR.status<300){
      return onComplete(null,data,jqXHR);
    } else return onComplete(jqXHR.responseText,null,jqXHR);
  }).fail(function(jqXHR,textStatus,errorThrown){
    return onComplete(jqXHR.responseText,null,jqXHR);
  });
};

Workflow.Context.prototype.setSelector=function(selector){
  this.selector=selector;
};

Workflow.Context.prototype.log=function(){
  var args = Array.prototype.slice.call(arguments);
  
  args=args.map(function(arg){
    if(typeof arg=="string") return arg;
    else return JSON.stringify(arg);
  });
  
  var ts=""; 
  for(var i=0;i<this.depth;i++) ts+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

  str = ts+args.join(" ");

  str=str.replace("\t","&nbsp;&nbsp;&nbsp;");
  str+="</br>";
  

  $(this.selector||"body").append(str);

};

Workflow.Context.prototype.logTaskStart=function(){
  var args = Array.prototype.slice.call(arguments);
  args=args.map(function(arg){
    if(typeof arg=="string") return "<b>"+arg+"</b>";
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

Workflow.Context.prototype.logFail=function(){
  var args = Array.prototype.slice.call(arguments);
  args=args.map(function(arg){
    if(typeof arg=="string") return "<font color='red'>"+arg+"</font>";
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

Workflow.Context.prototype.logPass=function(){
  var args = Array.prototype.slice.call(arguments);
  args=args.map(function(arg){
    if(typeof arg=="string") return "<font color='green'>"+arg+"</font>";
    else return arg;
  });
  Workflow.Context.prototype.log.apply(this,args);
};

