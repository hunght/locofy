import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import CSSInspector, { type Node } from '../CSSInspector';

// Mock node for testing
const mockNode: Node = {
  id: 'test-node-1',
  x: 10,
  y: 20,
  name: 'Test Button',
  type: 'Button',
  width: 100,
  height: 40,
  background: '#3b82f6',
  color: '#ffffff',
  border: '1px solid #059669',
  children: [],
};

const mockOnUpdateNode = vi.fn();

describe('CSSInspector', () => {
  beforeEach(() => {
    mockOnUpdateNode.mockClear();
  });

  it('renders empty state when no node is selected', () => {
    render(
      <CSSInspector selectedNode={null} onUpdateNode={mockOnUpdateNode} />
    );

    expect(
      screen.getByText('Select a node to inspect its CSS properties')
    ).toBeInTheDocument();
  });

  it('renders node properties when a node is selected', () => {
    render(
      <CSSInspector selectedNode={mockNode} onUpdateNode={mockOnUpdateNode} />
    );

    // Should display the node name in the header
    expect(screen.getByText(/#test-button/)).toBeInTheDocument();

    // Should display core properties
    expect(screen.getByText('width:')).toBeInTheDocument();
    expect(screen.getByText('100px')).toBeInTheDocument();
    expect(screen.getByText('height:')).toBeInTheDocument();
    expect(screen.getByText('40px')).toBeInTheDocument();

    // Should display custom properties
    expect(screen.getByText('background:')).toBeInTheDocument();
    expect(screen.getByText('#3b82f6')).toBeInTheDocument();
    expect(screen.getByText('color:')).toBeInTheDocument();
    expect(screen.getByText('#ffffff')).toBeInTheDocument();
    expect(screen.getByText('border:')).toBeInTheDocument();
    expect(screen.getByText('1px solid #059669')).toBeInTheDocument();
  });

  it('allows editing property values', () => {
    render(
      <CSSInspector selectedNode={mockNode} onUpdateNode={mockOnUpdateNode} />
    );

    // Click on a property value to edit it
    const backgroundValue = screen.getByText('#3b82f6');
    fireEvent.click(backgroundValue);

    // Should show an input field
    const input = screen.getByDisplayValue('#3b82f6');
    expect(input).toBeInTheDocument();

    // Change the value
    fireEvent.change(input, { target: { value: '#ff0000' } });
    fireEvent.blur(input);

    // Should call onUpdateNode with the new value
    expect(mockOnUpdateNode).toHaveBeenCalledWith('test-node-1', {
      background: '#ff0000',
    });
  });

  it('handles width and height as numeric values', () => {
    render(
      <CSSInspector selectedNode={mockNode} onUpdateNode={mockOnUpdateNode} />
    );

    // Click on width value to edit it
    const widthValue = screen.getByText('100px');
    fireEvent.click(widthValue);

    // Change the value
    const input = screen.getByDisplayValue('100px');
    fireEvent.change(input, { target: { value: '150px' } });
    fireEvent.blur(input);

    // Should call onUpdateNode with numeric value
    expect(mockOnUpdateNode).toHaveBeenCalledWith('test-node-1', {
      width: 150,
    });
  });

  it('allows adding new properties', () => {
    render(
      <CSSInspector selectedNode={mockNode} onUpdateNode={mockOnUpdateNode} />
    );

    // Find the add property input
    const addInput = screen.getByPlaceholderText('property-name');

    // Type a new property name
    fireEvent.change(addInput, { target: { value: 'margin' } });
    fireEvent.keyDown(addInput, { key: 'Enter' });

    // Should call onUpdateNode with the new property
    expect(mockOnUpdateNode).toHaveBeenCalledWith('test-node-1', {
      margin: '',
    });
  });
});
