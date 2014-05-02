

Workflow.msg=function(msg,options){
  options=options||{};
  with(options){
    return msg.replace(/#{([A-Za-z0-9\.\_]+)}/g,function(m,m1,m2){
      var r = eval(m1);
      if(typeof r=="object") return JSON.stringify(r);
      else return r;
    });
  }
};

Workflow.pass=function(msg,options){
  return { result:true, msg:Workflow.msg(msg,options)};
};

Workflow.fail=function(msg,options){
  return { result:false, msg:Workflow.msg(msg,options)};
};

Workflow.utils={};

/**
  Test to insure that all the input object properties are the same as the output object properties

  * The output object may have more properties then are in the input object
  * The output object must have all of the same properties, with the same value as the input object

  *This function is designed to be usable with (function).toString() for embedding*

  @param {object} input The input object
  @param {object} output The output object

  @method Hop.TestUtils.objectCovers
  @static
**/
Workflow.utils.objectCovers=function(input,output){
  var res;
  var recurse=function(input,output){
    if(typeof input!=typeof output){
      return false;
    } else {
      if(input instanceof Array){
        for(var i in input){
          var found=false;
          for(var j in output){
            if(recurse(input[i],output[j])){
              found=true;
            }
          }
          if(!found){
            return false;      
          }
        }
        return true;
      } else if(typeof input=="object") {
        for(var inputProp in input){
          if(input!==null && output===null)
            return false;
          else if(typeof input[inputProp]!=typeof output[inputProp])
            return false;
          if(input[inputProp] instanceof Array){
            res = recurse(input[inputProp],output[inputProp]);
            if(res===false)
              return false;
          } else if(typeof input[inputProp]==="object"){
            res = recurse(input[inputProp],output[inputProp]);
            if(res===false)
              return false;
          } else if(input[inputProp]!==output[inputProp])
            return false;
        }
        return true; 
      } else {
        return (input===output);
      }
    }
  };
  return recurse(input,output);  
};

Workflow.utils.getProperty=function(object,property){
  if(object===null || object===undefined) return undefined;
  with(object){
    try {
      return eval(property);
    } catch(e){
      return undefined;
    }
  }
};

Workflow.utils.arrayContains=function(array,value){
  if(array instanceof Array){
    for(var i in array){
      if(Workflow.utils.objectCovers(value,array[i]))
        return true;
    }
  }
  return false;
};

assert.equal(Workflow.utils.objectCovers([1,2,3,4],[1,2,3,4,5]),true);
assert.equal(Workflow.utils.objectCovers([1,2,3,4],[1,2,4,5]),false);
assert.equal(Workflow.utils.objectCovers("hello","hello"),true);
assert.equal(Workflow.utils.objectCovers({a:1},{a:1}),true);
assert.equal(Workflow.utils.objectCovers({a:1},{b:1}),false);
assert.equal(Workflow.utils.objectCovers({a:1,b:1},{a:1,b:1,c:3}),true);
assert.equal(Workflow.utils.objectCovers({a:1, b:{ k:3} },{a:1, b:{ k:3}}),true);
assert.equal(Workflow.utils.objectCovers({a:1, b:{ k:3} },{a:1, b:{ k:8}}),false);
assert.equal(Workflow.utils.objectCovers({a:1, b:{ k:3}, complex: [ 1, '3','A',{ a:1 },{ b:5, c:[1,2,3,'5']}]}, {a:1, b:{ k:3}, complex: [ 1, '3','A',{ a:1 },{ b:5, c:[1,2,3,'5']}]}),true);
assert.equal(Workflow.utils.objectCovers({a:1, b:{ k:3}, complex: [ 1, '3','A',{ a:1 },{ b:5, c:[1,2,3,'5']}]}, {a:1, b:{ k:3} }),false);
assert.equal(Workflow.utils.objectCovers({a:1, b:{ k:3}, complex: [ 1, '3','A',{ a:1 },{ b:5, c:[1,2,3,'5']}]}, {a:1, b:{ k:3}, complex: [ 1, '3','A',{ a:1 },{ b:5, c:[1,2,3]}]}),false);

