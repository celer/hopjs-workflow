var Workflow = require('./lib/core');
require('./lib/chaos');
require('./lib/script');
require('./lib/task');
require('./lib/context');
require('./lib/tests');
require('./lib/nodejs');

var path = require('path');
Workflow.webJS = path.resolve(__dirname,"build/hopjs-wf.min.js");

module.exports=Workflow;
