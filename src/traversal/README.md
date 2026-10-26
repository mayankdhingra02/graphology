# Graphology Traversal

Miscellaneous traversal functions to be used with [`graphology`](https://graphology.github.io).

## Installation

```
npm install graphology-traversal
```

## Usage

- [bfs](#bfs)
- [bfsFromNode](#bfsfromnode)
- [dfs](#dfs)
- [dfsFromNode](#bfsfromnode)
- [pseudoDfs](#pseudodfs)
- [pseudoDfsFromNode](#pseudodfsfromnode)

### bfs

Perform a BFS (Breadth-First Search) over the given graph using a callback.

```js
import {bfs} from 'graphology-traversal';
// Alternatively, to only load the relevant code
import {bfs} from 'graphology-traversal/bfs';

bfs(graph, function (node, attr, depth) {
  console.log(node, attr, depth);
});

// Stopping at depth 3
bfs(graph, function (node, attr, depth) {
  return depth >= 3;
});
```

_Arguments_

- **graph** _Graph_: a graphology instance.
- **callback** _function_: iteration callback taking the traversed node, its attributes and the traversal's depth. Returning `true` will prevent the traversal from following the next neighbors.
- **options** _?object_: traversal options:
  - **mode** _?string_ [`outbound`]: type of neighbors to traverse.

### bfsFromNode

Perform a BFS (Breadth-First Search) over the given graph, starting from the given node, using a callback.

```js
import {bfsFromNode} from 'graphology-traversal';
// Alternatively, to only load the relevant code
import {bfsFromNode} from 'graphology-traversal/bfs';

bfsFromNode(graph, 'node1', function (node, attr, depth) {
  console.log(node, attr, depth);
});

// Stopping at depth 3
bfsFromNode(graph, 'node1', function (node, attr, depth) {
  return depth >= 3;
});
```

_Arguments_

- **graph** _Graph_: a graphology instance.
- **node** _string\|number_: starting node.
- **callback** _function_: iteration callback taking the traversed node, its attributes and the traversal's depth. Returning `true` will prevent the traversal from following the next neighbors.
- **options** _?object_: traversal options:
  - **mode** _?string_ [`outbound`]: type of neighbors to traverse.

### dfs

Perform a DFS (Depth-First Search) over the given graph using a callback.
Nodes are marked as visited when removed from the stack, so the reported depth
belongs to a depth-first traversal even when multiple pending paths reach the
same node. The dynamic stack can use O(V + E) space in the worst case. For the
previous O(V)-space stack traversal, see [pseudoDfs](#pseudodfs).

```js
import {dfs} from 'graphology-traversal';
// Alternatively, to only load the relevant code
import {dfs} from 'graphology-traversal/dfs';

dfs(graph, function (node, attr, depth) {
  console.log(node, attr, depth);
});

// Stopping at depth 3
dfs(graph, function (node, attr, depth) {
  return depth >= 3;
});
```

_Arguments_

- **graph** _Graph_: a graphology instance.
- **callback** _function_: iteration callback taking the traversed node, its attributes and the traversal's depth. Returning `true` will prevent the traversal from following the next neighbors.
- **options** _?object_: traversal options:
  - **mode** _?string_ [`outbound`]: type of neighbors to traverse.

### dfsFromNode

Perform a DFS (Depth-First Search) over the given graph, starting from the given node, using a callback.

```js
import {dfsFromNode} from 'graphology-traversal';
// Alternatively, to only load the relevant code
import {dfsFromNode} from 'graphology-traversal/dfs';

dfsFromNode(graph, 'node1', function (node, attr, depth) {
  console.log(node, attr, depth);
});

// Stopping at depth 3
dfsFromNode(graph, 'node1', function (node, attr, depth) {
  return depth >= 3;
});
```

_Arguments_

- **graph** _Graph_: a graphology instance.
- **node** _string\|number_: starting node.
- **callback** _function_: iteration callback taking the traversed node, its attributes and the traversal's depth. Returning `true` will prevent the traversal from following the next neighbors.
- **options** _?object_: traversal options:
  - **mode** _?string_ [`outbound`]: type of neighbors to traverse.

### pseudoDfs

Perform a space-efficient stack traversal over the given graph. This preserves
the previous `dfs` algorithm, which marks nodes as seen when adding them to the
stack. It visits every node once, but does not necessarily follow a true DFS
tree, so its callback does not expose a depth. The stack and seen set use O(V)
space. Like `dfs`, it takes O(V + E) time.

```js
import {pseudoDfs} from 'graphology-traversal';
// Alternatively, to only load the relevant code
import {pseudoDfs} from 'graphology-traversal/pseudo-dfs';

pseudoDfs(graph, function (node, attr) {
  console.log(node, attr);
});
```

_Arguments_

- **graph** _Graph_: a graphology instance.
- **callback** _function_: iteration callback taking the traversed node and its attributes. Returning `true` prevents following that node's neighbors.
- **options** _?object_: traversal options:
  - **mode** _?string_ [`outbound`]: type of neighbors to traverse.

### pseudoDfsFromNode

Perform the same space-efficient stack traversal, starting from the given node.
Only reachable nodes are traversed.

```js
import {pseudoDfsFromNode} from 'graphology-traversal';
// Alternatively, to only load the relevant code
import {pseudoDfsFromNode} from 'graphology-traversal/pseudo-dfs';

pseudoDfsFromNode(graph, 'node1', function (node, attr) {
  console.log(node, attr);
});
```

_Arguments_

- **graph** _Graph_: a graphology instance.
- **node** _string\|number_: starting node.
- **callback** _function_: iteration callback taking the traversed node and its attributes. Returning `true` prevents following that node's neighbors.
- **options** _?object_: traversal options:
  - **mode** _?string_ [`outbound`]: type of neighbors to traverse.