assert.equal(Workflow.utils.objectCovers([ { name:'foo' }, {name:'bar',roles:['a','b','c'], thing:{ a:1, b:2}}], [ { name:'foo' }, {name:'bar',roles:['a','b','c'], thing:{ a:1, b:2}}]),true);
assert.equal(Workflow.utils.objectCovers([ { name:'foo' }, {name:'bar',roles:['a','b','c'], thing:{ a:1, b:2}}], [ { name:'foo' }, {name:'bar',roles:['a','b','c'], thing:{ a:1, b:5}}]),false);
assert.equal(Workflow.utils.objectCovers([ { name:'foo' }, {name:'bar',roles:['a','b','c'], thing:{ a:1, b:2}}], [{name:'bar',roles:['a','b','c'], thing:{ a:1, b:5}}]),false);

Workflow.Tests={};

Workflow.Tests.errorContains=function(input,output,error,options,context){
  if(context){
    options=JSON.parse(JSON.stringify(options));
    options.value = Workflow.resolve(context,options.value,true);
  }  
  if(error!==null){
    if(typeof error==="string") 
      if(error.indexOf(options.value)!=-1) return Workflow.pass("The error contained '#{value}'",options);
      if(Workflow.utils.objectCovers(options.value,error)) return Workflow.pass("The error contained '#{value}'",options);
      return Workflow.fail("The error did not contain '#{value}'",options);
  } return Workflow.fail("There was no error"); 
};

assert.deepEqual(Workflow.Tests.errorContains(null,null,null,{value: "ERROR"}),{ result:false, msg:"There was no error" });
assert.deepEqual(Workflow.Tests.errorContains(null,null,"ERROR",{value: "ERROR"}),{ result:true, msg:"The error contained 'ERROR'"});
assert.deepEqual(Workflow.Tests.errorContains(null,null,{ what:"ERROR" },{value: { what:"ERROR"} }),{"result":true,"msg":"The error contained '{\"what\":\"ERROR\"}'"});
assert.deepEqual(Workflow.Tests.errorContains(null,null,"ERR",{value: "ERROR"}),{ result:false, msg:"The error did not contain 'ERROR'"});


Workflow.Tests.errorIsNull=function(input,output,err,options){
  if(err===null)
    return Workflow.pass("The error was null");
  else return Workflow.fail("The error was not null");
};

assert.deepEqual(Workflow.Tests.errorIsNull(null,null,null),{result:true,msg:"The error was null"});
assert.deepEqual(Workflow.Tests.errorIsNull(null,null,true),{result:false,msg:"The error was not null"});

Workflow.Tests.errorIsNotNull=function(input,output,err,options){
  if(err===null)
    return Workflow.fail("The error was null");
  else return Workflow.pass("The error was not null");
};

assert.deepEqual(Workflow.Tests.errorIsNotNull(null,null,null),{result:false,msg:"The error was null"});
assert.deepEqual(Workflow.Tests.errorIsNotNull(null,null,true),{result:true,msg:"The error was not null"});


Workflow.Tests.outputIsNull=function(input,output,err,options){
  if(output===null)
    return Workflow.pass("The output was null");
  else return Workflow.fail("The output was not null");
};

assert.deepEqual(Workflow.Tests.outputIsNull(null,null),{result:true,msg:"The output was null"});
assert.deepEqual(Workflow.Tests.outputIsNull(null,true),{result:false,msg:"The output was not null"});

Workflow.Tests.outputIsNotNull=function(input,output,err,options){
  if(err===null)
    return Workflow.fail("The output was null");
  else return Workflow.pass("The output was not null");
};

assert.deepEqual(Workflow.Tests.outputIsNotNull(null,null,null),{result:false,msg:"The output was null"});
assert.deepEqual(Workflow.Tests.outputIsNotNull(null,null,true),{result:true,msg:"The output was not null"});

Workflow.Tests.outputContains=function(input,output,err,options,context){
  if(context){
    options=JSON.parse(JSON.stringify(options));
    options.value = Workflow.resolve(context,options.value,true);
  }  
  if(Workflow.utils.objectCovers(options.value, output)) return Workflow.pass("The output contained '#{value}'",options);
  return Workflow.fail("The output did not contain '#{value}'",options);
};

