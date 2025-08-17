import { Node } from '../types';
import {
  SIMILARITY_THRESHOLD,
  STRUCTURE_WEIGHT,
  STYLE_WEIGHT,
  LAYOUT_WEIGHT,
  CONTENT_WEIGHT,
  CHILDLESS_DIV_THRESHOLD_INCREASE,
} from './groupingComponent.config';
export interface NodeGroup {
  id: string;
  pattern: string;
  nodes: Node[];
  commonFeatures: Features;
  variations: Variation[];
}

export interface Features {
  structure: StructureSignature;
  styleProperties: StyleProperties;
  dimensions: DimensionRange;
  positionPattern: PositionPattern;
}

export interface StructureSignature {
  rootType: string;
  depth: number;
  childTypes: ChildTypeInfo[];
  childCount: number;
}

export interface ChildTypeInfo {
  type: string;
  hasChildren: boolean;
  childCount: number;
}

export interface StyleProperties {
  background?: string;
  color?: string;
  border?: string;
  display?: string;
}

export interface DimensionRange {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export interface PositionPattern {
  averageX: number;
  averageY: number;
  xVariance: number;
  yVariance: number;
}

export interface Variation {
  type: string;
  description: string;
  examples: Node[];
}

// =============================================================================
// CORE GROUPING FUNCTIONS
// =============================================================================

/**
 * Group similar nodes from a tree structure
 * This function flattens the tree and then groups similar nodes
 */
export const groupSimilarNodesFromTree = (rootNode: Node): NodeGroup[] => {
  const flattenedNodes = flattenNodeTree(rootNode);
  return groupSimilarNodes(flattenedNodes);
};

/**
 * Helper function to flatten a node tree into an array of nodes
 */
const flattenNodeTree = (node: Node): Node[] => {
  const nodes = [node];
  node.children.forEach((child) => {
    nodes.push(...flattenNodeTree(child));
  });
  return nodes;
};

/**
 * Get the similarity threshold for a specific node type
 */
const getSimilarityThreshold = (node: Node): number => {
  // For div elements without children, use a higher threshold
  // This makes them harder to group unless they're very similar
  if (node.type === 'Div' && (!node.children || node.children.length === 0)) {
    return SIMILARITY_THRESHOLD + CHILDLESS_DIV_THRESHOLD_INCREASE;
  }

  return SIMILARITY_THRESHOLD;
};

/**
 * Main function to group similar nodes from a flat array
 */
export const groupSimilarNodes = (nodes: Node[]): NodeGroup[] => {
  const groups: NodeGroup[] = [];
  const processed = new Set<string>();

  for (const node of nodes) {
    if (processed.has(node.id)) {
      continue;
    }

    const similarNodes = findSimilarNodes(node, nodes, processed);

    if (similarNodes.length >= 2) {
      const group = createNodeGroup(similarNodes);
      groups.push(group);

      // Mark all nodes as processed
      for (const similar of similarNodes) {
        processed.add(similar.id);
      }
    }
  }

  return groups;
};

/**
 * Find nodes similar to the reference node
 */
const findSimilarNodes = (
  referenceNode: Node,
  allNodes: Node[],
  processed: Set<string>
): Node[] => {
  const similarNodes: Node[] = [referenceNode];
  const referenceThreshold = getSimilarityThreshold(referenceNode);

  for (const candidate of allNodes) {
    if (processed.has(candidate.id) || candidate.id === referenceNode.id) {
      continue;
    }

    const similarity = calculateSimilarity(referenceNode, candidate);

    // Use the higher threshold if either node is a childless div
    const candidateThreshold = getSimilarityThreshold(candidate);
    const effectiveThreshold = Math.max(referenceThreshold, candidateThreshold);

    if (similarity >= effectiveThreshold) {
      similarNodes.push(candidate);
    }
  }

  return similarNodes;
};

// =============================================================================
// SIMILARITY CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate overall similarity between two nodes
 */
const calculateSimilarity = (node1: Node, node2: Node): number => {
  const structureSim = calculateStructuralSimilarity(node1, node2);
  const styleSim = calculateStyleSimilarity(node1, node2);
  const layoutSim = calculateLayoutSimilarity(node1, node2);
  const contentSim = calculateContentSimilarity(node1, node2);

  const totalSimilarity =
    structureSim * STRUCTURE_WEIGHT +
    styleSim * STYLE_WEIGHT +
    layoutSim * LAYOUT_WEIGHT +
    contentSim * CONTENT_WEIGHT;

  return totalSimilarity;
};

/**
 * Calculate structural similarity between nodes
 */
const calculateStructuralSimilarity = (node1: Node, node2: Node): number => {
  const structure1 = getStructureSignature(node1);
  const structure2 = getStructureSignature(node2);

  // If root types don't match, no structural similarity
  if (structure1.rootType !== structure2.rootType) {
    return 0.0;
  }

  // Use component-specific similarity calculation
  return calculateComponentSpecificSimilarity(
    structure1,
    structure2,
    node1,
    node2
  );
};

/**
 * Calculate component-specific structural similarity
 */
const calculateComponentSpecificSimilarity = (
  structure1: StructureSignature,
  structure2: StructureSignature,
  node1: Node,
  node2: Node
): number => {
  const rootType = structure1.rootType;

  switch (rootType) {
    case 'Button':
      return calculateButtonStructuralSimilarity(
        structure1,
        structure2,
        node1,
        node2
      );
    case 'Div':
      return calculateDivStructuralSimilarity(structure1, structure2);
    case 'Input':
      return calculateInputStructuralSimilarity(structure1, structure2);
    default:
      return calculateDefaultStructuralSimilarity(structure1, structure2);
  }
};

/**
 * Calculate structural similarity for buttons (more flexible for icons)
 */
const calculateButtonStructuralSimilarity = (
  structure1: StructureSignature,
  structure2: StructureSignature,
  node1: Node,
  node2: Node
): number => {
  // For buttons, be very flexible about child differences
  // Icons are decorative and shouldn't prevent grouping

  const childCountDiff = Math.abs(
    structure1.childCount - structure2.childCount
  );

  // If both have 0-1 children (text only vs text + icon), high similarity
  if (structure1.childCount <= 1 && structure2.childCount <= 1) {
    return 0.9;
  }

  // If difference is just 1 (likely icon addition), still good similarity
  if (childCountDiff === 1) {
    // Check if the difference is likely an icon
    if (isLikelyIconDifference(node1, node2)) {
      return 0.8;
    }
    return 0.6;
  }

  // If both have similar small child counts (0-2), moderate similarity
  if (structure1.childCount <= 2 && structure2.childCount <= 2) {
    return 0.5;
  }

  // For larger child count differences, use gradual falloff
  const maxCount = Math.max(structure1.childCount, structure2.childCount);
  if (maxCount === 0) return 1.0;

  return Math.max(0, 1 - childCountDiff / maxCount);
};

/**
 * Check if the structural difference is likely just an icon
 */
const isLikelyIconDifference = (node1: Node, node2: Node): boolean => {
  const hasIcon1 = hasIcon(node1);
  const hasIcon2 = hasIcon(node2);

  // One has icon, other doesn't - this is acceptable for buttons
  return hasIcon1 !== hasIcon2;
};

/**
 * Calculate structural similarity for divs (more strict about structure)
 */
const calculateDivStructuralSimilarity = (
  structure1: StructureSignature,
  structure2: StructureSignature
): number => {
  // For divs, structure is more important as they're containers
  if (structure1.depth !== structure2.depth) {
    return 0.0;
  }

  const childTypeSim = compareChildTypes(
    structure1.childTypes,
    structure2.childTypes
  );
  const hierarchySim = compareHierarchy(structure1, structure2);

  return (childTypeSim + hierarchySim) / 2.0;
};

/**
 * Calculate structural similarity for inputs (flexible for leaf nodes)
 */
const calculateInputStructuralSimilarity = (
  structure1: StructureSignature,
  structure2: StructureSignature
): number => {
  // Inputs are typically leaf nodes, focus on type consistency
  if (structure1.childCount === 0 && structure2.childCount === 0) {
    return 1.0;
  }

  // Allow minimal children (like labels or icons)
  if (structure1.childCount <= 1 && structure2.childCount <= 1) {
    return 0.8;
  }

  return calculateDefaultStructuralSimilarity(structure1, structure2);
};

/**
 * Calculate default structural similarity (conservative approach)
 */
const calculateDefaultStructuralSimilarity = (
  structure1: StructureSignature,
  structure2: StructureSignature
): number => {
  if (structure1.depth !== structure2.depth) {
    return 0.0;
  }

  const childTypeSim = compareChildTypes(
    structure1.childTypes,
    structure2.childTypes
  );
  const hierarchySim = compareHierarchy(structure1, structure2);

  return (childTypeSim + hierarchySim) / 2.0;
};

// =============================================================================
// STRUCTURE ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Get structural signature of a node
 */
const getStructureSignature = (node: Node): StructureSignature => {
  return {
    rootType: node.type,
    depth: calculateDepth(node),
    childTypes: node.children.map((child) => ({
      type: child.type,
      hasChildren: child.children.length > 0,
      childCount: child.children.length,
    })),
    childCount: node.children.length,
  };
};

/**
 * Calculate the depth of a node tree
 */
const calculateDepth = (node: Node): number => {
  if (node.children.length === 0) {
    return 1;
  }

  const childDepths = node.children.map((child) => calculateDepth(child));
  return 1 + Math.max(...childDepths);
};

/**
 * Compare child types between two structures
 */
const compareChildTypes = (
  childTypes1: ChildTypeInfo[],
  childTypes2: ChildTypeInfo[]
): number => {
  // If both empty, perfect match
  if (childTypes1.length === 0 && childTypes2.length === 0) {
    return 1.0;
  }

  // If one is empty but other isn't, partial similarity
  if (childTypes1.length === 0 || childTypes2.length === 0) {
    return 0.3;
  }

  // Calculate similarity based on common children and differences
  const maxLength = Math.max(childTypes1.length, childTypes2.length);
  const minLength = Math.min(childTypes1.length, childTypes2.length);

  // Find matching children (order-independent for better flexibility)
  let matchScore = 0;
  const used2 = new Set<number>();

  // First pass: find exact matches
  for (let i = 0; i < childTypes1.length; i++) {
    const child1 = childTypes1[i];
    let bestMatch = -1;
    let bestScore = 0;

    for (let j = 0; j < childTypes2.length; j++) {
      if (used2.has(j)) continue;

      const child2 = childTypes2[j];
      let currentScore = 0;

      if (child1.type === child2.type) {
        currentScore += 0.5;
        if (child1.hasChildren === child2.hasChildren) {
          currentScore += 0.3;
          if (child1.childCount === child2.childCount) {
            currentScore += 0.2;
          }
        }
      }

      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestMatch = j;
      }
    }

    if (bestMatch >= 0) {
      used2.add(bestMatch);
      matchScore += bestScore;
    }
  }

