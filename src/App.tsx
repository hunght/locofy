import React, { useState, useMemo, useCallback } from 'react';
import { convertToOptimizedStructure } from './utils/componentDetection';
import { groupSimilarNodesFromTree } from './utils/groupingComponent';

import { Node } from './types';
import { useTreeState } from './hooks/useAppState';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import TreeViewPanel from './components/TreeViewPanel';
import PreviewPanel from './components/PreviewPanel';
import InspectorPanel from './components/InspectorPanel';
import { groupingDemoMockData } from './constants/groupingDemoMockData';

const App: React.FC = () => {
  // Initialize optimized state structure
  const { nodeMap: initialNodeMap, treeData } = useMemo(
    () => convertToOptimizedStructure(groupingDemoMockData),
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

  // Simple inline node update logic instead of unnecessary hook wrapper
  const handleUpdateNode = useCallback(
    (id: string, updates: Partial<Node>) => {
      setNodeMap((prevNodeMap) => {
        const newNodeMap = new Map(prevNodeMap);
        const existingNode = newNodeMap.get(id);

        if (existingNode) {
          newNodeMap.set(id, { ...existingNode, ...updates });
        } else {
          console.warn(`Node with ID ${id} not found for update.`);
        }

        return newNodeMap;
      });
    },
    [setNodeMap]
  );

  // Simple inline memoization instead of unnecessary hook wrapper
  const selectedNode = useMemo(() => {
    return selectedId ? nodeMap.get(selectedId) || null : null;
  }, [nodeMap, selectedId]);

  // Memoized computed values using new functional grouping approach
  const components = useMemo(() => {
    const nodeGroups = groupSimilarNodesFromTree(groupingDemoMockData);

    // Convert NodeGroup[] to Map<string, string[]> format expected by UI
    const componentsMap = new Map<string, string[]>();
    nodeGroups.forEach((group, index) => {
      const componentName = `${group.pattern}-${index + 1}`;
      const nodeIds = group.nodes.map((node) => node.id);
      componentsMap.set(componentName, nodeIds);
    });

    return componentsMap;
  }, []);

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