assert.deepEqual(Workflow.Tests.outputContains(null,null,null,{ value: null }),{ result:true, msg:"The output contained 'null'"});
assert.deepEqual(Workflow.Tests.outputContains(null,"hello",null,{ value: null }),{ result:false, msg:"The output did not contain 'null'"});
assert.deepEqual(Workflow.Tests.outputContains(null,"wolf",null,{ value: "wolf" }),{ result:true, msg:"The output contained 'wolf'"});
assert.deepEqual(Workflow.Tests.outputContains(null,{a:1, b:2 },null,{ value: {a:1} }),{ result:true, msg:"The output contained '{\"a\":1}'"});

Workflow.Tests.outputDoesNotContain=function(input,output,err,options,context){
  if(context){
    options=JSON.parse(JSON.stringify(options));
    options.value = Workflow.resolve(context,options.value,true);
  }  
  if(!Workflow.utils.objectCovers(options.value, output)) return Workflow.pass("The output did not contain '#{value}'",options);
  return Workflow.fail("The output contained '#{value}'",options);
};

assert.deepEqual(Workflow.Tests.outputDoesNotContain(null,null,null,{ value: null }),{ result:false, msg:"The output contained 'null'"});
assert.deepEqual(Workflow.Tests.outputDoesNotContain(null,"hello",null,{ value: null }),{ result:true, msg:"The output did not contain 'null'"});
assert.deepEqual(Workflow.Tests.outputDoesNotContain(null,"wolf",null,{ value: "wolf" }),{ result:false, msg:"The output contained 'wolf'"});
assert.deepEqual(Workflow.Tests.outputDoesNotContain(null,{a:1, b:2 },null,{ value: {a:1} }),{ result:false, msg:"The output contained '{\"a\":1}'"});

Workflow.Tests.outputIsArray=function(input,output,err,options){
  if(output instanceof Array)
    return Workflow.pass("The output was an array");
  else return Workflow.fail("The output was not an array"); 
};

assert.deepEqual(Workflow.Tests.outputIsArray(null,[],null,null), { result:true, msg:"The output was an array"});
assert.deepEqual(Workflow.Tests.outputIsArray(null,null,null,null), { result:false, msg:"The output was not an array"});

Workflow.Tests.arrayContains=function(input,output,err,options,context){
  if(context){
    options=JSON.parse(JSON.stringify(options));
    options.value = Workflow.resolve(context,options.value,true);
  }  
  if(output!==null){
    var p = Workflow.utils.getProperty(output,options.property);
    if(p instanceof Array){
      if(Workflow.utils.arrayContains(p,options.value))
        return Workflow.pass("The array property '#{property}' contained '#{value}'",options);
      return Workflow.fail("The array property '#{property}' did not contain '#{value}'",options);
    } 
    return Workflow.fail("The array property '#{property}' was not an array",options);
  }
  return Workflow.fail("The output was null");
};

assert.deepEqual(Workflow.Tests.arrayContains(null,null,null, { property:"foo", value: 1 }),{"result":false,"msg":"The output was null"});
assert.deepEqual(Workflow.Tests.arrayContains(null,{ foo: null } ,null, { property:"foo", value: 1 }),{"result":false,"msg":"The array property 'foo' was not an array"});
assert.deepEqual(Workflow.Tests.arrayContains(null,{foo:[1]},null, { property:"foo", value: 1 }),{"result":true,"msg":"The array property 'foo' contained '1'"});
assert.deepEqual(Workflow.Tests.arrayContains(null,{foo:[3,4,6,"s", null, 1]},null, { property:"foo", value: 1 }),{"result":true,"msg":"The array property 'foo' contained '1'"});
assert.deepEqual(Workflow.Tests.arrayContains(null,{foo: { bar:[3,4,6,"s", null, 1]}},null, { property:"foo.bar", value: 1 }),{"result":true,"msg":"The array property 'foo.bar' contained '1'"});
assert.deepEqual(Workflow.Tests.arrayContains(null,{foo:[2]},null, { property:"foo", value: 1 }),{"result":false,"msg":"The array property 'foo' did not contain '1'"});

