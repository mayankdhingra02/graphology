/**
 * Graphology Utils Unit Tests
 * ============================
 */
var assert = require('assert');
var Graph = require('graphology');
var mergeCycle = require('graphology-utils/merge-cycle');
var mergeStar = require('graphology-utils/merge-star');
var erdosRenyi = require('graphology-generators/random/erdos-renyi');
var pathGraph = require('graphology-generators/classic/path');
var seedrandom = require('seedrandom');

var lib = require('./index');
var bfs = lib.bfs;
var dfs = lib.dfs;

var dfsFromNode = lib.dfsFromNode;
var bfsFromNode = lib.bfsFromNode;
var pseudoDfs = lib.pseudoDfs;
var pseudoDfsFromNode = lib.pseudoDfsFromNode;

function recursiveDfs(graph, startingNode, mode, prune) {
  var seen = new Set();
  var traversal = [];

  function visit(node, depth) {
    if (seen.has(node)) return;

    seen.add(node);
    traversal.push([node, depth]);

    if (prune(node, depth) === true) return;

    var neighbors = graph[mode + 'Neighbors'](node);

    // Match the existing stack's last-neighbor-first tie order.
    for (var i = neighbors.length - 1; i >= 0; i--)
      visit(neighbors[i], depth + 1);
  }

  if (startingNode === null) {
    graph.forEachNode(function (node) {
      visit(node, 0);
    });
  } else {
    visit(startingNode, 0);
  }

  return traversal;
}

