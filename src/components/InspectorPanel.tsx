import React from 'react';
import CSSInspector from './CSSInspector';
import DebugPanel from './DebugPanel';
import { InspectorPanelProps } from '../types';
import { CONSTANTS, ARIA_LABELS } from '../constants/appConstants';

const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedNode,
  treeData,
  onUpdateNode,
}) => {
  return (
    <div
      className={`${CONSTANTS.PANEL_WIDTHS.INSPECTOR} bg-white border-l border-gray-200 flex flex-col`}
      role="complementary"
      aria-label={ARIA_LABELS.CSS_INSPECTOR}
    >
      <CSSInspector selectedNode={selectedNode} onUpdateNode={onUpdateNode} />

      {selectedNode && (
        <DebugPanel
          selectedNode={selectedNode}
          treeData={treeData}
          onUpdateNode={onUpdateNode}
        />
      )}
    </div>
  );
};

export default InspectorPanel;
