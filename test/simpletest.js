Hop.defineTestCase("Simple Test",function(test){

  test.default("url","http://localhost:3000/");
  test.demand("url","URL of the service");

  test.use("#{url}");

  test.do("CounterService.create").with({ name:"foo", expand:true }).errorIsNull().saveOutputAs("counter");
  
  test.get("#{counter.href}").noError().hasStatusCode(200).headerContains("Connection","keep-alive");

  test.do("CounterService.delete").with({name:"foo"});
});