describe('graphology-traversal', function () {
  describe('dfs', function () {
    it('should throw if given invalid arguments.', function () {
      assert.throws(function () {
        dfs(null);
      }, /graph/);

      assert.throws(function () {
        dfs(new Graph(), null);
      }, /function/);
    });

    it('should traverse the graph correctly.', function () {
      var graph = new Graph();

      graph.mergeEdge(1, 2);
      graph.mergeEdge(1, 3);
      graph.mergeEdge(2, 4);
      graph.mergeEdge(4, 3);

      graph.addNode(5, {hello: 'world'});
      graph.mergeEdge(6, 7);
      graph.mergeEdge(7, 8);
      graph.mergeEdge(8, 6);

      var path = [];

      dfs(graph, function (node, attr) {
        if (node === '5') assert.deepStrictEqual(attr, {hello: 'world'});
        else assert.deepStrictEqual(attr, {});

        path.push(node);
      });

      assert.deepStrictEqual(path, ['1', '3', '2', '4', '5', '6', '7', '8']);
    });

    it('should work with cycles.', function () {
      var graph = new Graph();
      mergeCycle(graph, [1, 2, 3, 4, 5]);

      var path = [];

      dfs(graph, function (node) {
        path.push(node);
      });

      assert.deepStrictEqual(path, ['1', '2', '3', '4', '5']);
    });

    it('should iterate on every node.', function () {
      var graph = erdosRenyi.sparse(Graph.DirectedGraph, {
        order: 100,
        probability: 0.1
      });

      var path = [];

      dfs(graph, function (node) {
        path.push(node);
      });

      assert.deepStrictEqual(new Set(graph.nodes()), new Set(path));
    });

    it('should produce the expected results with trees.', function () {
      var graph = new Graph();

      graph.mergeEdge(1, 2);
      graph.mergeEdge(1, 3);
      graph.mergeEdge(2, 4);
      graph.mergeEdge(2, 5);
      graph.mergeEdge(3, 6);
      graph.mergeEdge(3, 7);

      var path = [];

      dfs(graph, function (node) {
        path.push(node);
      });

      assert.deepStrictEqual(path, ['1', '3', '7', '6', '2', '5', '4']);
    });

    it('should expose traversal depth.', function () {
      var graph = new Graph();
      mergeCycle(graph, [1, 2, 3, 4]);

      var path = [];

      dfs(graph, function (node, attr, depth) {
        path.push([node, depth]);
      });

      assert.deepStrictEqual(path, [
        ['1', 0],
        ['2', 1],
        ['3', 2],
        ['4', 3]
      ]);
    });

    it('should be possible to start from a given node.', function () {
      var graph = new Graph();
      mergeCycle(graph, [1, 2, 3, 4]);
      graph.addNode(5);

      var path = [];

      dfsFromNode(graph, 3, function (node, attr, depth) {
        path.push([node, depth]);
      });

      assert.deepStrictEqual(path, [
        ['3', 0],
        ['4', 1],
        ['1', 2],
        ['2', 3]
      ]);
    });

    it('should work when the graph has no edge.', function () {
      var graph = new Graph();

      graph.addNode('0');
      graph.addNode('1');

      var path = new Set();

      dfs(graph, function (node) {
        path.add(node);
      });

      assert.deepStrictEqual(path, new Set(['0', '1']));

      path = new Set();

      dfsFromNode(graph, '0', function (node) {
        path.add(node);
      });

      assert.deepStrictEqual(path, new Set(['0']));
    });

    it('should be possible to stop.', function () {
      var graph = pathGraph(Graph, 10);

      var path = [];

      dfsFromNode(graph, '0', function (node, attr, depth) {
        path.push(node);
        return depth >= 3;
      });

      assert.deepStrictEqual(path, ['0', '1', '2', '3']);
    });

    it('should be possible to change the traversal mode.', function () {
      var graph = pathGraph(Graph.DirectedGraph, 5);

      var path = [];

      dfsFromNode(
        graph,
        '2',
        function (node) {
          path.push(node);
        },
        {mode: 'inbound'}
      );

      assert.deepStrictEqual(path, ['2', '1', '0']);
    });

    it('should have a valid depth wrt DFS constraints (issue #481).', function () {
      var graph = new Graph.DirectedGraph();
      graph.addNode('1');
      graph.addNode('2');
      graph.addNode('3');
      graph.addDirectedEdge('1', '3');
      graph.addDirectedEdge('3', '2');
      graph.addDirectedEdge('1', '2');

      var traversal = [];

      dfsFromNode(graph, '1', function (node, attr, depth) {
        traversal.push([node, depth]);
      });

      assert.deepStrictEqual(traversal, [
        ['1', 0],
        ['3', 1],
        ['2', 2]
      ]);
    });

    it('should descend before backtracking in an undirected triangle.', function () {
      var graph = new Graph.UndirectedGraph();
      graph.mergeEdge('a', 'b');
      graph.mergeEdge('b', 'c');
      graph.mergeEdge('c', 'a');

      var path = [];
      dfsFromNode(graph, 'a', function (node, attr, depth) {
        path.push([node, depth]);
      });

      assert.deepStrictEqual(path, [
        ['a', 0],
        ['c', 1],
        ['b', 2]
      ]);
    });

    it('should handle a dense graph with many pending paths to the same node.', function () {
      var graph = new Graph.DirectedGraph();

      for (var i = 0; i < 80; i++) graph.addNode('n' + i);
      graph.forEachNode(function (source) {
        graph.forEachNode(function (target) {
          graph.addEdge(source, target);
        });
      });

      var depths = [];
      var seen = new Set();
      dfsFromNode(graph, 'n0', function (node, attr, depth) {
        assert(!seen.has(node));
        seen.add(node);
        depths.push(depth);
      });

      assert.strictEqual(seen.size, 80);
      assert.deepStrictEqual(
        depths,
        Array.from({length: 80}, function (_, depth) {
          return depth;
        })
      );
    });

    ['in', 'out', 'directed', 'undirected', 'inbound', 'outbound'].forEach(
      function (mode) {
        it(
          'should match recursive DFS and pruning in ' + mode + ' mode.',
          function () {
            var prunes = [
              function () {},
              function (node, depth) {
                return depth >= 2;
              },
              function (node) {
                return node === 'n3';
              }
            ];

            [0, 1, 2, 3, 4, 5, 6, 7].forEach(function (seed) {
              var rng = seedrandom('dfs-' + seed);
              var graph = new Graph.MultiGraph();

              var i;
              for (i = 0; i < 9; i++) graph.addNode('n' + i, {index: i});
              for (i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                  if (rng() < 0.25) graph.addDirectedEdge('n' + i, 'n' + j);
                  if (i <= j && rng() < 0.15)
                    graph.addUndirectedEdge('n' + i, 'n' + j);
                }
              }

              [null, 'n2'].forEach(function (start) {
                prunes.forEach(function (prune) {
                  var actual = [];
                  function callback(node, attr, depth) {
                    assert.strictEqual(attr, graph.getNodeAttributes(node));
                    actual.push([node, depth]);
                    return prune(node, depth);
                  }

                  if (start === null) dfs(graph, callback, {mode: mode});
                  else dfsFromNode(graph, start, callback, {mode: mode});

                  assert.deepStrictEqual(
                    actual,
                    recursiveDfs(graph, start, mode, prune)
                  );
                });
              });
            });
          }
        );
      }
    );
  });

  describe('pseudoDfs', function () {
    it('should preserve the space-efficient traversal without exposing depth.', function () {
      var graph = new Graph.UndirectedGraph();
      graph.mergeEdge('a', 'b');
      graph.mergeEdge('b', 'c');
      graph.mergeEdge('c', 'a');
      graph.addNode('isolated', {value: 1});

      var path = [];
      pseudoDfs(graph, function (node, attr) {
        assert.strictEqual(arguments.length, 2);
        assert.strictEqual(attr, graph.getNodeAttributes(node));
        path.push(node);
      });

      assert.deepStrictEqual(path, ['a', 'c', 'b', 'isolated']);
    });

    it('should support starting nodes, modes and branch pruning.', function () {
      var graph = pathGraph(Graph.DirectedGraph, 5);
      var path = [];

      pseudoDfsFromNode(
        graph,
        4,
        function (node) {
          path.push(node);
          return node === '2';
        },
        {mode: 'inbound'}
      );

      assert.deepStrictEqual(path, ['4', '3', '2']);
    });

    it('should preserve validation and empty graph behavior.', function () {
      assert.throws(function () {
        pseudoDfs(null);
      }, /graph/);
      assert.throws(function () {
        pseudoDfs(new Graph(), null);
      }, /function/);
      pseudoDfs(new Graph(), function () {
        assert.fail('Unexpected callback');
      });
      assert.throws(function () {
        pseudoDfsFromNode(pathGraph(Graph, 2), 'missing', function () {});
      }, /could not find/);
    });
  });

  describe('bfs', function () {
    it('should throw if given invalid arguments.', function () {
      assert.throws(function () {
        bfs(null);
      }, /graph/);

      assert.throws(function () {
        bfs(new Graph(), null);
      }, /function/);
    });

    it('should traverse the graph correctly.', function () {
      var graph = new Graph();
      mergeStar(graph, [1, 2, 3, 4]);
      mergeStar(graph, [2, 5, 6]);
      mergeStar(graph, [3, 7, 8]);
      graph.mergeEdge(4, 8);

      graph.addNode(9, {hello: 'world'});

      var path = [];

      bfs(graph, function (node, attr) {
        if (node === '9') assert.deepStrictEqual(attr, {hello: 'world'});
        else assert.deepStrictEqual(attr, {});

        path.push(node);
      });

      assert.deepStrictEqual(path, [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9'
      ]);

      var dfsPath = [];

      dfs(graph, function (node) {
        dfsPath.push(node);
      });

      assert.notDeepStrictEqual(path, dfsPath);
    });

    it('should iterate on every node.', function () {
      var graph = erdosRenyi.sparse(Graph.DirectedGraph, {
        order: 100,
        probability: 0.1
      });

      var path = [];

      bfs(graph, function (node) {
        path.push(node);
      });

      assert.deepStrictEqual(new Set(graph.nodes()), new Set(path));
    });

    it('should produce the expected results with trees.', function () {
      var graph = new Graph();

      graph.mergeEdge(1, 2);
      graph.mergeEdge(1, 3);
      graph.mergeEdge(2, 4);
      graph.mergeEdge(2, 5);
      graph.mergeEdge(3, 6);
      graph.mergeEdge(3, 7);

      var path = [];

      bfs(graph, function (node) {
        path.push(node);
      });

      assert.deepStrictEqual(path, ['1', '2', '3', '4', '5', '6', '7']);
    });

    it('should expose traversal depth.', function () {
      var graph = new Graph();
      mergeCycle(graph, [1, 2, 3, 4]);

      var path = [];

      bfs(graph, function (node, attr, depth) {
        path.push([node, depth]);
      });

      assert.deepStrictEqual(path, [
        ['1', 0],
        ['2', 1],
        ['3', 2],
        ['4', 3]
      ]);
    });

    it('should be possible to start from a given node.', function () {
      var graph = new Graph();
      mergeCycle(graph, [1, 2, 3, 4]);
      graph.addNode(5);

      var path = [];

      bfsFromNode(graph, 4, function (node, attr, depth) {
        path.push([node, depth]);
      });

      assert.deepStrictEqual(path, [
        ['4', 0],
        ['1', 1],
        ['2', 2],
        ['3', 3]
      ]);
    });

    it('should work when the graph has no edge.', function () {
      var graph = new Graph();

      graph.addNode('0');
      graph.addNode('1');

      var path = new Set();

      bfs(graph, function (node) {
        path.add(node);
      });

      assert.deepStrictEqual(path, new Set(['0', '1']));

      path = new Set();

      bfsFromNode(graph, '0', function (node) {
        path.add(node);
      });

      assert.deepStrictEqual(path, new Set(['0']));
    });

    it('should be possible to stop.', function () {
      var graph = new Graph();

      graph.mergeEdge(0, 1);
      graph.mergeEdge(1, 2);
      graph.mergeEdge(0, 2);
      graph.mergeEdge(2, 3);
      graph.mergeEdge(3, 4);
      graph.mergeEdge(3, 5);
      graph.mergeEdge(4, 6);

      var path = new Set();

      bfsFromNode(graph, '0', function (node, attr, depth) {
        path.add(node);
        return depth > 1;
      });

      assert.deepStrictEqual(path, new Set(['0', '1', '2', '3']));
    });

    it('should be possible to change the traversal mode.', function () {
      var graph = pathGraph(Graph.DirectedGraph, 5);

      var path = [];

      bfsFromNode(
        graph,
        '2',
        function (node) {
          path.push(node);
        },
        {mode: 'inbound'}
      );

      assert.deepStrictEqual(path, ['2', '1', '0']);
    });
  });
});