Workflow.Tests.arrayLengthIs=function(input,output,err,options,context){
  if(context){
    options=JSON.parse(JSON.stringify(options));
    options.min = Workflow.resolve(context,options.min,true);
    options.max = Workflow.resolve(context,options.max,true);
  }  
  if(output===null)
    return Workflow.fail("The output was null");
  var p = Workflow.utils.getProperty(output,options.property);
  if(p instanceof Array){
    if(typeof options.min!="undefined" && p.length<options.min) return Workflow.fail("The array '#{property}' length was < #{min}",options);
    if(typeof options.max!="undefined" && p.length>options.max) return Workflow.fail("The array '#{property}' length was > #{max}",options);
    if(typeof options.min!="undefined" && typeof options.max!="undefined")
      return Workflow.pass("The array '#{property}' length was between #{min} and #{max}",options);
    if(typeof options.min!="undefined")
      return Workflow.pass("The array '#{property}' length was > #{min}",options);
    if(typeof options.max!="undefined")
      return Workflow.pass("The array '#{property}' length was < #{max}",options);
  } return Workflow.fail("The property #{property} is not an array",options);
};

assert.deepEqual(Workflow.Tests.arrayLengthIs(null,null,null, { property:"foo", value: 1 }),{"result":false,"msg":"The output was null"});
assert.deepEqual(Workflow.Tests.arrayLengthIs(null,{ foo: [1,2,3,4,5]}, null, { property: "foo", min:1 }),{"result":true,"msg":"The array 'foo' length was > 1"});
assert.deepEqual(Workflow.Tests.arrayLengthIs(null,{ foo: [1,2,3,4,5]}, null, { property: "foo", min:10 }),{"result":false,"msg":"The array 'foo' length was < 10"});
assert.deepEqual(Workflow.Tests.arrayLengthIs(null,{ foo: [1,2,3,4,5]}, null, { property: "foo", max:1 }),{"result":false,"msg":"The array 'foo' length was > 1"});
assert.deepEqual(Workflow.Tests.arrayLengthIs(null,{ foo: [1,2,3,4,5]}, null, { property: "foo", max:10 }),{"result":true,"msg":"The array 'foo' length was < 10"});
assert.deepEqual(Workflow.Tests.arrayLengthIs(null,{ foo: [1,2,3,4,5]}, null, { property: "foo", min:1, max:10 }),{"result":true,"msg":"The array 'foo' length was between 1 and 10"});

Workflow.Tests.arrayDoesntContain=function(input,output,err,options,context){
  if(context){
    options=JSON.parse(JSON.stringify(options));
    options.value = Workflow.resolve(context,options.value,true);
  }  
  if(output!==null){
    var p = Workflow.utils.getProperty(output,options.property);
    if(p instanceof Array){
      if(!Workflow.utils.arrayContains(p,options.value))
        return Workflow.pass("The array property '#{property}' did not contain '#{value}'",options);
      return Workflow.fail("The array property '#{property}' contained '#{value}'",options);
    } 
    return Workflow.fail("The array property '#{property}' was not an array",options);
  }
  return Workflow.fail("The output was null");
};

assert.deepEqual(Workflow.Tests.arrayDoesntContain(null,null,null, { property:"foo", value: 1 }),{"result":false,"msg":"The output was null"});
assert.deepEqual(Workflow.Tests.arrayDoesntContain(null,{ foo: null } ,null, { property:"foo", value: 1 }),{"result":false,"msg":"The array property 'foo' was not an array"});
assert.deepEqual(Workflow.Tests.arrayDoesntContain(null,{foo:[1]},null, { property:"foo", value: 1 }),{"result":false,"msg":"The array property 'foo' contained '1'"});
assert.deepEqual(Workflow.Tests.arrayDoesntContain(null,{foo:[3,4,6,"s", null, 1]},null, { property:"foo", value: 1 }),{"result":false,"msg":"The array property 'foo' contained '1'"});
assert.deepEqual(Workflow.Tests.arrayDoesntContain(null,{foo: { bar:[3,4,6,"s", null, 1]}},null, { property:"foo.bar", value: 1 }),{"result":false,"msg":"The array property 'foo.bar' contained '1'"});
assert.deepEqual(Workflow.Tests.arrayDoesntContain(null,{foo:[2]},null, { property:"foo", value: 1 }),{"result":true,"msg":"The array property 'foo' did not contain '1'"});

Workflow.Tests.propertyIsNull=function(input,output,err,options,context){
  if(output){
    var value = Workflow.utils.getProperty(output,options.property);
    if(value===null)
      return Workflow.pass("The property '#{property}' was null",options);
    else return Workflow.fail("The property '#{property}' was not null",options);
  } else return Workflow.fail("The output was null",options);
};

