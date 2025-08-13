import React, { useState } from 'react';

export type Node = {
  id: string;
  x: number;
  y: number;
  name: string;
  type: 'Div' | 'Input' | 'Image' | 'Button';
  width: number;
  height: number;
  display?: string;
  text?: string;
  background?: string;
  color?: string;
  border?: string;
  children: Node[];
  [key: string]: any; // Allow additional CSS properties
};

export interface CSSInspectorProps {
  selectedNode: Node | null;
  onUpdateNode: (id: string, updates: Partial<Node>) => void;
}

export const CSSInspector: React.FC<CSSInspectorProps> = ({
  selectedNode,
  onUpdateNode,
}) => {
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [newPropertyName, setNewPropertyName] = useState('');

  const commonCSSProperties = [
    'display',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'width',
    'height',
    'max-width',
    'max-height',
    'min-width',
    'min-height',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'background',
    'background-color',
    'background-image',
    'background-size',
    'color',
    'font-size',
    'font-weight',
    'font-family',
    'line-height',
    'border',
    'border-radius',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
    'text-align',
    'text-decoration',
    'text-transform',
    'flex',
    'flex-direction',
    'justify-content',
    'align-items',
    'flex-wrap',
    'grid',
    'grid-template-columns',
    'grid-template-rows',
    'gap',
    'opacity',
    'visibility',
    'overflow',
    'z-index',
    'cursor',
    'transition',
    'transform',
    'box-shadow',
    'outline',
  ];

  const displayValues = [
    'block',
    'inline',
    'inline-block',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'table',
    'inline-table',
    'table-cell',
    'table-row',
    'list-item',
    'none',
    'contents',
    'flow-root',
    'math',
  ];

  if (!selectedNode) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a node to inspect its CSS properties
      </div>
    );
  }

  const getAllProperties = () => {
    const props: Record<string, any> = {};

    // Always include core properties
    props.width = `${selectedNode.width}px`;
    props.height = `${selectedNode.height}px`;

    // Add existing CSS properties
    if (selectedNode.background) props.background = selectedNode.background;
    if (selectedNode.color) props.color = selectedNode.color;
    if (selectedNode.border) props.border = selectedNode.border;
    if (selectedNode.display) props.display = selectedNode.display;

    // Add any additional properties that might exist on the node
    Object.keys(selectedNode).forEach((key) => {
      if (
        ![
          'id',
          'x',
          'y',
          'name',
          'type',
          'width',
          'height',
          'children',
          'text',
        ].includes(key)
      ) {
        const value = (selectedNode as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          props[key] = value;
        }
      }
    });

    return props;
  };

  const handlePropertyChange = (property: string, value: string) => {
    if (property === 'width' || property === 'height') {
      const numValue = parseInt(value.replace('px', '')) || 0;
      onUpdateNode(selectedNode.id, { [property]: numValue });
    } else {
      // For other properties, store them directly on the node
      const updates: any = { [property]: value };
      onUpdateNode(selectedNode.id, updates);
    }
  };

  const handlePropertyKeyDown = (e: React.KeyboardEvent, _property: string) => {
    if (e.key === 'Enter') {
      setEditingProperty(null);
    }
  };

  const addNewProperty = (propertyName?: string) => {
    const propName = propertyName || newPropertyName.trim();
    if (propName) {
      // Add the property with empty string value initially
      handlePropertyChange(propName, '');
      setNewPropertyName('');
      setShowSuggestions(false);
      // Automatically start editing the new property
      setTimeout(() => {
        setEditingProperty(propName);
      }, 100);
    }
  };

  const filteredSuggestions = commonCSSProperties.filter((prop) =>
    prop.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

  const properties = getAllProperties();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900">CSS Inspector</h3>
        <div className="text-xs text-gray-600 mt-1">
          #{selectedNode.name.toLowerCase().replace(/\s+/g, '-')} &#123;
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-auto font-mono text-sm">
        <div className="px-4 py-2">
          {Object.entries(properties).map(([property, value]) => (
            <div
              key={property}
              className="flex items-center py-1 group hover:bg-blue-50"
            >
              {/* Property checkbox - always checked for existing properties */}
              <div className="w-4 h-4 mr-2 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      handlePropertyChange(property, '');
                    }
                  }}
                  className="w-3 h-3 text-blue-600"
                />
              </div>

              {/* Property name */}
              <span className="text-red-600 mr-1">{property}:</span>

              {/* Property value */}
              <div className="flex-1">
                {editingProperty === property ? (
                  <div className="relative">
                    {property === 'display' ? (
                      <select
                        value={value}
                        onChange={(e) =>
                          handlePropertyChange(property, e.target.value)
                        }
                        onBlur={() => setEditingProperty(null)}
                        className="bg-transparent border-none outline-none text-gray-900 w-full"
                        autoFocus
                      >
                        <option value="">(empty)</option>
                        {displayValues.map((val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handlePropertyChange(property, e.target.value)
                        }
                        onBlur={() => setEditingProperty(null)}
                        onKeyDown={(e) => handlePropertyKeyDown(e, property)}
                        className="bg-transparent border-none outline-none text-gray-900 w-full"
                        autoFocus
                      />
                    )}
                  </div>
                ) : (
                  <span
                    className="text-gray-900 cursor-pointer hover:bg-blue-100 px-1 -mx-1 rounded"
                    onClick={() => setEditingProperty(property)}
                  >
                    {value || (
                      <span className="text-gray-400 italic">(empty)</span>
                    )}
                  </span>
                )}
              </div>

              <span className="text-gray-600">;</span>
            </div>
          ))}

          {/* Add new property input */}
          <div className="flex items-center py-1 mt-2 border-t border-gray-100">
            <div className="w-4 h-4 mr-2 flex-shrink-0">
              <button
                onClick={() => addNewProperty()}
                disabled={!newPropertyName.trim()}
                className="w-3 h-3 text-green-600 hover:text-green-800 disabled:text-gray-300"
                title="Add property"
              >
                +
              </button>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newPropertyName}
                onChange={(e) => {
                  setNewPropertyName(e.target.value);
                  setSuggestionFilter(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPropertyName.trim()) {
                    e.preventDefault();
                    addNewProperty();
                    setShowSuggestions(false);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    setNewPropertyName('');
                  }
                }}
                onFocus={() => {
                  if (newPropertyName.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={(_e) => {
                  // Only hide suggestions if not clicking on a suggestion
                  setTimeout(() => {
                    setShowSuggestions(false);
                  }, 150);
                }}
                placeholder="property-name"
                className="w-full px-1 py-0 text-sm bg-transparent border-none outline-none focus:bg-blue-50 font-mono text-red-600"
              />

              {/* Suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto z-20 mt-1">
                  {filteredSuggestions.slice(0, 8).map((suggestion) => (
                    <div
                      key={suggestion}
                      className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-sm font-mono"
                      onMouseDown={(e) => {
                        // Prevent blur event from firing first
                        e.preventDefault();
                      }}
                      onClick={() => {
                        addNewProperty(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-600 text-sm">:</span>
            <span className="text-gray-400 text-sm ml-1 italic">value;</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">&#125;</div>
      </div>
    </div>
  );
};

export default CSSInspector;
