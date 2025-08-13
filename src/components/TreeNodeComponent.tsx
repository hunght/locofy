import React, { useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TreeNodeProps } from '../types';
import { CONSTANTS, ARIA_LABELS } from '../constants/appConstants';

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  nodeId,
  nodeMap,
  treeData,
  level,
  selectedId,
  expandedNodes,
  components,
  onSelect,
  onToggle,
}) => {
  const node = nodeMap.get(nodeId);
  const treeNode = treeData.get(nodeId);

  // Early return if node or treeNode is not found
  if (!node || !treeNode) {
    console.warn(`Node or tree data not found for ID: ${nodeId}`);
    return null;
  }

  const isSelected = selectedId === nodeId;
  const isExpanded = expandedNodes.has(nodeId);
  const hasChildren = treeNode.children.length > 0;
  
  // Simple inline component label lookup instead of unnecessary hook wrapper
  const componentLabel = useMemo(() => {
    for (const [label, nodeIds] of components.entries()) {
      if (nodeIds.includes(nodeId)) {
        return label;
      }
    }
    return null;
  }, [components, nodeId]);

  const handleNodeClick = () => {
    onSelect(nodeId);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(nodeId);
  };

  const paddingLeft =
    level * CONSTANTS.INDENTATION_STEP + CONSTANTS.BASE_PADDING;

  return (
    <div>
      <div
        className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors ${
          isSelected ? 'bg-blue-100 border-l-2 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleNodeClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={`${node.type} ${node.name}${
          componentLabel ? ` (${componentLabel})` : ''
        }`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNodeClick();
          } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
            e.preventDefault();
            onToggle(nodeId);
          } else if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
            e.preventDefault();
            onToggle(nodeId);
          }
        }}
      >
        {hasChildren && (
          <button
            onClick={handleToggleClick}
            className="mr-1 p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={ARIA_LABELS.EXPAND_COLLAPSE}
            tabIndex={-1}
          >
            {isExpanded ? (
              <ChevronDown size={CONSTANTS.ICON_SIZE} />
            ) : (
              <ChevronRight size={CONSTANTS.ICON_SIZE} />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        <span className="text-xs px-1 py-0.5 bg-gray-200 rounded mr-2 font-mono">
          {node.type}
        </span>

        {componentLabel && (
          <span className="text-xs px-1 py-0.5 bg-green-200 text-green-800 rounded mr-2 font-medium">
            {componentLabel}
          </span>
        )}

        <span className="flex-1 truncate" title={node.name}>
          {node.name}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {treeNode.children.map((childId) => (
            <TreeNodeComponent
              key={childId}
              nodeId={childId}
              nodeMap={nodeMap}
              treeData={treeData}
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

export default TreeNodeComponent;
