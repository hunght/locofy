import React, { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, Eye } from 'lucide-react';
import CSSInspector, { type Node } from './src/components/CSSInspector';

// Mock data for testing
const mockData: Node = {
  id: '1',
  x: 0,
  y: 0,
  name: 'Root Container',
  type: 'Div',
  width: 800,
  height: 600,
  background: '#f5f5f5',
  children: [
    {
      id: '2',
      x: 50,
      y: 50,
      name: 'Header',
      type: 'Div',
      width: 700,
      height: 80,
      background: '#3b82f6',
      color: '#ffffff',
      text: 'Header Content',
      children: [
        {
          id: '3',
          x: 70,
          y: 70,
          name: 'Logo',
          type: 'Image',
          width: 60,
          height: 40,
          background: '#ffffff',
          children: [],
        },
        {
          id: '4',
          x: 600,
          y: 65,
          name: 'Login Button',
          type: 'Button',
          width: 100,
          height: 35,
          background: '#10b981',
          color: '#ffffff',
          text: 'Login',
          border: '1px solid #059669',
          children: [],
        },
      ],
    },
    {
      id: '5',
      x: 50,
      y: 150,
      name: 'Main Content',
      type: 'Div',
      width: 700,
      height: 400,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      children: [
        {
          id: '6',
          x: 100,
          y: 200,
          name: 'Search Input',
          type: 'Input',
          width: 300,
          height: 40,
          background: '#ffffff',
          border: '2px solid #d1d5db',
          children: [],
        },
        {
          id: '7',
          x: 420,
          y: 200,
          name: 'Search Button',
          type: 'Button',
          width: 80,
          height: 40,
          background: '#3b82f6',
          color: '#ffffff',
          text: 'Search',
          children: [],
        },
        {
          id: '8',
          x: 100,
          y: 280,
          name: 'Card Container',
          type: 'Div',
          width: 600,
          height: 250,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          children: [
            {
              id: '9',
              x: 120,
              y: 300,
              name: 'Card 1',
              type: 'Div',
              width: 180,
              height: 200,
              background: '#ffffff',
              border: '1px solid #d1d5db',
              children: [],
            },
            {
              id: '10',
              x: 320,
              y: 300,
              name: 'Card 2',
              type: 'Div',
              width: 180,
              height: 200,
              background: '#ffffff',
              border: '1px solid #d1d5db',
              children: [],
            },
            {
              id: '11',
              x: 520,
              y: 300,
              name: 'Card 3',
              type: 'Div',
              width: 180,
              height: 200,
              background: '#ffffff',
              border: '1px solid #d1d5db',
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

// Component detection logic
const detectComponents = (_nodes: Node[]): Map<string, string[]> => {
  const components = new Map<string, string[]>();
  const nodesBySignature = new Map<string, Node[]>();

  const traverse = (node: Node) => {
    // Create signature based on type, dimensions, and structure
    const signature = `${node.type}_${node.width}x${node.height}_${node.children.length}`;

    if (!nodesBySignature.has(signature)) {
      nodesBySignature.set(signature, []);
    }
    nodesBySignature.get(signature)!.push(node);

    node.children.forEach(traverse);
  };

  const getAllNodes = (node: Node): Node[] => {
    return [node, ...node.children.flatMap(getAllNodes)];
  };

  getAllNodes(mockData).forEach(traverse);

  let componentIndex = 1;
  nodesBySignature.forEach((nodes, _signature) => {
    if (nodes.length > 1) {
      const componentName = `C${componentIndex++}`;
      components.set(
        componentName,
        nodes.map((n) => n.id)
      );
    }
  });

  return components;
};

const TreeNode: React.FC<{
  node: Node;
  level: number;
  selectedId: string | null;
  expandedNodes: Set<string>;
  components: Map<string, string[]>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}> = ({
  node,
  level,
  selectedId,
  expandedNodes,
  components,
  onSelect,
  onToggle,
}) => {
  const isSelected = selectedId === node.id;
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;

  // Find component label for this node
  const componentLabel = useMemo(() => {
    for (const [label, nodeIds] of components.entries()) {
      if (nodeIds.includes(node.id)) {
        return label;
      }
    }
    return null;
  }, [components, node.id]);

  return (
    <div>
      <div
        className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100 ${
          isSelected ? 'bg-blue-100 border-l-2 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="mr-1 p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        <span className="text-xs px-1 py-0.5 bg-gray-200 rounded mr-2">
          {node.type}
        </span>

        {componentLabel && (
          <span className="text-xs px-1 py-0.5 bg-green-200 text-green-800 rounded mr-2">
            {componentLabel}
          </span>
        )}

        <span className="flex-1">{node.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedNodes={expandedNodes}
              components={components}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NodeRenderer: React.FC<{
  node: Node;
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ node, selectedId, onSelect }) => {
  const isSelected = selectedId === node.id;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: node.x,
    top: node.y,
    width: node.width,
    height: node.height,
    background: node.background,
    color: node.color,
    border:
      node.border ||
      (isSelected ? '2px solid #3b82f6' : '1px solid transparent'),
    cursor: 'pointer',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case 'Input':
        return (
          <input
            type="text"
            placeholder={node.text || node.name}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'inherit',
              textAlign: 'center',
            }}
            onClick={(e) => e.preventDefault()}
          />
        );
      case 'Button':
        return <span>{node.text || node.name}</span>;
      case 'Image':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#666',
            }}
          >
            IMG
          </div>
        );
      case 'Div':
      default:
        return node.text ? <span>{node.text}</span> : null;
    }
  };

  return (
    <>
      <div
        style={baseStyle}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
      >
        {renderNodeContent()}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: -20,
              left: 0,
              background: '#3b82f6',
              color: 'white',
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            {node.name}
          </div>
        )}
      </div>
      {node.children.map((child) => (
        <NodeRenderer
          key={child.id}
          node={child}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};

export default function App() {
  const [data, setData] = useState<Node>(mockData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['1', '2', '5', '8'])
  );

  const components = useMemo(() => detectComponents([data]), [data]);

  const selectedNode = useMemo(() => {
    const findNode = (node: Node): Node | null => {
      if (node.id === selectedId) return node;
      for (const child of node.children) {
        const found = findNode(child);
        if (found) return found;
      }
      return null;
    };
    return findNode(data);
  }, [data, selectedId]);

  const handleToggle = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleUpdateNode = useCallback((id: string, updates: Partial<Node>) => {
    const updateNodeRecursively = (node: Node): Node => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      return {
        ...node,
        children: node.children.map(updateNodeRecursively),
      };
    };

    setData((prev) => updateNodeRecursively(prev));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Tree View Panel */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Node Tree</h2>
          <p className="text-sm text-gray-600 mt-1">
            {components.size} component{components.size !== 1 ? 's' : ''}{' '}
            detected
          </p>
        </div>
        <div className="flex-1 overflow-auto">
          <TreeNode
            node={data}
            level={0}
            selectedId={selectedId}
            expandedNodes={expandedNodes}
            components={components}
            onSelect={setSelectedId}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-semibold text-lg flex items-center">
            <Eye size={20} className="mr-2" />
            Canvas Preview
          </h2>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div
            className="relative bg-white border border-gray-300"
            style={{
              width: data.width,
              height: data.height,
              minHeight: 600,
            }}
            onClick={() => setSelectedId(null)}
          >
            <NodeRenderer
              node={data}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </div>

      {/* CSS Inspector Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <CSSInspector
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
        />

        {/* Debug Panel for Testing */}
        {selectedNode && (
          <div className="border-t border-gray-200 bg-gray-50 p-2">
            <details className="text-xs">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Debug Info (Test Panel)
              </summary>
              <div className="space-y-1 text-gray-600">
                <div>
                  <strong>Node ID:</strong> {selectedNode.id}
                </div>
                <div>
                  <strong>Node Type:</strong> {selectedNode.type}
                </div>
                <div>
                  <strong>Raw Node Data:</strong>
                </div>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedNode, null, 2)}
                </pre>
                <button
                  onClick={() => {
                    console.log('Selected Node:', selectedNode);
                    alert(
                      `Node data logged to console. Check developer tools.`
                    );
                  }}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  Log to Console
                </button>
                <button
                  onClick={() => {
                    // Test adding a property programmatically
                    handleUpdateNode(selectedNode.id, {
                      'test-property': 'test-value',
                    });
                    alert('Added test-property: test-value');
                  }}
                  className="mt-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  Test Add Property
                </button>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
