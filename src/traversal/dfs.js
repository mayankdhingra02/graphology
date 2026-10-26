/**
 * Graphology Traversal DFS
 * =========================
 *
 * Depth-First Search traversal function.
 */
var isGraph = require('graphology-utils/is-graph');
var utils = require('./utils');

var TraversalRecord = utils.TraversalRecord;
var capitalize = utils.capitalize;

/**
 * DFS traversal in the given graph using a callback function
 *
 * @param {Graph}    graph        - Target graph.
 * @param {string}   startingNode - Optional Starting node.
 * @param {function} callback     - Iteration callback.
 * @param {object}   options      - Options:
 * @param {string}     mode         - Traversal mode.
 */
function abstractDfs(graph, startingNode, callback, options) {
  options = options || {};

  if (!isGraph(graph))
    throw new Error(
      'graphology-traversal/dfs: expecting a graphology instance.'
    );

  if (typeof callback !== 'function')
    throw new Error(
      'graphology-traversal/dfs: given callback is not a function.'
    );

  // Early termination
  if (graph.order === 0) return;

  // Pending paths can share a node until that node is actually visited.
  var stack = [];
  var seen = new Set();

  var forEachNeighbor =
    graph['forEach' + capitalize(options.mode || 'outbound') + 'Neighbor'].bind(
      graph
    );

  var forEachNode;

  if (startingNode === null) {
    forEachNode = graph.forEachNode.bind(graph);
  } else {
    forEachNode = function (fn) {
      startingNode = '' + startingNode;
      fn(startingNode, graph.getNodeAttributes(startingNode));
    };
  }

  var record, stop;

  function visit(neighbor, attr) {
    if (!seen.has(neighbor))
      stack.push(new TraversalRecord(neighbor, attr, record.depth + 1));
  }

  forEachNode(function (node, attr) {
    if (seen.has(node)) return;

    stack.push(new TraversalRecord(node, attr, 0));

    while (stack.length !== 0) {
      record = stack.pop();

      if (seen.has(record.node)) continue;

      seen.add(record.node);
      stop = callback(record.node, record.attributes, record.depth);

      if (stop === true) continue;

      forEachNeighbor(record.node, visit);
    }
  });
}

exports.dfs = function (graph, callback, options) {
  return abstractDfs(graph, null, callback, options);
};
exports.dfsFromNode = abstractDfs;