assert.deepEqual(Workflow.Tests.propertyIsNull(null,{foo:"hello"},null,{property:"foo"}),{result:false, msg:"The property 'foo' was not null"});
assert.deepEqual(Workflow.Tests.propertyIsNull(null,{foo:null},null,{property:"foo"}),{result:true, msg:"The property 'foo' was null"});
assert.deepEqual(Workflow.Tests.propertyIsNull(null,null,null,{property:"foo"}),{result:false, msg:"The output was null"});

Workflow.Tests.propertyIsNotNull=function(input,output,err,options,context){
  if(output){
    var value = Workflow.utils.getProperty(output,options.property);
    if(value!==null)
      return Workflow.pass("The property '#{property}' was not null",options);
    else return Workflow.fail("The property '#{property}' was null",options);
  } else return Workflow.fail("The output was null",options);
};

assert.deepEqual(Workflow.Tests.propertyIsNotNull(null,{foo:"hello"},null,{property:"foo"}),{result:true, msg:"The property 'foo' was not null"});
assert.deepEqual(Workflow.Tests.propertyIsNotNull(null,{foo:null},null,{property:"foo"}),{result:false, msg:"The property 'foo' was null"});
assert.deepEqual(Workflow.Tests.propertyIsNotNull(null,null,null,{property:"foo"}),{result:false, msg:"The output was null"});

Workflow.Tests.propertyContains=function(input,output,err,options,context){
  if(output){
    if(context){
      options=JSON.parse(JSON.stringify(options));
      options.value = Workflow.resolve(context,options.value,true);
    }
    var testValue = Workflow.utils.getProperty(output,options.property);
    if(Workflow.utils.objectCovers(options.value,testValue)) return Workflow.pass("The property '#{property}' contained '#{value}'",options);
    return Workflow.fail("The property '#{property}' did not contain '#{value}'",options);
  } else return Workflow.fail("The output was null",options);
};

assert.deepEqual(Workflow.Tests.propertyContains(null,{foo:"hello"},null,{property:"foo", value:"hello"}),{result:true, msg:"The property 'foo' contained 'hello'"});
assert.deepEqual(Workflow.Tests.propertyContains(null,{foo:"hello"},null,{property:"foo", value:"goodbye"}),{result:false, msg:"The property 'foo' did not contain 'goodbye'"});
assert.deepEqual(Workflow.Tests.propertyContains(null,null,null,{property:"foo"}),{result:false, msg:"The output was null"});

Workflow.Tests.propertyDoesntContain=function(input,output,err,options,context){
  if(output){
    if(context){
      options=JSON.parse(JSON.stringify(options));
      options.value = Workflow.resolve(context,options.value,true);
    }
    var testValue = Workflow.utils.getProperty(output,options.property);
    if(!Workflow.utils.objectCovers(options.value,testValue)) return Workflow.fail("The property '#{property}' contained '#{value}'",options);
    return Workflow.pass("The property '#{property}' did not contain '#{value}'",options);
  } else return Workflow.fail("The output was null",options);
};

assert.deepEqual(Workflow.Tests.propertyDoesntContain(null,{foo:"hello"},null,{property:"foo", value:"hello"}),{result:true, msg:"The property 'foo' did not contain 'hello'"});
assert.deepEqual(Workflow.Tests.propertyDoesntContain(null,{foo:"hello"},null,{property:"foo", value:"goodbye"}),{result:false, msg:"The property 'foo' contained 'goodbye'"});
assert.deepEqual(Workflow.Tests.propertyDoesntContain(null,null,null,{property:"foo"}),{result:false, msg:"The output was null"});

Workflow.Tests.propertyIsArray=function(input,output,err,options,context){
  if(output){
    var testValue = Workflow.utils.getProperty(output,options.property);
    if(testValue instanceof Array) return Workflow.pass("The property '#{property}' was an array",options);
    return Workflow.fail("The property '#{property}' was not an array",options);
  } else return Workflow.fail("The output was null",options);
};

assert.deepEqual(Workflow.Tests.propertyIsArray(null,{foo:["hello"]},null,{property:"foo"}),{result:true, msg:"The property 'foo' was an array"});
assert.deepEqual(Workflow.Tests.propertyIsArray(null,{foo:"hello"},null,{property:"foo"}),{result:false, msg:"The property 'foo' was not an array"});
assert.deepEqual(Workflow.Tests.propertyIsArray(null,null,null,{property:"foo"}),{result:false, msg:"The output was null"});


