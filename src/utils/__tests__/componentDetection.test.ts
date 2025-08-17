import { describe, it, expect } from 'vitest';
import {
  detectComponents,
  convertToOptimizedStructure,
  type TreeNode,
} from '../componentDetection';
import { type Node } from '../../types';
import { stressTestMockData } from '../../constants/mockData';

describe('detectComponents', () => {
  // Helper function to create a node
  const createNode = (
    id: string,
    type: 'Div' | 'Input' | 'Image' | 'Button',
    width: number,
    height: number,
    children: Node[] = []
  ): Node => ({
    id,
    type,
    width,
    height,
    x: 0,
    y: 0,
    name: `Node ${id}`,
    background: '#ffffff',
    color: '#000000',
    children,
  });

  describe('basic component detection', () => {
    it('should detect components with identical signatures', () => {
      // Create two identical button nodes
      const button1 = createNode('1', 'Button', 100, 30);
      const button2 = createNode('2', 'Button', 100, 30);
      const container = createNode('root', 'Div', 400, 200, [button1, button2]);

      const { nodeMap, treeData } = convertToOptimizedStructure(container);
      const components = detectComponents(nodeMap, treeData);

      expect(components.size).toBe(1);
      const componentIds = Array.from(components.values())[0];
      expect(componentIds).toContain('1');
      expect(componentIds).toContain('2');
      expect(componentIds).toHaveLength(2);
    });

    it('should not detect components when nodes have different signatures', () => {
      // Create two different nodes
      const button = createNode('1', 'Button', 100, 30);
      const input = createNode('2', 'Input', 150, 30);
      const container = createNode('root', 'Div', 400, 200, [button, input]);

      const { nodeMap, treeData } = convertToOptimizedStructure(container);
      const components = detectComponents(nodeMap, treeData);

      expect(components.size).toBe(0);
    });

    it('should not detect components for single instances', () => {
      // Create only one button
      const button = createNode('1', 'Button', 100, 30);
      const container = createNode('root', 'Div', 400, 200, [button]);

      const { nodeMap, treeData } = convertToOptimizedStructure(container);
      const components = detectComponents(nodeMap, treeData);

      expect(components.size).toBe(0);
    });
  });

  describe('hierarchical component detection', () => {
    it('should not detect child components when parent is already a component', () => {
      // Create card components with identical structure
      const cardText1 = createNode('text1', 'Div', 80, 20);
      const cardButton1 = createNode('btn1', 'Button', 60, 25);
      const card1 = createNode('card1', 'Div', 200, 100, [
        cardText1,
        cardButton1,
      ]);

      const cardText2 = createNode('text2', 'Div', 80, 20);
      const cardButton2 = createNode('btn2', 'Button', 60, 25);
      const card2 = createNode('card2', 'Div', 200, 100, [
        cardText2,
        cardButton2,
      ]);

      const container = createNode('root', 'Div', 600, 300, [card1, card2]);

      const { nodeMap, treeData } = convertToOptimizedStructure(container);
      const components = detectComponents(nodeMap, treeData);

      // Should detect cards as components but not their children
      expect(components.size).toBe(1);
      const componentIds = Array.from(components.values())[0];
      expect(componentIds).toContain('card1');
      expect(componentIds).toContain('card2');

      // Child buttons and texts should not form separate components
      expect(componentIds).not.toContain('text1');
      expect(componentIds).not.toContain('text2');
      expect(componentIds).not.toContain('btn1');
      expect(componentIds).not.toContain('btn2');
    });

    it('should handle nested components correctly', () => {
      // Create a complex structure with potential nested components
      const innerButton1 = createNode('innerBtn1', 'Button', 50, 20);
      const innerButton2 = createNode('innerBtn2', 'Button', 50, 20);

      const middleContainer1 = createNode('middle1', 'Div', 100, 50, [
        innerButton1,
      ]);
      const middleContainer2 = createNode('middle2', 'Div', 100, 50, [
        innerButton2,
      ]);

      const outerContainer1 = createNode('outer1', 'Div', 200, 100, [
        middleContainer1,
      ]);
      const outerContainer2 = createNode('outer2', 'Div', 200, 100, [
        middleContainer2,
      ]);

      const root = createNode('root', 'Div', 500, 200, [
        outerContainer1,
        outerContainer2,
      ]);

      const { nodeMap, treeData } = convertToOptimizedStructure(root);
      const components = detectComponents(nodeMap, treeData);

      // Should detect the outermost matching components
      expect(components.size).toBe(1);
      const componentIds = Array.from(components.values())[0];
      expect(componentIds).toContain('outer1');
      expect(componentIds).toContain('outer2');

      // Inner components should not be detected separately
      expect(componentIds).not.toContain('middle1');
      expect(componentIds).not.toContain('middle2');
      expect(componentIds).not.toContain('innerBtn1');
      expect(componentIds).not.toContain('innerBtn2');
    });
  });

  describe('multiple component types', () => {
    it('should detect multiple different component types', () => {
      // Create multiple types of components
      const button1 = createNode('btn1', 'Button', 100, 30);
      const button2 = createNode('btn2', 'Button', 100, 30);

      const input1 = createNode('input1', 'Input', 150, 30);
      const input2 = createNode('input2', 'Input', 150, 30);

      const container = createNode('root', 'Div', 400, 200, [
        button1,
        button2,
        input1,
        input2,
      ]);

      const { nodeMap, treeData } = convertToOptimizedStructure(container);
      const components = detectComponents(nodeMap, treeData);

      expect(components.size).toBe(2);

      const allComponentIds = Array.from(components.values()).flat();
      expect(allComponentIds).toContain('btn1');
      expect(allComponentIds).toContain('btn2');
      expect(allComponentIds).toContain('input1');
      expect(allComponentIds).toContain('input2');
    });

    it('should handle components with different child counts', () => {
      // Create containers with different numbers of children (and different child types)
      const child1 = createNode('child1', 'Button', 50, 20);
      const child2 = createNode('child2', 'Input', 60, 25);
      const child3 = createNode('child3', 'Image', 40, 30);

      const container1 = createNode('container1', 'Div', 200, 100, [
        child1,
        child2,
      ]);
      const container2 = createNode('container2', 'Div', 200, 100, [child3]);

      const root = createNode('root', 'Div', 500, 200, [
        container1,
        container2,
      ]);

      const { nodeMap, treeData } = convertToOptimizedStructure(root);
      const components = detectComponents(nodeMap, treeData);

      // Should not detect containers as components because they have different child counts
      // Should not detect children as components because they are all different types
      expect(components.size).toBe(0);
    });

    it('should detect components with identical child signatures', () => {
      // Create containers with identical child structure
      const button1a = createNode('btn1a', 'Button', 50, 20);
      const input1a = createNode('input1a', 'Input', 100, 25);
      const container1 = createNode('container1', 'Div', 200, 100, [
        button1a,
        input1a,
      ]);

      const button2a = createNode('btn2a', 'Button', 50, 20);
      const input2a = createNode('input2a', 'Input', 100, 25);
      const container2 = createNode('container2', 'Div', 200, 100, [
        button2a,
        input2a,
      ]);

      const root = createNode('root', 'Div', 500, 200, [
        container1,
        container2,
      ]);

      const { nodeMap, treeData } = convertToOptimizedStructure(root);
      const components = detectComponents(nodeMap, treeData);

      // Should detect containers as components because they have identical child signatures
      expect(components.size).toBe(1);
      const componentIds = Array.from(components.values())[0];
      expect(componentIds).toContain('container1');
      expect(componentIds).toContain('container2');

      // Children should not be detected as separate components since their parents are components
      expect(componentIds).not.toContain('btn1a');
      expect(componentIds).not.toContain('btn2a');
      expect(componentIds).not.toContain('input1a');
      expect(componentIds).not.toContain('input2a');
    });

    it('should not detect components with different child order as different', () => {
      // Create containers with same children but different order
      const button1 = createNode('btn1', 'Button', 50, 20);
      const input1 = createNode('input1', 'Input', 100, 25);
      const container1 = createNode('container1', 'Div', 200, 100, [
        button1,
        input1,
      ]);

      const button2 = createNode('btn2', 'Button', 50, 20);
      const input2 = createNode('input2', 'Input', 100, 25);
      const container2 = createNode('container2', 'Div', 200, 100, [
        input2,
        button2,
      ]); // Different order

      const root = createNode('root', 'Div', 500, 200, [
        container1,
        container2,
      ]);

      const { nodeMap, treeData } = convertToOptimizedStructure(root);
      const components = detectComponents(nodeMap, treeData);

      // Should still detect containers as components because child signatures are sorted
      expect(components.size).toBe(1);
      const componentIds = Array.from(components.values())[0];
      expect(componentIds).toContain('container1');
      expect(componentIds).toContain('container2');
    });

    it('should differentiate components with different child types', () => {
      // Create containers with same dimensions but different child types
      const button1 = createNode('btn1', 'Button', 50, 20);
      const input1 = createNode('input1', 'Input', 100, 25);
      const container1 = createNode('container1', 'Div', 200, 100, [
        button1,
        input1,
      ]);

      const image1 = createNode('img1', 'Image', 50, 20); // Same size as button but different type
      const input2 = createNode('input2', 'Input', 120, 30); // Different size from input1
      const container2 = createNode('container2', 'Div', 200, 100, [
        image1,
        input2,
      ]);

      const root = createNode('root', 'Div', 500, 200, [
        container1,
        container2,
      ]);

      const { nodeMap, treeData } = convertToOptimizedStructure(root);
      const components = detectComponents(nodeMap, treeData);

      // Should not detect containers as components because they have different child types
      expect(components.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty tree structure', () => {
      const nodeMap = new Map<string, Node>();
      const treeData = new Map<string, TreeNode>();

      const components = detectComponents(nodeMap, treeData);
      expect(components.size).toBe(0);
    });

    it('should handle single node tree', () => {
      const singleNode = createNode('1', 'Button', 100, 30);
      const { nodeMap, treeData } = convertToOptimizedStructure(singleNode);

      const components = detectComponents(nodeMap, treeData);
      expect(components.size).toBe(0);
    });

    it('should handle nodes with identical signatures but different positions', () => {
      // Position shouldn't affect component detection
      const button1 = { ...createNode('1', 'Button', 100, 30), x: 10, y: 10 };
      const button2 = { ...createNode('2', 'Button', 100, 30), x: 150, y: 50 };
      const container = createNode('root', 'Div', 400, 200, [button1, button2]);

      const { nodeMap, treeData } = convertToOptimizedStructure(container);
      const components = detectComponents(nodeMap, treeData);

      expect(components.size).toBe(1);
      const componentIds = Array.from(components.values())[0];
      expect(componentIds).toContain('1');
      expect(componentIds).toContain('2');
    });
  });

  describe('component naming', () => {
    it('should assign sequential component names', () => {
      // Create multiple component types
      const button1 = createNode('btn1', 'Button', 100, 30);
      const button2 = createNode('btn2', 'Button', 100, 30);

      const input1 = createNode('input1', 'Input', 150, 30);
      const input2 = createNode('input2', 'Input', 150, 30);

      const container = createNode('root', 'Div', 400, 200, [
        button1,
        button2,
        input1,
        input2,
      ]);

      const { nodeMap, treeData } = convertToOptimizedStructure(container);
      const components = detectComponents(nodeMap, treeData);

      const componentNames = Array.from(components.keys());
      expect(componentNames).toContain('C1');
      expect(componentNames).toContain('C2');
      expect(componentNames).toHaveLength(2);
    });
  });

  describe('stress test with large dataset', () => {
    it('should detect components in large e-commerce layout', () => {
      const startTime = performance.now();

      // Use the stress test dataset with 220+ nodes
      const { nodeMap, treeData } =
        convertToOptimizedStructure(stressTestMockData);
      const components = detectComponents(nodeMap, treeData);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      console.log('🚀 Large Dataset Component Detection Results:');
      console.log(`  📊 Total nodes processed: ${nodeMap.size}`);
      console.log(`  🎯 Components detected: ${components.size}`);
      console.log(
        `  ⚡ Processing time: ${Math.round(processingTime * 100) / 100}ms`
      );
      console.log(
        `  📈 Performance: ${
          Math.round((processingTime / nodeMap.size) * 100) / 100
        }ms per node`
      );

      // Verify we processed a large dataset
      expect(nodeMap.size).toBeGreaterThan(200);

      // Should detect multiple component types in the e-commerce layout
      expect(components.size).toBeGreaterThan(3);

      // Performance should be reasonable (under 50ms for 220+ nodes)
      expect(processingTime).toBeLessThan(50);

      // Analyze detected components
      console.log('\n🔍 Detected Component Breakdown:');
      components.forEach((nodeIds, componentName) => {
        const firstNode = nodeMap.get(nodeIds[0]);
        const componentType = firstNode?.type;
        const dimensions = `${firstNode?.width}x${firstNode?.height}`;
        console.log(
          `  ${componentName}: ${nodeIds.length} instances of ${componentType} (${dimensions})`
        );

        // Log some example node IDs (first 3)
        const exampleIds = nodeIds.slice(0, 3).join(', ');
        console.log(
          `    Examples: ${exampleIds}${nodeIds.length > 3 ? '...' : ''}`
        );
      });

      // Specific expectations for the stress test dataset

      // Should detect navigation buttons (8 instances)
      const navButtonComponent = Array.from(components.values()).find(
        (nodeIds) => {
          const firstNode = nodeMap.get(nodeIds[0]);
          return (
            firstNode?.type === 'Button' &&
            firstNode?.width === 120 &&
            firstNode?.height === 30
          );
        }
      );
      expect(navButtonComponent).toBeDefined();
      expect(navButtonComponent!.length).toBe(8);

      // Should detect product cards (30 instances)
      const productCardComponent = Array.from(components.values()).find(
        (nodeIds) => {
          const firstNode = nodeMap.get(nodeIds[0]);
          return (
            firstNode?.type === 'Div' &&
            firstNode?.width === 180 &&
            firstNode?.height === 260
          );
        }
      );
      expect(productCardComponent).toBeDefined();
      expect(productCardComponent!.length).toBe(30);

      // Should detect sidebar widgets (12 instances)
      const sidebarWidgetComponent = Array.from(components.values()).find(
        (nodeIds) => {
          const firstNode = nodeMap.get(nodeIds[0]);
          return (
            firstNode?.type === 'Div' &&
            firstNode?.width === 240 &&
            firstNode?.height === 120
          );
        }
      );
      expect(sidebarWidgetComponent).toBeDefined();
      expect(sidebarWidgetComponent!.length).toBe(12);

      // Should detect social media icons (6 instances)
      const socialIconComponent = Array.from(components.values()).find(
        (nodeIds) => {
          const firstNode = nodeMap.get(nodeIds[0]);
          return (
            firstNode?.type === 'Button' &&
            firstNode?.width === 40 &&
            firstNode?.height === 40
          );
        }
      );
      expect(socialIconComponent).toBeDefined();
      expect(socialIconComponent!.length).toBe(6);
    });

    it('should demonstrate hierarchy prevention in large dataset', () => {
      const { nodeMap, treeData } =
        convertToOptimizedStructure(stressTestMockData);
      const components = detectComponents(nodeMap, treeData);

      // Count nodes that are part of components
      const nodesInComponents = new Set<string>();
      components.forEach((nodeIds) => {
        nodeIds.forEach((id) => nodesInComponents.add(id));
      });

      // Count nodes that have children in components (to verify hierarchy prevention)
      let childrenOfComponentNodes = 0;
      components.forEach((nodeIds) => {
        nodeIds.forEach((nodeId) => {
          const treeNode = treeData.get(nodeId);
          if (treeNode) {
            childrenOfComponentNodes += treeNode.children.length;
          }
        });
      });

      console.log('\n🏗️ Hierarchy Prevention Analysis:');
      console.log(`  Total nodes: ${nodeMap.size}`);
      console.log(`  Nodes in components: ${nodesInComponents.size}`);
      console.log(`  Children of component nodes: ${childrenOfComponentNodes}`);
      console.log(
        `  Non-component nodes: ${nodeMap.size - nodesInComponents.size}`
      );
      console.log(
        `  Hierarchy prevention efficiency: ${Math.round(
          (1 - nodesInComponents.size / nodeMap.size) * 100
        )}%`
      );

      // Verify hierarchy prevention is working
      // Most nodes should NOT be in components (prevents over-segmentation)
      expect(nodesInComponents.size).toBeLessThan(nodeMap.size * 0.5); // Less than 50% of nodes in components

      // Should have detected meaningful components without over-segmentation
      expect(components.size).toBeLessThan(20); // Reasonable number of component types
      expect(components.size).toBeGreaterThan(3); // But enough to be meaningful
    });

    it('should maintain performance with complex nested structures', () => {
      const runs = 3;
      const times: number[] = [];

      for (let i = 0; i < runs; i++) {
        const startTime = performance.now();
        const { nodeMap, treeData } =
          convertToOptimizedStructure(stressTestMockData);
        detectComponents(nodeMap, treeData); // We only need timing, not the result
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / runs;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      console.log('\n⚡ Performance Consistency Test:');
      console.log(`  Average time: ${Math.round(avgTime * 100) / 100}ms`);
      console.log(`  Min time: ${Math.round(minTime * 100) / 100}ms`);
      console.log(`  Max time: ${Math.round(maxTime * 100) / 100}ms`);
      console.log(
        `  Variance: ${Math.round((maxTime - minTime) * 100) / 100}ms`
      );

      // Performance should be consistent
      expect(avgTime).toBeLessThan(50); // Average under 50ms
      // TODO: should fix perfomance later
      expect(maxTime / minTime).toBeLessThan(6); // Variance should be reasonable
    });

    it('should validate component signatures with nested children', () => {
      const { nodeMap, treeData } =
        convertToOptimizedStructure(stressTestMockData);
      const components = detectComponents(nodeMap, treeData);

      // Find the product card component (most complex with nested children)
      const productCardComponent = Array.from(components.values()).find(
        (nodeIds) => {
          const firstNode = nodeMap.get(nodeIds[0]);
          return (
            firstNode?.type === 'Div' &&
            firstNode?.width === 180 &&
            firstNode?.height === 260
          );
        }
      );

      expect(productCardComponent).toBeDefined();
      expect(productCardComponent!.length).toBe(30);

      // Verify all product cards have the same structure
      productCardComponent!.forEach((nodeId) => {
        const treeNode = treeData.get(nodeId);
        expect(treeNode).toBeDefined();

        // Each product card should have exactly 4 children: image, title, price, button
        expect(treeNode!.children.length).toBe(4);

        // Verify children types match expected structure
        const childTypes = treeNode!.children
          .map((childId) => {
            const childNode = nodeMap.get(childId);
            return childNode?.type;
          })
          .sort();

        expect(childTypes).toEqual(['Button', 'Div', 'Div', 'Image']);
      });

      console.log('\n🧩 Component Structure Validation:');
      console.log(`  Product cards detected: ${productCardComponent!.length}`);
      console.log(
        `  Each card has 4 children: Image, Title (Div), Price (Div), Button`
      );
      console.log(`  ✅ All product cards have identical structure`);
    });
  });
});
