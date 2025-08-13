import { type Node } from '../components/CSSInspector';

// Optimized tree structure - only keeps relationships
export interface TreeNode {
  id: string;
  children: string[];
}

// Helper function to convert mock data to optimized structure
export const convertToOptimizedStructure = (mockData: Node) => {
  const nodeMap = new Map<string, Node>();
  const treeData = new Map<string, TreeNode>();

  const traverse = (node: Node) => {
    // Store node data in map
    nodeMap.set(node.id, {
      ...node,
      children: [], // Remove children from node data
    });

    // Store tree structure separately
    treeData.set(node.id, {
      id: node.id,
      children: node.children.map((child) => child.id),
    });

    // Recursively process children
    node.children.forEach(traverse);
  };

  traverse(mockData);
  return { nodeMap, treeData };
};

// Component detection logic - updated to work with optimized structure
export const detectComponents = (
  nodeMap: Map<string, Node>,
  treeData: Map<string, TreeNode>
): Map<string, string[]> => {
  const components = new Map<string, string[]>();
  const nodesBySignature = new Map<string, Node[]>();
  const componentNodeIds = new Set<string>();

  // Helper function to get all descendant node IDs
  const getAllDescendants = (nodeId: string): string[] => {
    const descendants: string[] = [];
    const treeNode = treeData.get(nodeId);
    if (treeNode) {
      treeNode.children.forEach((childId) => {
        descendants.push(childId);
        descendants.push(...getAllDescendants(childId));
      });
    }
    return descendants;
  };

  // Helper function to create a detailed signature for a node including its children
  const createNodeSignature = (nodeId: string): string => {
    const node = nodeMap.get(nodeId)!;
    const treeNode = treeData.get(nodeId)!;

    // Base signature with node properties
    const baseSignature = `${node.type}_${node.width}x${node.height}`;

    // If node has no children, return base signature
    if (treeNode.children.length === 0) {
      return baseSignature;
    }

    // Create signatures for children and sort them for consistent comparison
    const childSignatures = treeNode.children
      .map((childId) => {
        const childNode = nodeMap.get(childId)!;
        return `${childNode.type}_${childNode.width}x${childNode.height}`;
      })
      .sort()
      .join('|');

    return `${baseSignature}_children[${childSignatures}]`;
  };

  // Get all node IDs and process them
  Array.from(nodeMap.keys()).forEach((nodeId) => {
    // Create detailed signature including children structure
    const signature = createNodeSignature(nodeId);

    if (!nodesBySignature.has(signature)) {
      nodesBySignature.set(signature, []);
    }
    nodesBySignature.get(signature)!.push(nodeMap.get(nodeId)!);
  });

  let componentIndex = 1;
  nodesBySignature.forEach((nodes, _signature) => {
    if (nodes.length > 1) {
      const componentName = `C${componentIndex++}`;
      const componentNodeIdsList = nodes.map((n) => n.id);

      components.set(componentName, componentNodeIdsList);

      // Mark these nodes and all their descendants as component nodes
      componentNodeIdsList.forEach((nodeId) => {
        componentNodeIds.add(nodeId);
        getAllDescendants(nodeId).forEach((descendantId) => {
          componentNodeIds.add(descendantId);
        });
      });
    }
  });

  // Filter out components where all nodes are children of other components
  const filteredComponents = new Map<string, string[]>();
  components.forEach((nodeIds, componentName) => {
    // Check if any node in this component is not a child of another component
    const hasIndependentNode = nodeIds.some((nodeId) => {
      // Check if this node has a parent that's also in a component
      const hasComponentParent = Array.from(treeData.entries()).some(
        ([parentId, parentTreeNode]) => {
          return (
            parentTreeNode.children.includes(nodeId) &&
            Array.from(components.values()).some(
              (otherComponentIds) =>
                otherComponentIds.includes(parentId) &&
                !nodeIds.includes(parentId)
            )
          );
        }
      );
      return !hasComponentParent;
    });

    if (hasIndependentNode) {
      filteredComponents.set(componentName, nodeIds);
    }
  });

  // Reassign sequential component names after filtering
  const finalComponents = new Map<string, string[]>();
  let finalComponentIndex = 1;

  filteredComponents.forEach((nodeIds) => {
    const sequentialName = `C${finalComponentIndex++}`;
    finalComponents.set(sequentialName, nodeIds);
  });

  return finalComponents;
};
