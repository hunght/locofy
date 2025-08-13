import React from 'react';
import TreeNodeComponent from './TreeNodeComponent';
import { TreeViewPanelProps } from '../types';
import { CONSTANTS, ARIA_LABELS } from '../constants/appConstants';

const TreeViewPanel: React.FC<TreeViewPanelProps> = ({
  nodeMap,
  treeData,
  selectedId,
  expandedNodes,
  components,
  onSelect,
  onToggle,
}) => {
  const componentCount = components.size;
  const componentText = componentCount === 1 ? 'component' : 'components';

  return (
    <div
      className={`${CONSTANTS.PANEL_WIDTHS.TREE_VIEW} bg-white border-r border-gray-200 flex flex-col`}
    >
      <header className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Node Tree</h2>
        <p className="text-sm text-gray-600 mt-1" aria-live="polite">
          {componentCount} {componentText} detected
        </p>
      </header>
      <div
        className="flex-1 overflow-auto"
        role="tree"
        aria-label={ARIA_LABELS.TREE_VIEW}
      >
        <TreeNodeComponent
          nodeId="1"
          nodeMap={nodeMap}
          treeData={treeData}
          level={0}
          selectedId={selectedId}
          expandedNodes={expandedNodes}
          components={components}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      </div>
    </div>
  );
};

export default TreeViewPanel;
