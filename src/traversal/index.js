var bfsModule = require('./bfs.js');
var dfsModule = require('./dfs.js');
var pseudoDfsModule = require('./pseudo-dfs.js');

exports.bfs = bfsModule.bfs;
exports.bfsFromNode = bfsModule.bfsFromNode;
exports.dfs = dfsModule.dfs;
exports.dfsFromNode = dfsModule.dfsFromNode;
exports.pseudoDfs = pseudoDfsModule.pseudoDfs;
exports.pseudoDfsFromNode = pseudoDfsModule.pseudoDfsFromNode;
