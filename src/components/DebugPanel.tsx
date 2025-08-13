import React from 'react';
import { Node, TreeNode } from '../types';

interface DebugPanelProps {
  selectedNode: Node;
  treeData: Map<string, TreeNode>;
  onUpdateNode: (id: string, updates: Partial<Node>) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  selectedNode,
  treeData,
  onUpdateNode,
}) => {
  const handleLogToConsole = () => {
    console.log('Selected Node:', selectedNode);
    console.log('Tree Structure:', treeData.get(selectedNode.id));
    alert('Node data logged to console. Check developer tools.');
  };

  const handleTestAddProperty = () => {
    onUpdateNode(selectedNode.id, {
      'test-property': 'test-value',
    });
    alert('Added test-property: test-value');
  };

  return (
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
            <strong>Children IDs:</strong>{' '}
            {JSON.stringify(treeData.get(selectedNode.id)?.children || [])}
          </div>
          <div>
            <strong>Raw Node Data:</strong>
          </div>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(selectedNode, null, 2)}
          </pre>
          <div className="flex gap-1 mt-2">
            <button
              onClick={handleLogToConsole}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              type="button"
            >
              Log to Console
            </button>
            <button
              onClick={handleTestAddProperty}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
              type="button"
            >
              Test Add Property
            </button>
          </div>
        </div>
      </details>
    </div>
  );
};

export default DebugPanel;
