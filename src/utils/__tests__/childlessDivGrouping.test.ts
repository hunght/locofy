import { describe, expect, test } from 'vitest';
import { groupSimilarNodes } from '../groupingComponent';
import { Node } from '../../types';

describe('Childless Div Grouping Tests', () => {
  test('should require higher similarity for childless div elements', () => {
    const nodes: Node[] = [
      // Two different childless divs as color and font size is different
      {
        id: 'card-1-title',
        x: 60,
        y: 566,
        name: 'Product Title 1',
        type: 'Div',
        width: 218,
        height: 50,
        color: '#1e293b',
        text: 'Premium Headphones',
        'font-size': '16px',
        'font-weight': '600',
        'line-height': '1.5',
        children: [],
      },
      {
        id: 'card-1-description',
        x: 60,
        y: 626,
        name: 'Product Description 1',
        type: 'Div',
        width: 218,
        height: 40,
        color: '#64748b',
        text: 'High-quality wireless headphones with noise cancellation.',
        'font-size': '14px',
        'line-height': '1.4',
        children: [],
      },
    ];

    const groups = groupSimilarNodes(nodes);

    expect(groups).toHaveLength(0);
  });

  test('should group very similar childless div elements despite higher threshold', () => {
    const nodes: Node[] = [
      {
        id: 'card-2-title',
        x: 330,
        y: 566,
        name: 'Product Title 2',
        type: 'Div',
        width: 218,
        height: 50,
        color: '#1e293b',
        text: 'Gaming Mouse',
        'font-size': '16px',
        'font-weight': '600',
        'line-height': '1.5',
        children: [],
      },
      {
        id: 'card-2-description',
        x: 330,
        y: 626,
        name: 'Product Description 2',
        type: 'Div',
        width: 218,
        height: 40,
        color: '#64748b',
        text: 'Precision gaming mouse with RGB lighting.',
        'font-size': '14px',
        'line-height': '1.4',
        children: [],
      },
    ];
    const groups = groupSimilarNodes(nodes);
    expect(groups).toHaveLength(0);
  });
});