Workflow.Tests.saveOutputAs=function(input,output,err,options,context){
  if(!err){
      context.saveValue(options.name,output);
      return Workflow.pass("The result was saved as '#{name}'",options);
  }
  return Workflow.fail("The value was not saved, because an error occured");
};

Workflow.Tests.savePropertyAs=function(input,output,err,options,context){
  if(!err){
    var value = Workflow.utils.getProperty(output,options.property);
    context.saveValue(options.name,value);
    return Workflow.pass("The property '#{property}' was saved as '#{name}'",options);
  }
  return Workflow.fail("The value was not saved, because an error occured");
};

Workflow.Tests.outputEval=function(input,output,err,options,context){
  if(!err){
    if(typeof options.eval == "function")
      options.eval = options.eval.toString();  
    
    options = JSON.parse(JSON.stringify(options));
      
    options.eval = new Function("return ("+options.eval+")");
    var res = options.eval()(err,output,context);
    if(res===true) return Workflow.pass("The evaluation function returned true");
    else return Workflow.fail("The evaluation function did not return true, it returned '#{result}'",{result:res});
  }
  return Workflow.fail("The output was null");
};

assert.deepEqual(Workflow.Tests.outputEval(null,null,null, { eval: "function(){ return true; }"}),{ result: true, msg:"The evaluation function returned true"});
assert.deepEqual(Workflow.Tests.outputEval(null,null,null, { eval: "function(){ return false; }"}),{ result: false, msg:"The evaluation function did not return true, it returned 'false'"});

Workflow.Tests.headerContains=function(input,output,err,options,context,response){
  if(response){
    var val;
    if(response.getResponseHeader){
      val = response.getResponseHeader(options.header);
    } else if(response.getHeader){
      val = response.getHeader(options.header);
    } else if(response.get){
      val = response.get(options.header);
    } else if(response.headers){
      val = response.headers[options.header] || response.headers[options.header.toLowerCase()];
    } else {
      return Workflow.fail("Unable to retrieve HTTP headers");
    }
    if(!val) return Workflow.fail("There was no header '#{header}' in the response",options);
    if(val.indexOf(options.value)!=-1) return Workflow.pass("The header '#{header}' contained '#{value}'",options);
    return Workflow.fail("The header '#{header}' did not contain '#{value}'",options); 
  } else { 
    return Workflow.fail("No HTTP headers were available");
  }
};

Workflow.Tests.hasStatusCode=function(input,output,err,options,context,response){
  if(response){
    var val;
    if(typeof response.status!="undefined")
      val = response.status;
    else if(typeof response.statusCode!="undefined")
      val = response.statusCode;
    else {
      return Workflow.fail("Unable to retrieve status code");
    } 
    if(val==options.statusCode)
      return Workflow.pass("The response had a status of #{statusCode}",options);
    else return Workflow.fail("The response did not have a status code of #{statusCode}",options);
  } else { 
    return Workflow.fail("No HTTP status code was available");
  }

};

Workflow.Tests.inputSameAsOutput=function(input,output,err,options,context,response){
  if(err)
    return Workflow.fail("There was an error");
  if(input===null && output!==input)
    return Workflow.fail("The input was null, and the output was not");
  if(Workflow.utils.objectCovers(input,output)){
    return Workflow.pass("The output contains the input");
  } else return Workflow.fail("The output does not contain the input");

};

assert.deepEqual(Workflow.Tests.inputSameAsOutput({ foo: 7},{ foo: 7}),{ result:true, msg:"The output contains the input"});
assert.deepEqual(Workflow.Tests.inputSameAsOutput({ foo: 7},{ foo: 8}),{ result:false, msg:"The output does not contain the input"});
assert.deepEqual(Workflow.Tests.inputSameAsOutput({ foo: 7},null),{ result:false, msg:"The output does not contain the input"});
assert.deepEqual(Workflow.Tests.inputSameAsOutput(null,{ foo: 7}),{ result:false, msg:"The input was null, and the output was not"});
assert.deepEqual(Workflow.Tests.inputSameAsOutput(null,null),{ result:true, msg:"The output contains the input"});




