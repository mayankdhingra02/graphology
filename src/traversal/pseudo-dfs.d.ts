import Graph, {Attributes} from 'graphology-types';
import {PseudoTraversalCallback, TraversalOptions} from './types';

export function pseudoDfs<N extends Attributes = Attributes>(
  graph: Graph<N>,
  callback: PseudoTraversalCallback<N>,
  options?: TraversalOptions
): void;
export function pseudoDfsFromNode<N extends Attributes = Attributes>(
  graph: Graph<N>,
  node: unknown,
  callback: PseudoTraversalCallback<N>,
  options?: TraversalOptions
): void;
