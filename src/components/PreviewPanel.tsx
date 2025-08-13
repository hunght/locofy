import React from 'react';
import { Eye } from 'lucide-react';
import NodeRenderer from './NodeRenderer';
import { PreviewPanelProps } from '../types';
import { CONSTANTS, ARIA_LABELS } from '../constants/appConstants';

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  nodeMap,
  treeData,
  selectedId,
  onSelect,
}) => {
  const rootNode = nodeMap.get('1');

  if (!rootNode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Root node not found</p>
      </div>
    );
  }

  const handleCanvasClick = () => {
    onSelect('');
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-lg flex items-center">
          <Eye size={20} className="mr-2" aria-hidden="true" />
          Canvas Preview
        </h2>
      </header>
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div
          className="relative bg-white border border-gray-300 shadow-sm"
          style={{
            width: rootNode.width,
            height: Math.max(rootNode.height, CONSTANTS.MIN_CANVAS_HEIGHT),
          }}
          onClick={handleCanvasClick}
          role="application"
          aria-label={ARIA_LABELS.CANVAS_PREVIEW}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCanvasClick();
            }
          }}
        >
          <NodeRenderer
            nodeId="1"
            nodeMap={nodeMap}
            treeData={treeData}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
