import React, { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, Eye } from 'lucide-react';

type Node = {
  id: string;
  x: number;
  y: number;
  name: string;
  type: 'Div' | 'Input' | 'Image' | 'Button';
  width: number;
  height: number;
  display?: string;
  text?: string;
  background?: string;
  color?: string;
  border?: string;
  children: Node[];
  [key: string]: any; // Allow additional CSS properties
};

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
          children: []
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
          children: []
        }
      ]
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
          children: []
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
          children: []
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
              children: []
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
              children: []
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
              children: []
            }
          ]
        }
      ]
    }
  ]
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
      components.set(componentName, nodes.map(n => n.id));
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
}> = ({ node, level, selectedId, expandedNodes, components, onSelect, onToggle }) => {
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
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
    border: node.border || (isSelected ? '2px solid #3b82f6' : '1px solid transparent'),
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

const CSSInspector: React.FC<{
  selectedNode: Node | null;
  onUpdateNode: (id: string, updates: Partial<Node>) => void;
}> = ({ selectedNode, onUpdateNode }) => {
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [newPropertyName, setNewPropertyName] = useState('');
  
  const commonCSSProperties = [
    'display', 'position', 'top', 'right', 'bottom', 'left',
    'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background', 'background-color', 'background-image', 'background-size',
    'color', 'font-size', 'font-weight', 'font-family', 'line-height',
    'border', 'border-radius', 'border-top', 'border-right', 'border-bottom', 'border-left',
    'text-align', 'text-decoration', 'text-transform',
    'flex', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap',
    'grid', 'grid-template-columns', 'grid-template-rows', 'gap',
    'opacity', 'visibility', 'overflow', 'z-index', 'cursor',
    'transition', 'transform', 'box-shadow', 'outline'
  ];
  
  const displayValues = [
    'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid',
    'table', 'inline-table', 'table-cell', 'table-row', 'list-item', 'none',
    'contents', 'flow-root', 'math'
  ];
  
  if (!selectedNode) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a node to inspect its CSS properties
      </div>
    );
  }
  
  const getAllProperties = () => {
    const props: Record<string, any> = {};
    
    // Always include core properties
    props.width = `${selectedNode.width}px`;
    props.height = `${selectedNode.height}px`;
    
    // Add existing CSS properties
    if (selectedNode.background) props.background = selectedNode.background;
    if (selectedNode.color) props.color = selectedNode.color;
    if (selectedNode.border) props.border = selectedNode.border;
    if (selectedNode.display) props.display = selectedNode.display;
    
    // Add any additional properties that might exist on the node
    Object.keys(selectedNode).forEach(key => {
      if (!['id', 'x', 'y', 'name', 'type', 'width', 'height', 'children', 'text'].includes(key)) {
        const value = (selectedNode as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          props[key] = value;
        }
      }
    });
    
    return props;
  };
  
  const handlePropertyChange = (property: string, value: string) => {
    if (property === 'width' || property === 'height') {
      const numValue = parseInt(value.replace('px', '')) || 0;
      onUpdateNode(selectedNode.id, { [property]: numValue });
    } else {
      // For other properties, store them directly on the node
      const updates: any = { [property]: value || undefined };
      onUpdateNode(selectedNode.id, updates);
    }
  };
  
  const handlePropertyKeyDown = (e: React.KeyboardEvent, _property: string) => {
    if (e.key === 'Enter') {
      setEditingProperty(null);
    }
  };
  
  const addNewProperty = (propertyName?: string) => {
    const propName = propertyName || newPropertyName.trim();
    if (propName) {
      // Add the property with empty string value initially
      handlePropertyChange(propName, '');
      setNewPropertyName('');
      setShowSuggestions(false);
      // Automatically start editing the new property
      setTimeout(() => {
        setEditingProperty(propName);
      }, 100);
    }
  };
  
  const filteredSuggestions = commonCSSProperties.filter(prop => 
    prop.toLowerCase().includes(suggestionFilter.toLowerCase())
  );
  
  const properties = getAllProperties();
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900">CSS Inspector</h3>
        <div className="text-xs text-gray-600 mt-1">
          #{selectedNode.name.toLowerCase().replace(/\s+/g, '-')} &#123;
        </div>
      </div>
      
      {/* Properties List */}
      <div className="flex-1 overflow-auto font-mono text-sm">
        <div className="px-4 py-2">
          {Object.entries(properties).map(([property, value]) => (
            <div key={property} className="flex items-center py-1 group hover:bg-blue-50">
              {/* Property checkbox - always checked for existing properties */}
              <div className="w-4 h-4 mr-2 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      handlePropertyChange(property, '');
                    }
                  }}
                  className="w-3 h-3 text-blue-600"
                />
              </div>
              
              {/* Property name */}
              <span className="text-red-600 mr-1">{property}:</span>
              
              {/* Property value */}
              <div className="flex-1">
                {editingProperty === property ? (
                  <div className="relative">
                    {property === 'display' ? (
                      <select
                        value={value}
                        onChange={(e) => handlePropertyChange(property, e.target.value)}
                        onBlur={() => setEditingProperty(null)}
                        className="bg-transparent border-none outline-none text-gray-900 w-full"
                        autoFocus
                      >
                        <option value="">(empty)</option>
                        {displayValues.map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handlePropertyChange(property, e.target.value)}
                        onBlur={() => setEditingProperty(null)}
                        onKeyDown={(e) => handlePropertyKeyDown(e, property)}
                        className="bg-transparent border-none outline-none text-gray-900 w-full"
                        autoFocus
                      />
                    )}
                  </div>
                ) : (
                  <span
                    className="text-gray-900 cursor-pointer hover:bg-blue-100 px-1 -mx-1 rounded"
                    onClick={() => setEditingProperty(property)}
                  >
                    {value || <span className="text-gray-400 italic">(empty)</span>}
                  </span>
                )}
              </div>
              
              <span className="text-gray-600">;</span>
            </div>
          ))}
          
          {/* Add new property input */}
          <div className="flex items-center py-1 mt-2 border-t border-gray-100">
            <div className="w-4 h-4 mr-2 flex-shrink-0">
              <button
                onClick={() => addNewProperty()}
                disabled={!newPropertyName.trim()}
                className="w-3 h-3 text-green-600 hover:text-green-800 disabled:text-gray-300"
                title="Add property"
              >
                +
              </button>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newPropertyName}
                onChange={(e) => {
                  setNewPropertyName(e.target.value);
                  setSuggestionFilter(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPropertyName.trim()) {
                    e.preventDefault();
                    addNewProperty();
                    setShowSuggestions(false);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    setNewPropertyName('');
                  }
                }}
                onFocus={() => {
                  if (newPropertyName.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={(_e) => {
                  // Only hide suggestions if not clicking on a suggestion
                  setTimeout(() => {
                    setShowSuggestions(false);
                  }, 150);
                }}
                placeholder="property-name"
                className="w-full px-1 py-0 text-sm bg-transparent border-none outline-none focus:bg-blue-50 font-mono text-red-600"
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto z-20 mt-1">
                  {filteredSuggestions.slice(0, 8).map(suggestion => (
                    <div
                      key={suggestion}
                      className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-sm font-mono"
                      onMouseDown={(e) => {
                        // Prevent blur event from firing first
                        e.preventDefault();
                      }}
                      onClick={() => {
                        addNewProperty(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-600 text-sm">:</span>
            <span className="text-gray-400 text-sm ml-1 italic">value;</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">&#125;</div>
      </div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState<Node>(mockData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '5', '8']));
  
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
    setExpandedNodes(prev => {
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
        children: node.children.map(updateNodeRecursively)
      };
    };
    
    setData(prev => updateNodeRecursively(prev));
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Tree View Panel */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Node Tree</h2>
          <p className="text-sm text-gray-600 mt-1">
            {components.size} component{components.size !== 1 ? 's' : ''} detected
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
                <div><strong>Node ID:</strong> {selectedNode.id}</div>
                <div><strong>Node Type:</strong> {selectedNode.type}</div>
                <div><strong>Raw Node Data:</strong></div>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedNode, null, 2)}
                </pre>
                <button
                  onClick={() => {
                    console.log('Selected Node:', selectedNode);
                    alert(`Node data logged to console. Check developer tools.`);
                  }}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  Log to Console
                </button>
                <button
                  onClick={() => {
                    // Test adding a property programmatically
                    handleUpdateNode(selectedNode.id, { 'test-property': 'test-value' });
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