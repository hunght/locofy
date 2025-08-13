// Shared types for the application
export interface Node {
  id: string;
  name: string;
  type: 'Div' | 'Input' | 'Image' | 'Button';
  x: number;
  y: number;
  width: number;
  height: number;
  background?: string;
  color?: string;
  border?: string;
  text?: string;
  display?: string;
  children?: Node[]; // Made optional for compatibility
  [key: string]: any;
}

export interface TreeNode {
  id: string;
  children: string[];
}

export interface ComponentDetectionResult {
  nodeMap: Map<string, Node>;
  treeData: Map<string, TreeNode>;
}

export interface TreeNodeProps {
  nodeId: string;
  nodeMap: Map<string, Node>;
  treeData: Map<string, TreeNode>;
  level: number;
  selectedId: string | null;
  expandedNodes: Set<string>;
  components: Map<string, string[]>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export interface NodeRendererProps {
  nodeId: string;
  nodeMap: Map<string, Node>;
  treeData: Map<string, TreeNode>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export interface TreeViewPanelProps {
  nodeMap: Map<string, Node>;
  treeData: Map<string, TreeNode>;
  selectedId: string | null;
  expandedNodes: Set<string>;
  components: Map<string, string[]>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export interface PreviewPanelProps {
  nodeMap: Map<string, Node>;
  treeData: Map<string, TreeNode>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export interface InspectorPanelProps {
  selectedNode: Node | null;
  treeData: Map<string, TreeNode>;
  onUpdateNode: (id: string, updates: Partial<Node>) => void;
}

// Export types from utils for compatibility
export type { TreeNode as UtilTreeNode } from '../utils/componentDetection';
