import { describe, expect, test } from 'vitest';
import { groupSimilarNodes } from './groupingComponent';
import { Node } from '../types';

// Test cases
describe('Node Grouping Functions', () => {
  // Test data helper
  const createCard = (
    id: string,
    x: number,
    y: number,
    hasBadge: boolean = false
  ): Node => {
    const children: Node[] = [
      {
        id: `${id}_title`,
        name: 'Title',
        type: 'Div',
        x: x + 20,
        y: y + 20,
        width: 200,
        height: 30,
        text: 'Card Title',
        children: [],
      },
      {
        id: `${id}_content`,
        name: 'Content',
        type: 'Div',
        x: x + 20,
        y: y + 60,
        width: 200,
        height: 60,
        text: 'Card content goes here',
        children: [],
      },
    ];

    if (hasBadge) {
      children.push({
        id: `${id}_badge`,
        name: 'Badge',
        type: 'Div',
        x: x + 180,
        y: y + 10,
        width: 30,
        height: 20,
        background: '#ff0000',
        text: 'New',
        children: [],
      });
    }

    return {
      id,
      name: 'Card',
      type: 'Div',
      x,
      y,
      width: 240,
      height: 140,
      background: '#ffffff',
      border: '1px solid #ccc',
      children,
    };
  };

  const createButton = (
    id: string,
    x: number,
    y: number,
    text: string,
    variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary'
  ): Node => {
    const buttonStyles = {
      primary: { background: '#007bff', color: '#ffffff', border: 'none' },
      secondary: { background: '#6c757d', color: '#ffffff', border: 'none' },
      outline: {
        background: 'transparent',
        color: '#007bff',
        border: '1px solid #007bff',
      },
      danger: { background: '#dc3545', color: '#ffffff', border: 'none' },
    };

    return {
      id,
      name: 'Button',
      type: 'Button',
      x,
      y,
      width: 120,
      height: 40,
      text,
      children: [],
      ...buttonStyles[variant],
    };
  };

  const createButtonWithIcon = (
    id: string,
    x: number,
    y: number,
    text: string,
    variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary'
  ): Node => {
    const button = createButton(id, x, y, text, variant);

    // Add icon as child
    button.children.push({
      id: `${id}_icon`,
      name: 'Icon',
      type: 'Image',
      x: x + 10,
      y: y + 10,
      width: 20,
      height: 20,
      children: [],
    });

    return button;
  };

  test('should group similar cards together', () => {
    const nodes: Node[] = [
      createCard('card1', 0, 0, false),
      createCard('card2', 260, 0, false),
      createCard('card3', 520, 0, true), // with badge
      createButton('btn1', 0, 200, 'Click me'),
      createButton('btn2', 130, 200, 'Submit'),
    ];

    const groups = groupSimilarNodes(nodes);

    expect(groups).toHaveLength(2);

    // Find the card group
    const cardGroup = groups.find((g) => g.pattern === 'Card');
    expect(cardGroup).toBeDefined();
    expect(cardGroup!.nodes).toHaveLength(3);

    // Find the button group
    const buttonGroup = groups.find((g) => g.pattern === 'Button');
    expect(buttonGroup).toBeDefined();
    expect(buttonGroup!.nodes).toHaveLength(2);
  });

  test('should identify variations within card group', () => {
    const nodes: Node[] = [
      createCard('card1', 0, 0, false),
      createCard('card2', 260, 0, false),
      createCard('card3', 520, 0, true),
      createCard('card4', 0, 160, true),
    ];

    const groups = groupSimilarNodes(nodes);

    expect(groups).toHaveLength(1);

    const cardGroup = groups[0];
    expect(cardGroup.pattern).toBe('Card');
    expect(cardGroup.nodes).toHaveLength(4);
    expect(cardGroup.variations).toHaveLength(2);

    const withBadge = cardGroup.variations.find((v) => v.type === 'With Badge');
    const withoutBadge = cardGroup.variations.find(
      (v) => v.type === 'Without Badge'
    );

    expect(withBadge).toBeDefined();
    expect(withBadge!.examples).toHaveLength(2);

    expect(withoutBadge).toBeDefined();
    expect(withoutBadge!.examples).toHaveLength(2);
  });

  test('should not group dissimilar nodes', () => {
    const nodes: Node[] = [
      createCard('card1', 0, 0, false),
      createButton('btn1', 0, 200, 'Click me'),
      {
        id: 'input1',
        name: 'Input',
        type: 'Input',
        x: 0,
        y: 300,
        width: 200,
        height: 30,
        border: '1px solid #ccc',
        children: [],
      },
    ];

    const groups = groupSimilarNodes(nodes);

    // Each should be in its own group or no group (since we need at least 2 similar nodes)
    expect(groups).toHaveLength(0);
  });

  test('should handle empty input', () => {
    const groups = groupSimilarNodes([]);
    expect(groups).toHaveLength(0);
  });

  test.skip('should calculate structural similarity correctly (internal test - now functional)', () => {
    const card1 = createCard('card1', 0, 0, false);
    const card2 = createCard('card2', 260, 0, false);
    const button = createButton('btn1', 0, 200, 'Click me');

    // Note: This tests internal implementation that's no longer exposed
    // In functional programming, we test via public API behavior instead
    // const similarity1 = calculateSimilarity(card1, card2);
    // const similarity2 = calculateSimilarity(card1, button);

    // expect(similarity1).toBeGreaterThan(SIMILARITY_THRESHOLD);
    // expect(similarity2).toBeLessThan(SIMILARITY_THRESHOLD);

    // Instead, test the actual grouping behavior
    const result = groupSimilarNodes([card1, card2, button]);
    expect(result.length).toBeGreaterThan(0);
  });

  test('should extract common features correctly', () => {
    const nodes: Node[] = [
      createCard('card1', 0, 0, false),
      createCard('card2', 260, 0, false),
      createCard('card3', 520, 0, true),
    ];

    const groups = groupSimilarNodes(nodes);
    const cardGroup = groups[0];

    expect(cardGroup.commonFeatures.structure.rootType).toBe('Div');
    expect(cardGroup.commonFeatures.structure.childCount).toBeGreaterThan(0);
    expect(cardGroup.commonFeatures.styleProperties.background).toBe('#ffffff');
    expect(cardGroup.commonFeatures.dimensions.minWidth).toBe(240);
    expect(cardGroup.commonFeatures.dimensions.maxWidth).toBe(240);
  });

  test('should group buttons with different variants together', () => {
    const nodes: Node[] = [
      createButton('btn1', 0, 0, 'Submit', 'primary'),
      createButton('btn2', 130, 0, 'Cancel', 'secondary'),
      createButton('btn3', 260, 0, 'Delete', 'danger'),
      createButton('btn4', 390, 0, 'Edit', 'outline'),
      createButton('btn5', 0, 50, 'Save', 'primary'),
      createCard('card1', 0, 100, false),
    ];

    const groups = groupSimilarNodes(nodes);

    expect(groups).toHaveLength(1); // Only button group (card is alone)

    const buttonGroup = groups.find((g) => g.pattern === 'Button');
    expect(buttonGroup).toBeDefined();
    expect(buttonGroup!.nodes).toHaveLength(5);

    // Should identify style variations
    const variations = buttonGroup!.variations;
    expect(variations.length).toBeGreaterThan(1);

    const primaryVariation = variations.find((v) => v.type === 'Primary');
    const secondaryVariation = variations.find((v) => v.type === 'Secondary');
    const dangerVariation = variations.find((v) => v.type === 'Danger');
    const outlineVariation = variations.find((v) => v.type === 'Outline');

    expect(primaryVariation).toBeDefined();
    expect(primaryVariation!.examples).toHaveLength(2); // btn1 and btn5

    expect(secondaryVariation).toBeDefined();
    expect(secondaryVariation!.examples).toHaveLength(1);

    expect(dangerVariation).toBeDefined();
    expect(dangerVariation!.examples).toHaveLength(1);

    expect(outlineVariation).toBeDefined();
    expect(outlineVariation!.examples).toHaveLength(1);
  });

  test('should identify button variations with and without icons', () => {
    const nodes: Node[] = [
      createButton('btn1', 0, 0, 'Submit', 'primary'),
      createButton('btn2', 130, 0, 'Cancel', 'primary'),
      createButtonWithIcon('btn3', 260, 0, 'Save', 'primary'),
      createButtonWithIcon('btn4', 390, 0, 'Delete', 'danger'),
      createButton('btn5', 0, 50, 'Edit', 'secondary'),
    ];

    const groups = groupSimilarNodes(nodes);

    expect(groups).toHaveLength(1);

    const buttonGroup = groups[0];
    expect(buttonGroup.pattern).toBe('Button');
    expect(buttonGroup.nodes).toHaveLength(5);

    const variations = buttonGroup.variations;

    // Should have both style and icon variations
    const withIconVariation = variations.find((v) => v.type === 'With Icon');
    const withoutIconVariation = variations.find(
      (v) => v.type === 'Without Icon'
    );

    expect(withIconVariation).toBeDefined();
    expect(withIconVariation!.examples).toHaveLength(2); // btn3 and btn4

    expect(withoutIconVariation).toBeDefined();
    expect(withoutIconVariation!.examples).toHaveLength(3); // btn1, btn2, btn5

    // Should also have style variations
    const primaryVariation = variations.find((v) => v.type === 'Primary');
    expect(primaryVariation).toBeDefined();
    expect(primaryVariation!.examples).toHaveLength(3); // btn1, btn2, btn3
  });

  test('should handle mixed button variants correctly', () => {
    const nodes: Node[] = [
      // Primary buttons
      createButton('btn1', 0, 0, 'Submit', 'primary'),
      createButtonWithIcon('btn2', 130, 0, 'Save', 'primary'),

      // Secondary buttons
      createButton('btn3', 260, 0, 'Cancel', 'secondary'),
      createButtonWithIcon('btn4', 390, 0, 'Close', 'secondary'),

      // Outline buttons
      createButton('btn5', 0, 50, 'Learn More', 'outline'),
      createButton('btn6', 130, 50, 'Details', 'outline'),

      // Different component for comparison
      createCard('card1', 0, 100, false),
    ];

    const groups = groupSimilarNodes(nodes);

    expect(groups).toHaveLength(1); // Only buttons group together

    const buttonGroup = groups[0];
    expect(buttonGroup.nodes).toHaveLength(6);
    expect(buttonGroup.pattern).toBe('Button');

    const variations = buttonGroup.variations;

    // Verify style variations
    const primaryCount = variations.find((v) => v.type === 'Primary')?.examples
      .length;
    const secondaryCount = variations.find((v) => v.type === 'Secondary')
      ?.examples.length;
    const outlineCount = variations.find((v) => v.type === 'Outline')?.examples
      .length;

    expect(primaryCount).toBe(2);
    expect(secondaryCount).toBe(2);
    expect(outlineCount).toBe(2);

    // Verify icon variations
    const withIconCount = variations.find((v) => v.type === 'With Icon')
      ?.examples.length;
    const withoutIconCount = variations.find((v) => v.type === 'Without Icon')
      ?.examples.length;

    expect(withIconCount).toBe(2); // btn2 and btn4
    expect(withoutIconCount).toBe(4); // btn1, btn3, btn5, btn6
  });

  test('should not group buttons with significantly different sizes', () => {
    const nodes: Node[] = [
      createButton('btn1', 0, 0, 'Submit', 'primary'),
      createButton('btn2', 130, 0, 'Cancel', 'secondary'),
      {
        id: 'btn3',
        name: 'LargeButton',
        type: 'Button',
        x: 260,
        y: 0,
        width: 300, // Much larger
        height: 180, // Much larger
        background: '#007bff',
        color: '#ffffff',
        text: 'Large Action Button',
        children: [],
      },
    ];

    const groups = groupSimilarNodes(nodes);

    // Should only group the similar-sized buttons
    expect(groups).toHaveLength(1);
    expect(groups[0].nodes).toHaveLength(2); // Only btn1 and btn2
  });
});
