// Application constants
export const CONSTANTS = {
  INDENTATION_STEP: 20,
  BASE_PADDING: 8,
  ICON_SIZE: 16,
  MIN_CANVAS_HEIGHT: 600,
  INITIAL_EXPANDED_NODES: ['1', '2', '5', '8'],
  PANEL_WIDTHS: {
    TREE_VIEW: 'w-80',
    INSPECTOR: 'w-80',
  },
} as const;

export const STYLING = {
  SELECTED_BORDER: '2px solid #3b82f6',
  DEFAULT_BORDER: '1px solid transparent',
  LABEL_BACKGROUND: '#3b82f6',
  LABEL_POSITION_TOP: -20,
} as const;

export const ARIA_LABELS = {
  TREE_VIEW: 'Component tree navigation',
  CANVAS_PREVIEW: 'Canvas preview area',
  CSS_INSPECTOR: 'CSS properties inspector',
  EXPAND_COLLAPSE: 'Expand or collapse node',
  NODE_SELECTION: 'Select node',
} as const;
