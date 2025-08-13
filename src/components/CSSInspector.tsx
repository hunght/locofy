import React, { useState } from 'react';
import {
  commonCSSProperties,
  displayValues,
  excludedNodeProperties,
} from '../constants/cssProperties';
import { Node } from '../types';

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
  const [newPropertyValue, setNewPropertyValue] = useState('');

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
      if (!excludedNodeProperties.includes(key)) {
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
    const propValue = newPropertyValue.trim();

    if (propName) {
      // Add the property with the provided value (can be empty string)
      handlePropertyChange(propName, propValue);
      setNewPropertyName('');
      setNewPropertyValue('');
      setShowSuggestions(false);
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
                disabled={!newPropertyName.trim() || !newPropertyValue.trim()}
                className="w-3 h-3 text-green-600 hover:text-green-800 disabled:text-gray-300"
                title="Add property"
              >
                +
              </button>
            </div>
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={newPropertyName}
                onChange={(e) => {
                  setNewPropertyName(e.target.value);
                  setSuggestionFilter(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    newPropertyName.trim()
                  ) {
                    e.preventDefault();
                    addNewProperty();
                    setShowSuggestions(false);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    setNewPropertyName('');
                    setNewPropertyValue('');
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
                className="flex-shrink-0 px-1 py-0 text-sm bg-transparent border-none outline-none focus:bg-blue-50 font-mono text-red-600"
                style={{ width: '120px' }}
              />

              {/* Suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto z-20 mt-1"
                  style={{ width: '120px' }}
                >
                  {filteredSuggestions.slice(0, 8).map((suggestion) => (
                    <div
                      key={suggestion}
                      className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-sm font-mono"
                      onMouseDown={(e) => {
                        // Prevent blur event from firing first
                        e.preventDefault();
                      }}
                      onClick={() => {
                        setNewPropertyName(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}

              <span className="text-gray-600 text-sm mx-1">:</span>

              <input
                type="text"
                value={newPropertyValue}
                onChange={(e) => setNewPropertyValue(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    newPropertyName.trim()
                  ) {
                    e.preventDefault();
                    addNewProperty();
                  } else if (e.key === 'Escape') {
                    setNewPropertyName('');
                    setNewPropertyValue('');
                  }
                }}
                placeholder="value"
                className="flex-1 px-1 py-0 text-sm bg-transparent border-none outline-none focus:bg-blue-50 font-mono text-gray-900"
              />

              <span className="text-gray-600 text-sm">;</span>
            </div>
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
