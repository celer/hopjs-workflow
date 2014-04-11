
Workflow={};

/**
  Utility function to copy an object, primarly used by .with
  
  @static
  @method Hop.TestUtils.extendTo
**/
Workflow.extendTo=function(toObj,fromObj){
    if(toObj==undefined) return fromObj;

    var result = JSON.parse(JSON.stringify(toObj));
    
    var copyProps = function(toObj,fromObj){
      for(var propName in fromObj){
        var prop = fromObj[propName];
        if(prop!=null && typeof prop == "object" && typeof toObj[propName]=="object"){
          copyProps(toObj[propName],fromObj[propName]);  
        } else {
          toObj[propName]=prop; 
        }  
      }
    }
    
    copyProps(result,fromObj); 
    return result;
}



/**
  Resolve a values within an array or object based upon saved values
  
  This function will search for strings matching #{.+#} and replace  
  the object property or array value with the resolved value from a saved value. 

  Values are resolved like so:
  @example
    with(savedValues){
      return eval(inputString);
    }  

  @examples
    #{savedUser.name}
    #{savedUsers[1].name}
    #{undefined} // will return undefined  

  @static
  @method Hop.TestUtils.resolve
**/
Workflow.resolve=function(context,object,checkSavedObjects){
  if(typeof object=="string" && checkSavedObjects==true){ 
    var res = context.loadValue(object);
    if(typeof res!="undefined")
      return res;
  }
  if(object instanceof Array){
    return object.map(function(item){
      return Workflow.resolve(context,item);
    });  
  } else if(typeof object=="object"){
    for(var propName in object){
      var prop = object[propName];
      object[propName]=Workflow.resolve(context,prop);
    }
    return object;
  } else if(typeof object=="string"){
      var m = /^\#\{(.+)\}$/.exec(object);
      if(m && m.length>1){
        return context.loadValue(m[1]);
      } else {
        return object;  
      }
  } else return object;
}

Workflow.with=function(context,args){
  var obj = args[0];

  if(!obj instanceof Array)
    throw new Error("args must be an array");

  if(typeof obj=='string'){ obj = context.loadValue(obj); }
  for(var i=1;i<args.length;i++){
    if(typeof obj=='string'){ obj = context.loadValue(obj); }
    if(typeof args[i]=='string'){ args[i] = context.loadValue(args[i]); }
    obj = Workflow.extendTo(obj,args[i]);
  }
  obj = Workflow.resolve(context,obj,true);
  return obj;
}


module.exports=Workflow;


