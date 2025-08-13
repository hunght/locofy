import React from 'react';
import { NodeRendererProps, Node } from '../types';
import { excludedStyleProperties } from '../constants/cssProperties';
import { STYLING } from '../constants/appConstants';

const NodeRenderer: React.FC<NodeRendererProps> = ({
  nodeId,
  nodeMap,
  treeData,
  selectedId,
  onSelect,
}) => {
  const node = nodeMap.get(nodeId);
  const treeNode = treeData.get(nodeId);

  // Early return if node or treeNode is not found
  if (!node || !treeNode) {
    console.warn(`Node or tree data not found for ID: ${nodeId}`);
    return null;
  }

  const isSelected = selectedId === nodeId;

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
      (isSelected ? STYLING.SELECTED_BORDER : STYLING.DEFAULT_BORDER),
    cursor: 'pointer',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Apply additional CSS properties from the node
  const enhancedStyle = { ...baseStyle };
  Object.keys(node).forEach((key) => {
    if (!excludedStyleProperties.includes(key)) {
      const value = (node as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        // Convert kebab-case to camelCase for React style properties
        const camelCaseKey = key.replace(/-([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        (enhancedStyle as any)[camelCaseKey] = value;
      }
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(nodeId);
  };

  return (
    <>
      <div
        style={enhancedStyle}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`${node.type}: ${node.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(nodeId);
          }
        }}
      >
        <NodeContent node={node} />
        {isSelected && <SelectionLabel node={node} />}
      </div>
      {treeNode.children.map((childId) => (
        <NodeRenderer
          key={childId}
          nodeId={childId}
          nodeMap={nodeMap}
          treeData={treeData}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};

// Extracted component for better readability and testing
const NodeContent: React.FC<{ node: Node }> = ({ node }) => {
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
          readOnly
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

// Extracted component for selection label
const SelectionLabel: React.FC<{ node: Node }> = ({ node }) => (
  <div
    style={{
      position: 'absolute',
      top: STYLING.LABEL_POSITION_TOP,
      left: 0,
      background: STYLING.LABEL_BACKGROUND,
      color: 'white',
      padding: '2px 6px',
      fontSize: '10px',
      borderRadius: '2px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}
  >
    {node.name}
  </div>
);

export default NodeRenderer;