  // Normalize by the maximum possible matches
  const normalizedScore = matchScore / maxLength;

  // Apply penalty for size difference (less harsh than before)
  const sizePenalty = 1 - ((maxLength - minLength) / maxLength) * 0.5;

  return normalizedScore * sizePenalty;
};

/**
 * Compare hierarchy between two structures
 */
const compareHierarchy = (
  structure1: StructureSignature,
  structure2: StructureSignature
): number => {
  let score = 0;

  if (structure1.rootType === structure2.rootType) {
    score += 0.5;
  }

  if (structure1.childCount === structure2.childCount) {
    score += 0.5;
  } else {
    // Partial score for similar child counts
    const diff = Math.abs(structure1.childCount - structure2.childCount);
    const maxCount = Math.max(structure1.childCount, structure2.childCount);
    score += 0.5 * (1 - diff / maxCount);
  }

  return score;
};

/**
 * Calculate style similarity between nodes
 */
const calculateStyleSimilarity = (node1: Node, node2: Node): number => {
  const styleProperties = [
    'background',
    'color',
    'border',
    'display',
    'font-size',
    'font-weight',
    'line-height',
  ];
  let styleScore = 0;
  let totalProperties = 0;

  for (const prop of styleProperties) {
    totalProperties += 1;

    const val1 = node1[prop];
    const val2 = node2[prop];

    if (val1 === val2) {
      styleScore += 1.0;
    } else if (bothExistAndSimilar(val1, val2)) {
      styleScore += 0.5;
    }
  }

  return styleScore / totalProperties;
};

