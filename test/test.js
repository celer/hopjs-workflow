defineScript("BasicTest",function(test){

  test.default("url","http://localhost:3000/");
  test.demand("url","URL of the service");

  test.use("#{url}");

  test.do("CounterService.create").with({ name:"foo", expand:true }).errorIsNull();

  test.times(5,function(test){
    test.do("CounterService.increment").with({ name:"foo"}).saveOutputAs("result");
  });

  test.do("CounterService.read").with({name:"foo"}).outputContains("result").outputContains({ count:5});
  test.do("CounterService.delete").with({name:"foo"});
  test.do("CounterService.read").with({ name:"foo"}).outputIsNull().errorIsNull();

  test.do("CounterService.create").with({ name:"foo", expand:true });
  test.until("CounterService.increment",100).with({name:"foo"}).outputContains({count:10});
  test.do("CounterService.read").with({ name:"foo"}).outputContains({count:10});
  test.do("CounterService.delete").with({name:"foo"});

  test.wait(1000);

  test.do("CounterService.create").with({ name:"a", expand:true },{name:"b"}).saveOutputAs("counterB");
  test.do("CounterService.increment").with("counterB").outputContains({count:1});
  test.do("CounterService.increment").with({ name:"#{counterB.name}"}).outputContains({count:2});

  test.do("CounterService.create").with({ name:"a", expand:true });
  test.do("CounterService.create").with({ name:"b", expand:true });
  test.do("CounterService.create").with({ name:"c", expand:true });
  test.do("CounterService.create").with({ name:"d", expand:true });

  test.do("CounterService.list").savePropertyAs("items","counters");


  test.forEach("counters","index","counter",function(test1){
    test1.do("CounterService.delete").with("counter");
  });

  test.do("CounterService.list").arrayLengthIs("items",0,0);

  test.do("CounterService.create").onError(function(){
    test.do("CounterService.create").with({name:"bob"}).errorIsNull().saveOutputAs("bob").onSuccess(function(){
      test.do("CounterService.delete").with("bob").errorIsNull();
    });
  });

  test.wait(1000);

  test.forEach(["A","B","C","D"],"index","value",function(test){
    test.do("CounterService.create").with({name:"#{value}"}).errorIsNull();
  });

  test.forEach({ a1:3, b1:2, c1:1 },"index","value",function(test){
    test.do("CounterService.create").with({name:"#{index}"});
    test.until("CounterService.increment",100).with({ name:"#{index}"}).outputContains({count:"#{value}"});
  });

  test.forEach({ a1:3, b1:2, c1:1 },"index","value",function(test){
    test.do("CounterService.read").with({},{name:"#{index}"}).outputContains({count:"#{value}"});
    test.do("CounterService.delete").with({ name:"#{index}"}).errorIsNull();
  });

  test.do("MockService.mirrorInput").with({ value:{}}, { value: { a: { b: 6}}}).outputContains({ a: { b: 6 }});
  test.do("MockService.mirrorInput").with("FOO",{ value:{}}, { value: { a: { b: 6}}}).outputContains({ a: { b: 6 }});

  test.do("MockService.delay").with({delay:1000}).async("asyncTest").saveOutputAs("async1");
  test.do("MockService.delay").with({delay:1400}).async("asyncTest").saveOutputAs("async2");
  test.do("MockService.delay").with({delay:4400}).async("asyncTest").saveOutputAs("async3");

  test.do("MockService.now").saveOutputAs("now");

  test.asyncWait("asyncTest");

  test.do("MockService.now").outputEval("function(err,output,context){ var async3 = context.loadValue('async3'); return output.now > async3.now; }");

  test.do("CounterService.create").with({ name:"wolf"}).errorIsNull().saveOutputAs("wolf");

  test.get("#{url}api/counter/#{wolf.name}").outputContains({ name:"wolf"});

  test.post("#{url}api/counter/").with({ name:"kitten"}).outputContains({ name:"kitten" }).saveOutputAs("kittenHref");

  test.get("#{kittenHref.href}").outputContains({name:"kitten"});

  test.put("#{kittenHref.href}").with({count:10}).outputContains({name:"kitten",count:10});

  test.get("#{kittenHref.href}").outputContains({name:"kitten",count:10});

  test.delete("#{kittenHref.href}").errorIsNull();

  test.get("#{kittenHref.href}").errorContains("Not found");

  test.do("TestService.exit");

});
