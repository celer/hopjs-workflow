assert={
  equal:function(a,b){
    if(a!=b)
      throw new Error("Values did not match: "+JSON.stringify(a)+" "+JSON.stringify(b));
  },
  deepEqual:function(a,b){
    if(JSON.stringify(a)!=JSON.stringify(b))
      throw new Error("Values did not match: "+JSON.stringify(a)+" "+JSON.stringify(b));
  }
};

if(typeof Workflow=="undefined"){
  Workflow={};
}


Workflow.getProperty = function(obj,prop){
  if(typeof obj=="undefined")
    return obj;

  if(prop.length===0)
    return obj;

  var parts,part;
  if(/^\[/.test(prop)){
    parts = /^\[[^\]]+\]/.exec(prop);
    if(!parts) return undefined;
    part=parts[0].replace(/^\[/,"").replace(/\]$/,"");
    var a;
    //FIXME this is very very very bad
    part = unescape(part);
    part = part.replace(/^[\'\"]/,"").replace(/[\'\"]$/,"");
    //Check to see if we have an array
  } else {
    parts = /^[^.^\[^\]]+\.?/.exec(prop);
    if(!parts) return undefined;
    part=parts[0].replace(/\.?$/,"");
  }
  if(obj.hasOwnProperty(part)){
    obj = obj[part];
  } else return undefined;
  prop=prop.substr(parts[0].length).replace(/^\./,"");
  return Workflow.getProperty(obj,prop);
};

var foo = { a: 2, b: { c: 3, d: 5, e: 6, f: { a: 1}, k: [ { a: 1} ] }, "foo bar":22};
assert.equal(Workflow.getProperty(foo,"a"),2);
assert.equal(Workflow.getProperty(foo,"['b']['f']['a']"),1);
assert.equal(Workflow.getProperty(foo,"b['f']['a']"),1);
assert.equal(Workflow.getProperty(foo,"b.f['a']"),1);
assert.equal(Workflow.getProperty(foo,"b.f.a"),1);
assert.equal(Workflow.getProperty(foo,"b.f'a']"),undefined);
assert.equal(Workflow.getProperty(foo,"b.f['a"),undefined);
assert.equal(Workflow.getProperty(foo,"['b']['g']['a']"),undefined);
assert.equal(Workflow.getProperty(foo,"['b']['f']['a'].k"),undefined);
assert.equal(Workflow.getProperty(foo,"['b']['f']['a'].toString"),undefined);
assert.equal(Workflow.getProperty(foo,"['foo bar']"),22);


/**
  Utility function to copy an object, primarly used by .with
  
  @static
  @method Hop.TestUtils.extendTo
**/
Workflow.extendTo=function(toObj,fromObj){
    if(toObj===undefined) return fromObj;

    var result = JSON.parse(JSON.stringify(toObj));
    
    var copyProps = function(toObj,fromObj){
      for(var propName in fromObj){
        var prop = fromObj[propName];
        if(propName.indexOf("-")===0 && prop===true){
          delete toObj[propName.substr(1)];
        } else if(prop!==null && typeof prop == "object" && typeof toObj[propName]=="object"){
          copyProps(toObj[propName],fromObj[propName]);  
        } else {
          toObj[propName]=prop; 
        }  
      }
    };
    
    copyProps(result,fromObj); 
    return result;
};

assert.deepEqual(Workflow.extendTo({foo:4, bar:8}, { "-foo":true, bar:12, zak:77}),{bar:12,zak:77});


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
  if(typeof object=="string" && checkSavedObjects===true){ 
    var res = context.loadValue(object);
    if(typeof res!=="undefined")
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
};

Workflow.with=function(context,args){
  var obj = args[0];

  if(!obj instanceof Array)
    throw new Error("args must be an array");

  for(var i=1;i<args.length;i++){
    if(typeof obj=='string'){ obj = context.loadValue(obj); }
    if(typeof args[i]=='string'){ args[i] = context.loadValue(args[i]); }
    obj = Workflow.extendTo(obj,args[i]);
  }
  obj = Workflow.resolve(context,obj,true);
  return obj;
};

if(typeof module!="undefined" && module.exports){
  module.exports=Workflow;
}


