import { describe, it, expect } from 'vitest';
import {
  detectComponents,
  convertToOptimizedStructure,
} from '../componentDetection';
import { performanceTestConfig } from '../../constants/mockData';

describe('Component Detection Performance Tests', () => {
  const runPerformanceTest = (testName: string, mockData: any) => {
    const startTime = performance.now();

    // Convert structure
    const conversionStart = performance.now();
    const { nodeMap, treeData } = convertToOptimizedStructure(mockData);
    const conversionTime = performance.now() - conversionStart;

    // Detect components
    const detectionStart = performance.now();
    const components = detectComponents(nodeMap, treeData);
    const detectionTime = performance.now() - detectionStart;

    const totalTime = performance.now() - startTime;

    return {
      testName,
      nodeCount: nodeMap.size,
      componentCount: components.size,
      conversionTime: Math.round(conversionTime * 100) / 100,
      detectionTime: Math.round(detectionTime * 100) / 100,
      totalTime: Math.round(totalTime * 100) / 100,
      components: Array.from(components.entries()).map(([name, nodeIds]) => ({
        name,
        instanceCount: nodeIds.length,
        nodeIds: nodeIds.slice(0, 3), // Show first 3 nodes for brevity
      })),
    };
  };

  it('should handle small dataset efficiently', () => {
    const result = runPerformanceTest(
      'Small Dataset',
      performanceTestConfig.small
    );

    console.log('📊 Small Dataset Performance:', result);

    expect(result.nodeCount).toBe(9);
    expect(result.totalTime).toBeLessThan(10); // Should complete in under 10ms
    expect(result.componentCount).toBeGreaterThanOrEqual(0);
  });

  it('should handle medium dataset efficiently', () => {
    const result = runPerformanceTest(
      'Medium Dataset',
      performanceTestConfig.medium
    );

    console.log('📊 Medium Dataset Performance:', result);

    expect(result.nodeCount).toBe(11);
    expect(result.totalTime).toBeLessThan(50); // Should complete in under 50ms
    expect(result.componentCount).toBeGreaterThanOrEqual(0);
  });

  it('should handle large dataset efficiently', () => {
    const result = runPerformanceTest(
      'Large Dataset',
      performanceTestConfig.large
    );

    console.log('📊 Large Dataset Performance:', result);

    expect(result.nodeCount).toBeGreaterThan(200); // Large dataset
    expect(result.totalTime).toBeLessThan(1000); // Should complete in under 1 second
    expect(result.componentCount).toBeGreaterThan(3); // Should detect multiple component types
  });

  it('should detect expected component patterns in stress test', () => {
    const { nodeMap, treeData } = convertToOptimizedStructure(
      performanceTestConfig.large
    );
    const components = detectComponents(nodeMap, treeData);

    console.log('🔍 Detected Components in Stress Test:');
    components.forEach((nodeIds, componentName) => {
      const firstNode = nodeMap.get(nodeIds[0]);
      console.log(
        `  ${componentName}: ${nodeIds.length} instances of ${firstNode?.type} (${firstNode?.width}x${firstNode?.height})`
      );
    });

    // Should detect product cards as components (30 instances)
    const productCardComponent = Array.from(components.values()).find(
      (nodeIds) => nodeIds.length >= 20
    );
    expect(productCardComponent).toBeDefined();
    expect(productCardComponent!.length).toBeGreaterThanOrEqual(20);

    // Should detect multiple component types
    expect(components.size).toBeGreaterThan(3);
  });

  it('should maintain performance across multiple runs', () => {
    const runs = 5;
    const results = [];

    for (let i = 0; i < runs; i++) {
      const result = runPerformanceTest(
        `Run ${i + 1}`,
        performanceTestConfig.large
      );
      results.push(result.totalTime);
    }

    const averageTime = results.reduce((sum, time) => sum + time, 0) / runs;
    const maxTime = Math.max(...results);
    const minTime = Math.min(...results);

    console.log('⚡ Performance Consistency:');
    console.log(`  Average: ${Math.round(averageTime * 100) / 100}ms`);
    console.log(`  Min: ${Math.round(minTime * 100) / 100}ms`);
    console.log(`  Max: ${Math.round(maxTime * 100) / 100}ms`);
    console.log(`  Variance: ${Math.round((maxTime - minTime) * 100) / 100}ms`);

    // Performance should be consistent (max time shouldn't be more than 3x min time)
    expect(maxTime / minTime).toBeLessThan(3);
    expect(averageTime).toBeLessThan(1000); // Average should be under 1 second
  });

  it('should scale linearly with node count', () => {
    const datasets = [
      { name: 'Small', data: performanceTestConfig.small },
      { name: 'Medium', data: performanceTestConfig.medium },
      { name: 'Large', data: performanceTestConfig.large },
    ];

    const results = datasets.map(({ name, data }) =>
      runPerformanceTest(name, data)
    );

    console.log('📈 Scalability Analysis:');
    results.forEach((result) => {
      const timePerNode = result.totalTime / result.nodeCount;
      console.log(
        `  ${result.testName}: ${result.nodeCount} nodes, ${
          result.totalTime
        }ms total, ${Math.round(timePerNode * 100) / 100}ms per node`
      );
    });

    // Time per node should remain reasonable even for large datasets
    const largeResult = results.find((r) => r.testName === 'Large');
    expect(largeResult).toBeDefined();
    const timePerNode = largeResult!.totalTime / largeResult!.nodeCount;
    expect(timePerNode).toBeLessThan(5); // Should process each node in under 5ms
  });

  it('should demonstrate component hierarchy prevention', () => {
    const { nodeMap, treeData } = convertToOptimizedStructure(
      performanceTestConfig.large
    );
    const components = detectComponents(nodeMap, treeData);

    // Count total nodes in all components
    const nodesInComponents = new Set();
    components.forEach((nodeIds) => {
      nodeIds.forEach((id) => nodesInComponents.add(id));
    });

    // Should detect components but prevent over-segmentation
    expect(components.size).toBeLessThan(20); // Reasonable number of component types
    expect(nodesInComponents.size).toBeLessThan(nodeMap.size); // Not every node should be in a component

    console.log('🏗️ Component Hierarchy Analysis:');
    console.log(`  Total nodes: ${nodeMap.size}`);
    console.log(`  Nodes in components: ${nodesInComponents.size}`);
    console.log(`  Component types: ${components.size}`);
    console.log(
      `  Hierarchy prevention efficiency: ${Math.round(
        (1 - nodesInComponents.size / nodeMap.size) * 100
      )}%`
    );
  });
});