/**
 * Calculate layout similarity between nodes
 */
const calculateLayoutSimilarity = (node1: Node, node2: Node): number => {
  const widthSim = calculateDimensionSimilarity(node1.width, node2.width);
  const heightSim = calculateDimensionSimilarity(node1.height, node2.height);

  return (widthSim + heightSim) / 2.0;
};

/**
 * Calculate similarity between two dimensions
 */
const calculateDimensionSimilarity = (dim1: number, dim2: number): number => {
  const diff = Math.abs(dim1 - dim2);
  const avg = (dim1 + dim2) / 2;
  const threshold = avg * 0.2; // 20% tolerance

  if (diff <= threshold) {
    return 1.0;
  }

  // Gradual falloff
  return Math.max(0, 1 - (diff - threshold) / avg);
};

/**
 * Calculate content similarity between nodes
 */
const calculateContentSimilarity = (node1: Node, node2: Node): number => {
  if (!node1.text && !node2.text) {
    return 1.0;
  }

  if (!node1.text || !node2.text) {
    return 0.5;
  }

  return calculateTextPatternSimilarity(node1.text, node2.text);
};

/**
 * Calculate text pattern similarity
 */
const calculateTextPatternSimilarity = (
  text1: string,
  text2: string
): number => {
  // Simple pattern matching - can be enhanced
  if (text1 === text2) {
    return 1.0;
  }

  // Check if they have similar length and structure
  const lengthSim =
    1 -
    Math.abs(text1.length - text2.length) /
      Math.max(text1.length, text2.length);
  const hasNumbers1 = /\d/.test(text1);
  const hasNumbers2 = /\d/.test(text2);
  const numberSim = hasNumbers1 === hasNumbers2 ? 1 : 0;

  return (lengthSim + numberSim) / 2;
};

