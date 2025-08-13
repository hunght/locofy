import React, { useState, useMemo } from 'react';
import {
  detectComponents,
  convertToOptimizedStructure,
} from './utils/componentDetection';
import { mockData } from './constants/mockData';
import { Node } from './types';
import { useTreeState, useNodeUpdate } from './hooks/useAppState';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import TreeViewPanel from './components/TreeViewPanel';
import PreviewPanel from './components/PreviewPanel';
import InspectorPanel from './components/InspectorPanel';

const App: React.FC = () => {
  // Initialize optimized state structure
  const { nodeMap: initialNodeMap, treeData } = useMemo(
    () => convertToOptimizedStructure(mockData),
    []
  );

  const [nodeMap, setNodeMap] = useState<Map<string, Node>>(initialNodeMap);

  // Custom hooks for state management
  const {
    selectedId,
    expandedNodes,
    handleSelect,
    handleToggle,
    clearSelection,
  } = useTreeState();
  const { handleUpdateNode } = useNodeUpdate(setNodeMap);

  // Simple inline memoization instead of unnecessary hook wrapper
  const selectedNode = useMemo(() => {
    return selectedId ? nodeMap.get(selectedId) || null : null;
  }, [nodeMap, selectedId]);

  // Memoized computed values
  const components = useMemo(
    () => detectComponents(nodeMap, treeData),
    [nodeMap, treeData]
  );

  const handleSelection = (id: string) => {
    if (id === '') {
      clearSelection();
    } else {
      handleSelect(id);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        <ErrorBoundary
          fallback={<div className="w-80 bg-red-50 p-4">Tree view error</div>}
        >
          <TreeViewPanel
            nodeMap={nodeMap}
            treeData={treeData}
            selectedId={selectedId}
            expandedNodes={expandedNodes}
            components={components}
            onSelect={handleSelection}
            onToggle={handleToggle}
          />
        </ErrorBoundary>

        <ErrorBoundary
          fallback={<div className="flex-1 bg-red-50 p-4">Preview error</div>}
        >
          <PreviewPanel
            nodeMap={nodeMap}
            treeData={treeData}
            selectedId={selectedId}
            onSelect={handleSelection}
          />
        </ErrorBoundary>

        <ErrorBoundary
          fallback={<div className="w-80 bg-red-50 p-4">Inspector error</div>}
        >
          <InspectorPanel
            selectedNode={selectedNode}
            treeData={treeData}
            onUpdateNode={handleUpdateNode}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default App;
