import { useMemo } from 'react';

export const useComponentLabel = (
  components: Map<string, string[]>,
  nodeId: string
): string | null => {
  return useMemo(() => {
    for (const [label, nodeIds] of components.entries()) {
      if (nodeIds.includes(nodeId)) {
        return label;
      }
    }
    return null;
  }, [components, nodeId]);
};