/**
 * Check if two values exist and are similar
 */
const bothExistAndSimilar = (val1: any, val2: any): boolean => {
  if (!val1 || !val2) {
    return false;
  }

  if (typeof val1 === 'string' && typeof val2 === 'string') {
    // For colors, check if they're similar
    if (val1.includes('#') && val2.includes('#')) {
      return val1.length === val2.length;
    }
  }

  return false;
};

// =============================================================================
// FEATURE EXTRACTION FUNCTIONS
// =============================================================================

/**
 * Create a node group from similar nodes
 */
const createNodeGroup = (similarNodes: Node[]): NodeGroup => {
  const group: NodeGroup = {
    id: generateGroupId(),
    pattern: identifyPattern(similarNodes),
    nodes: similarNodes,
    commonFeatures: extractCommonFeatures(similarNodes),
    variations: identifyVariations(similarNodes),
  };

  return group;
};

/**
 * Generate a unique group ID
 */
const generateGroupId = (): string => {
  return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Identify the pattern type of the group
 */
const identifyPattern = (nodes: Node[]): string => {
  const firstNode = nodes[0];

  if (hasCardLikeStructure(nodes)) {
    return 'Card';
  } else if (firstNode.type === 'Button') {
    return 'Button';
  } else if (firstNode.type === 'Input') {
    return 'Input Field';
  } else if (firstNode.type === 'Image') {
    return 'Image';
  } else {
    return 'Custom Component';
  }
};

/**
 * Check if nodes have card-like structure
 */
const hasCardLikeStructure = (nodes: Node[]): boolean => {
  return nodes.every(
    (node) => node.type === 'Div' && node.children.length > 0 && node.background
  );
};

/**
 * Extract common features from nodes
 */
const extractCommonFeatures = (nodes: Node[]): Features => {
  const structure = getStructureSignature(nodes[0]);

  // Calculate dimension ranges
  const widths = nodes.map((n) => n.width);
  const heights = nodes.map((n) => n.height);
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);

  return {
    structure,
    styleProperties: extractCommonStyles(nodes),
    dimensions: {
      minWidth: Math.min(...widths),
      maxWidth: Math.max(...widths),
      minHeight: Math.min(...heights),
      maxHeight: Math.max(...heights),
    },
    positionPattern: {
      averageX: xs.reduce((a, b) => a + b, 0) / xs.length,
      averageY: ys.reduce((a, b) => a + b, 0) / ys.length,
      xVariance: calculateVariance(xs),
      yVariance: calculateVariance(ys),
    },
  };
};

