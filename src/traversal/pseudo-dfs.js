/**
 * Graphology Traversal Pseudo-DFS
 * =========================
 *
 * Space-efficient stack traversal function.
 */
var isGraph = require('graphology-utils/is-graph');
var DFSStack = require('graphology-indices/dfs-stack');
var utils = require('./utils');

var TraversalRecord = utils.TraversalRecord;
var capitalize = utils.capitalize;

/**
 * Pseudo-DFS traversal in the given graph using a callback function
 *
 * @param {Graph}    graph        - Target graph.
 * @param {string}   startingNode - Optional Starting node.
 * @param {function} callback     - Iteration callback.
 * @param {object}   options      - Options:
 * @param {string}     mode         - Traversal mode.
 */
function abstractPseudoDfs(graph, startingNode, callback, options) {
  options = options || {};

  if (!isGraph(graph))
    throw new Error(
      'graphology-traversal/pseudo-dfs: expecting a graphology instance.'
    );

  if (typeof callback !== 'function')
    throw new Error(
      'graphology-traversal/pseudo-dfs: given callback is not a function.'
    );

  // Early termination
  if (graph.order === 0) return;

  var stack = new DFSStack(graph);

  var forEachNeighbor =
    graph['forEach' + capitalize(options.mode || 'outbound') + 'Neighbor'].bind(
      graph
    );

  var forEachNode;

  if (startingNode === null) {
    forEachNode = stack.forEachNodeYetUnseen.bind(stack);
  } else {
    forEachNode = function (fn) {
      startingNode = '' + startingNode;
      fn(startingNode, graph.getNodeAttributes(startingNode));
    };
  }

  var record, stop;

  function visit(neighbor, attr) {
    stack.pushWith(neighbor, new TraversalRecord(neighbor, attr));
  }

  forEachNode(function (node, attr) {
    stack.pushWith(node, new TraversalRecord(node, attr));

    while (stack.size !== 0) {
      record = stack.pop();

      stop = callback(record.node, record.attributes);

      if (stop === true) continue;

      forEachNeighbor(record.node, visit);
    }
  });
}

exports.pseudoDfs = function (graph, callback, options) {
  return abstractPseudoDfs(graph, null, callback, options);
};
exports.pseudoDfsFromNode = abstractPseudoDfs;
