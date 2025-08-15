# Node Grouping Algorithm Documentation

## Overview

The Node Grouping Algorithm is an intelligent system that automatically identifies and groups similar UI components within a design tree structure. It uses a multi-dimensional similarity analysis to detect patterns and variations in UI elements, enabling automated component extraction and reusability analysis.

## Table of Contents

- [Core Concepts](#core-concepts)
- [Algorithm Architecture](#algorithm-architecture)
- [Similarity Calculation](#similarity-calculation)
- [Component-Specific Logic](#component-specific-logic)
- [Configuration Parameters](#configuration-parameters)
- [Data Structures](#data-structures)
- [Usage Examples](#usage-examples)
- [Performance Considerations](#performance-considerations)
- [Testing Strategy](#testing-strategy)

## Core Concepts

### Node Groups

A **Node Group** represents a collection of similar UI components that share common patterns and characteristics. Each group contains:

- **Pattern Identification**: A unique identifier and pattern description
- **Common Features**: Shared structural, style, layout, and content properties
- **Variations**: Different implementations within the same pattern
- **Member Nodes**: All nodes that belong to this group

### Similarity Dimensions

The algorithm evaluates similarity across four key dimensions:

1. **Structure (60% weight)**: DOM hierarchy, element types, child relationships
2. **Layout (20% weight)**: Position patterns, dimensions, spacing
3. **Style (10% weight)**: Visual properties like colors, borders, backgrounds
4. **Content (10% weight)**: Text content and semantic meaning

## Algorithm Architecture

### High-Level Flow

```
Input: Node Tree
    ↓
1. Flatten Tree Structure
    ↓
2. Extract Node Features
    ↓
3. Calculate Pairwise Similarities
    ↓
4. Group Similar Nodes (≥ threshold)
    ↓
5. Analyze Variations
    ↓
Output: Node Groups
```

### Core Functions

#### `groupSimilarNodesFromTree(rootNode: Node): NodeGroup[]`

Main entry point that processes a complete node tree:

```typescript
export const groupSimilarNodesFromTree = (rootNode: Node): NodeGroup[] => {
  const flattenedNodes = flattenNodeTree(rootNode);
  return groupSimilarNodes(flattenedNodes);
};
```

#### `groupSimilarNodes(nodes: Node[]): NodeGroup[]`

Core grouping logic that processes a flat array of nodes:

1. **Iterate through unprocessed nodes**
2. **Find similar candidates** using similarity calculation
3. **Create groups** for nodes meeting the threshold (≥2 similar nodes)
4. **Mark nodes as processed** to avoid duplicates

## Similarity Calculation

### Overall Similarity Formula

```
Similarity = (Structure × 0.6) + (Layout × 0.2) + (Style × 0.1) + (Content × 0.1)
```

### Structural Similarity

The most critical dimension, focusing on DOM hierarchy and element relationships:

#### Structure Signature Components:

- **Root Type**: Primary element type (Button, Div, Input, etc.)
- **Depth**: Nesting level in the tree
- **Child Types**: Types and structure of child elements
- **Child Count**: Number of direct children

#### Component-Specific Logic:

**Buttons**: Flexible child matching to handle icon variations
```typescript
// Buttons with 0-1 children (text vs text+icon) = 90% similarity
// Child difference of 1 (likely icon) = 80% similarity
// Both have ≤2 children = 50% similarity
```

**Divs**: Strict structural matching for container elements
```typescript
// Exact child count match = high similarity
// Gradual falloff for count differences
```

**Inputs**: Form-specific matching logic
```typescript
// Input type and attributes must match closely
// Placeholder and validation patterns considered
```

### Layout Similarity

Analyzes spatial relationships and positioning patterns:

#### Dimension Matching:
- **Size Tolerance**: ±20% variance allowed for width/height
- **Aspect Ratio**: Maintained across similar components
- **Position Patterns**: Relative positioning within containers

#### Position Pattern Analysis:
```typescript
interface PositionPattern {
  averageX: number;     // Mean X coordinate
  averageY: number;     // Mean Y coordinate  
  xVariance: number;    // X-axis position variance
  yVariance: number;    // Y-axis position variance
}
```

### Style Similarity

Compares visual properties with semantic understanding:

#### Key Style Properties:
- **Background**: Colors, gradients, images
- **Typography**: Font size, weight, color
- **Borders**: Style, width, radius
- **Display**: Layout method (flex, block, inline)

#### Color Analysis:
- **Semantic matching**: Primary, secondary, accent colors
- **Shade variations**: Different tones of the same color family
- **Contrast patterns**: Text/background relationships

### Content Similarity

Evaluates textual and semantic content:

#### Text Analysis:
- **Length patterns**: Similar character counts
- **Semantic categories**: Actions (Save, Submit), Navigation (Home, About)
- **Format patterns**: Titles, labels, descriptions

## Component-Specific Logic

### Button Grouping

Buttons have specialized logic to handle common variations:

#### Icon Handling:
```typescript
const isLikelyIconDifference = (node1: Node, node2: Node): boolean => {
  // Detects if child difference is likely an icon addition
  // Checks for small decorative elements
  // Maintains high similarity for functional equivalence
};
```

#### Button Categories:
- **Primary Actions**: Save, Submit, Confirm
- **Secondary Actions**: Cancel, Reset, Clear  
- **Navigation**: Next, Previous, Back
- **Social**: Share, Like, Follow

### Card Grouping

Cards use container-based similarity:

#### Card Structure:
- **Header sections**: Titles, metadata
- **Content areas**: Description, images
- **Action sections**: Buttons, links
- **Badge overlays**: Status indicators

### Form Element Grouping

Form inputs have strict validation requirements:

#### Input Validation:
- **Type matching**: text, email, password, etc.
- **Validation patterns**: Required fields, format restrictions
- **Label associations**: Connected form labels
- **Error state handling**: Validation feedback patterns

## Configuration Parameters

### Similarity Weights

```typescript
export const STRUCTURE_WEIGHT = 0.6;  // Structural similarity importance
export const STYLE_WEIGHT = 0.1;      // Visual property importance  
export const LAYOUT_WEIGHT = 0.2;     // Spatial relationship importance
export const CONTENT_WEIGHT = 0.1;    // Content similarity importance
export const SIMILARITY_THRESHOLD = 0.75; // Minimum similarity for grouping
```

### Tuning Guidelines:

- **Increase STRUCTURE_WEIGHT** for strict component matching
- **Increase LAYOUT_WEIGHT** for position-sensitive layouts  
- **Increase STYLE_WEIGHT** for design system consistency
- **Lower SIMILARITY_THRESHOLD** for broader grouping
- **Raise SIMILARITY_THRESHOLD** for stricter component detection

## Data Structures

### NodeGroup Interface

```typescript
export interface NodeGroup {
  id: string;                    // Unique group identifier
  pattern: string;               // Human-readable pattern description
  nodes: Node[];                 // All nodes in this group
  commonFeatures: Features;      // Shared characteristics
  variations: Variation[];       // Detected variations within group
}
```

### Features Interface

```typescript
export interface Features {
  structure: StructureSignature;    // DOM structure information
  styleProperties: StyleProperties; // Common visual properties
  dimensions: DimensionRange;       // Size constraints
  positionPattern: PositionPattern; // Spatial arrangement
}
```

### Variation Interface

```typescript
export interface Variation {
  type: string;          // Variation category (e.g., "with-icon", "large-size")
  description: string;   // Human-readable description
  examples: Node[];      // Example nodes showing this variation
}
```

## Usage Examples

### Basic Grouping

```typescript
import { groupSimilarNodesFromTree } from './utils/groupingComponent';

// Group nodes from a design tree
const nodeGroups = groupSimilarNodesFromTree(rootNode);

// Process results
nodeGroups.forEach(group => {
  console.log(`Found ${group.nodes.length} similar ${group.pattern} components`);
  
  // Analyze variations
  group.variations.forEach(variation => {
    console.log(`  - ${variation.type}: ${variation.description}`);
  });
});
```

### Advanced Analysis

```typescript
// Filter groups by minimum size
const significantGroups = nodeGroups.filter(group => group.nodes.length >= 3);

// Find the most common component patterns
const sortedGroups = nodeGroups.sort((a, b) => b.nodes.length - a.nodes.length);

// Extract reusable component candidates
const componentCandidates = sortedGroups.slice(0, 10); // Top 10 patterns
```

## Performance Considerations

### Time Complexity

- **Tree Flattening**: O(n) where n = total nodes
- **Similarity Calculation**: O(n²) for pairwise comparisons
- **Grouping Process**: O(n²) worst case, O(n log n) average case

### Optimization Strategies

#### Early Termination:
```typescript
// Skip obviously different nodes early
if (node1.type !== node2.type) return 0.0;
if (Math.abs(node1.width - node2.width) > node1.width * 0.5) return 0.0;
```

#### Caching:
```typescript
// Cache expensive calculations
const featureCache = new Map<string, Features>();
const similarityCache = new Map<string, number>();
```

#### Batching:
```typescript
// Process nodes in batches for large datasets
const batchSize = 100;
const batches = chunk(nodes, batchSize);
```

### Memory Optimization

- **Lazy Loading**: Calculate features on-demand
- **Feature Pruning**: Remove unnecessary properties early
- **Reference Sharing**: Share common objects between similar nodes

## Testing Strategy

### Unit Tests

#### Feature Extraction:
```typescript
describe('getStructureSignature', () => {
  it('should extract correct structure for buttons', () => {
    const signature = getStructureSignature(buttonNode);
    expect(signature.rootType).toBe('Button');
    expect(signature.childCount).toBe(1);
  });
});
```

#### Similarity Calculation:
```typescript
describe('calculateSimilarity', () => {
  it('should return high similarity for identical buttons', () => {
    const similarity = calculateSimilarity(button1, button2);
    expect(similarity).toBeGreaterThan(0.9);
  });
});
```

### Integration Tests

#### End-to-End Grouping:
```typescript
describe('groupSimilarNodes', () => {
  it('should group button variations correctly', () => {
    const groups = groupSimilarNodes(mockButtonNodes);
    expect(groups).toHaveLength(1);
    expect(groups[0].nodes).toHaveLength(3);
    expect(groups[0].pattern).toContain('Button');
  });
});
```

### Performance Tests

#### Large Dataset Handling:
```typescript
describe('Performance Tests', () => {
  it('should handle 1000+ nodes within reasonable time', () => {
    const startTime = performance.now();
    const groups = groupSimilarNodes(largeNodeSet);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
  });
});
```

## Troubleshooting

### Common Issues

#### Low Grouping Rate:
- **Check similarity threshold**: May be too high
- **Verify node structure**: Ensure consistent data format
- **Review weight distribution**: Adjust for your use case

#### False Positives:
- **Increase similarity threshold**: Require stricter matching
- **Add component-specific logic**: Handle edge cases
- **Improve feature extraction**: More discriminative signatures

#### Performance Problems:
- **Enable caching**: Cache expensive calculations
- **Reduce dataset size**: Pre-filter nodes
- **Optimize similarity calculation**: Early termination strategies

### Debugging Tools

#### Similarity Analysis:
```typescript
// Debug similarity calculation breakdown
const debugSimilarity = (node1: Node, node2: Node) => {
  const structural = calculateStructuralSimilarity(node1, node2);
  const layout = calculateLayoutSimilarity(node1, node2);
  const style = calculateStyleSimilarity(node1, node2);
  const content = calculateContentSimilarity(node1, node2);
  
  console.log({
    structural: structural * STRUCTURE_WEIGHT,
    layout: layout * LAYOUT_WEIGHT,  
    style: style * STYLE_WEIGHT,
    content: content * CONTENT_WEIGHT,
    total: calculateSimilarity(node1, node2)
  });
};
```

## Future Enhancements

### Machine Learning Integration

- **Pattern Learning**: Learn from user feedback on grouping quality
- **Feature Weighting**: Automatically adjust weights based on project type
- **Anomaly Detection**: Identify unusual components that break patterns

### Advanced Analysis

- **Semantic Understanding**: Natural language processing for content analysis
- **Design System Integration**: Match against existing design tokens
- **Accessibility Grouping**: Group by accessibility patterns and compliance

### Performance Improvements

- **Parallel Processing**: Multi-threaded similarity calculations
- **Incremental Updates**: Update groups when tree changes
- **Intelligent Sampling**: Representative sampling for large datasets

---

*This document provides a comprehensive guide to understanding and extending the Node Grouping Algorithm. For implementation details, see the source code in `/src/utils/groupingComponent.ts`.*