/**
 * Extract common styles from nodes
 */
const extractCommonStyles = (nodes: Node[]): StyleProperties => {
  const common: StyleProperties = {};
  const styleProps = ['background', 'color', 'border', 'display'];

  for (const prop of styleProps) {
    const values = nodes.map((n) => n[prop]).filter((v) => v);
    if (values.length > 0) {
      const firstValue = values[0];
      if (values.every((v) => v === firstValue)) {
        common[prop as keyof StyleProperties] = firstValue;
      }
    }
  }

  return common;
};

/**
 * Calculate variance of an array of numbers
 */
const calculateVariance = (numbers: number[]): number => {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
};

/**
 * Identify variations within a group
 */
const identifyVariations = (nodes: Node[]): Variation[] => {
  const variations: Variation[] = [];

  if (nodes[0].type === 'Button') {
    return identifyButtonVariations(nodes);
  }

  // Group by presence of badges (children with specific characteristics)
  const withBadge: Node[] = [];
  const withoutBadge: Node[] = [];

  for (const node of nodes) {
    if (hasBadge(node)) {
      withBadge.push(node);
    } else {
      withoutBadge.push(node);
    }
  }

  if (withBadge.length > 0 && withoutBadge.length > 0) {
    variations.push({
      type: 'With Badge',
      description: `Cards with additional badge component (${withBadge.length} instances)`,
      examples: withBadge,
    });

    variations.push({
      type: 'Without Badge',
      description: `Basic cards without badge (${withoutBadge.length} instances)`,
      examples: withoutBadge,
    });
  }

  return variations;
};

/**
 * Identify button variations
 */
const identifyButtonVariations = (nodes: Node[]): Variation[] => {
  const variations: Variation[] = [];

  // Group by style variations
  const styleGroups = new Map<string, Node[]>();
  const iconGroups = new Map<string, Node[]>();

  for (const node of nodes) {
    // Group by background color (style variant)
    const bgColor = node.background || 'default';
    if (!styleGroups.has(bgColor)) {
      styleGroups.set(bgColor, []);
    }
    styleGroups.get(bgColor)!.push(node);

    // Group by presence of icons
    const hasIconValue = hasIcon(node);
    const iconKey = hasIconValue ? 'with_icon' : 'without_icon';
    if (!iconGroups.has(iconKey)) {
      iconGroups.set(iconKey, []);
    }
    iconGroups.get(iconKey)!.push(node);
  }

  // Add style variations
  if (styleGroups.size > 1) {
    for (const [bgColor, groupNodes] of styleGroups) {
      const variantType = getButtonVariantType(bgColor);
      variations.push({
        type: variantType,
        description: `${variantType} style buttons (${groupNodes.length} instances)`,
        examples: groupNodes,
      });
    }
  }

  // Add icon variations if both exist
  if (iconGroups.has('with_icon') && iconGroups.has('without_icon')) {
    variations.push({
      type: 'With Icon',
      description: `Buttons with icon (${
        iconGroups.get('with_icon')!.length
      } instances)`,
      examples: iconGroups.get('with_icon')!,
    });

    variations.push({
      type: 'Without Icon',
      description: `Buttons without icon (${
        iconGroups.get('without_icon')!.length
      } instances)`,
      examples: iconGroups.get('without_icon')!,
    });
  }

  return variations;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get button variant type based on background color
 */
const getButtonVariantType = (bgColor: string): string => {
  switch (bgColor) {
    case '#007bff':
      return 'Primary';
    case '#6c757d':
      return 'Secondary';
    case 'transparent':
      return 'Outline';
    case '#dc3545':
      return 'Danger';
    case '#28a745':
      return 'Success';
    case '#ffc107':
      return 'Warning';
    default:
      return 'Custom';
  }
};

/**
 * Check if a node has an icon
 */
const hasIcon = (node: Node): boolean => {
  return node.children.some((child) => child.type === 'Image');
};

/**
 * Check if a node has a badge-like child
 */
const hasBadge = (node: Node): boolean => {
  return node.children.some(
    (child) =>
      child.width < node.width * 0.3 &&
      child.height < node.height * 0.3 &&
      child.background
  );
};
