
Workflow.Context.prototype.use=function(url,onComplete){
  //FIXME load in context
  $.getScript(url+"api/api.js",function(data, textStatus, jqxhr){
    if(jqxhr.status==200){
      return onComplete(null,true);
    } else return onComplete(textStatus);
  });
};

Workflow.Context.prototype.do=function(method,input,onComplete){
  /*
  var methodParts=method.split(".");
  this.api[methodParts[0]][methodParts[1]](input,onComplete);
  */
  //OH CRAP 
  eval(method)(input,onComplete);
};

Workflow.Context.prototype.get=function(url,onComplete){
  $.ajax({
    url: url,
    type:'GET',
  }).done(function(data,textStatus,jqXHR){
    if(data && jqXHR.status>=200 && jqXHR.status<300){
      return onComplete(null,data);
    } else return onComplete(jqXHR.responseText);
  }).fail(function(jqXHR,textStatus,errorThrown){
    return onComplete(jqXHR.responseText);
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
      return onComplete(null,data);
    } else return onComplete(jqXHR.responseText);
  }).fail(function(jqXHR,textStatus,errorThrown){
    return onComplete(jqXHR.responseText);
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
      return onComplete(null,data);
    } else return onComplete(jqXHR.responseText);
  }).fail(function(jqXHR,textStatus,errorThrown){
    return onComplete(jqXHR.responseText);
  });
};

Workflow.Context.prototype.delete=function(url,input,onComplete){
  $.ajax({
    url: url,
    type:'DELETE',
  }).done(function(data,textStatus,jqXHR){
    if(data && jqXHR.status>=200 && jqXHR.status<300){
      return onComplete(null,data);
    } else return onComplete(jqXHR.responseText);
  }).fail(function(jqXHR,textStatus,errorThrown){
    return onComplete(jqXHR.responseText);
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

