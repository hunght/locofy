import { useState, useCallback } from 'react';
import { Node } from '../types';
import { CONSTANTS } from '../constants/appConstants';

export interface UseTreeStateReturn {
  selectedId: string | null;
  expandedNodes: Set<string>;
  handleSelect: (id: string) => void;
  handleToggle: (id: string) => void;
  clearSelection: () => void;
}

export const useTreeState = (): UseTreeStateReturn => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(CONSTANTS.INITIAL_EXPANDED_NODES)
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

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

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  return {
    selectedId,
    expandedNodes,
    handleSelect,
    handleToggle,
    clearSelection,
  };
};

export interface UseNodeUpdateReturn {
  handleUpdateNode: (id: string, updates: Partial<Node>) => void;
}

export const useNodeUpdate = (
  setNodeMap: React.Dispatch<React.SetStateAction<Map<string, Node>>>
): UseNodeUpdateReturn => {
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

  return { handleUpdateNode };
};
