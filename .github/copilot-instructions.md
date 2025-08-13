# GitHub Copilot Instructions

## 🎯 Core Development Principles

### Abstraction Rules

- **AVOID over-abstraction**: Don't create custom hooks for simple operations
- **Simple operations belong inline**: `useMemo`, `useCallback` for basic lookups should be written directly where used
- **Only abstract when there's REAL complexity**: Multiple related state values, complex logic, or genuine reusability
- **Rule of thumb**: If the abstraction is longer than its usage, don't abstract

### Custom Hooks Guidelines

✅ **CREATE custom hooks when:**

- Managing multiple related state values together
- Complex state interactions and side effects
- Genuine reusability across multiple components
- Encapsulating complex business logic

❌ **AVOID custom hooks for:**

- Simple `useMemo` lookups in Maps
- Basic `useCallback` wrappers
- Single-purpose state that only one component uses
- Operations that are clearer when written inline

### Component Structure

- **Single Responsibility**: Each component should have one clear purpose
- **File Organization**: Separate components into focused, testable modules
- **Props Interface**: Use TypeScript interfaces for better type safety
- **Error Boundaries**: Wrap components that might fail

### State Management

- **State Locality**: Keep state as close to where it's used as possible
- **Minimize Prop Drilling**: Use context only when necessary
- **Memoization**: Use `React.memo`, `useMemo`, `useCallback` appropriately
- **Stable Handlers**: Ensure event handlers don't cause unnecessary re-renders

### Code Quality

- **TypeScript First**: Always use proper types, avoid `any`
- **Accessibility**: Include ARIA labels, keyboard navigation, semantic HTML
- **Performance**: Optimize re-renders, use proper dependency arrays
- **Testing**: Write testable code with clear separation of concerns

### Examples from This Project

#### ✅ GOOD - Keep Complex Hook

```typescript
// useTreeState - manages multiple related values and complex interactions
export const useTreeState = (): UseTreeStateReturn => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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

  return { selectedId, expandedNodes, handleSelect, handleToggle };
};
```

#### ❌ BAD - Unnecessary Hook Wrapper

```typescript
// DON'T DO THIS - Simple lookup wrapped in unnecessary hook
export const useSelectedNode = (selectedId, nodeMap) => {
  return useMemo(() => {
    return selectedId ? nodeMap.get(selectedId) || null : null;
  }, [nodeMap, selectedId]);
};
```

#### ✅ GOOD - Inline Simple Logic

```typescript
// DO THIS - Simple logic inline where it's used
const selectedNode = useMemo(() => {
  return selectedId ? nodeMap.get(selectedId) || null : null;
}, [nodeMap, selectedId]);
```

### File Organization Patterns

```
src/
├── components/          # UI components (single responsibility)
├── hooks/              # Only complex, reusable state logic
├── types/              # Shared TypeScript interfaces
├── constants/          # App constants, config
├── utils/              # Pure business logic functions
└── __tests__/          # Test files co-located
```

### Error Handling

- Always include Error Boundaries for component isolation
- Add defensive programming with null checks
- Provide meaningful error messages and recovery options
- Log errors appropriately for debugging

### Performance Best Practices

- Use `React.memo` for expensive components
- Proper `useMemo` and `useCallback` dependency arrays
- Avoid inline object/array creation in JSX
- Minimize re-renders through stable references

### Accessibility Standards

- Include proper ARIA labels and roles
- Support keyboard navigation
- Use semantic HTML elements
- Provide focus management

## 🚫 Anti-Patterns to Avoid

### Over-Engineering

- Creating abstractions for the sake of abstraction
- Hooks that are just simple wrappers
- Complex patterns for simple problems
- Premature optimization

### Poor Separation of Concerns

- Business logic mixed with UI logic
- Inline styles mixed with CSS classes inconsistently
- Event handlers defined inline in JSX
- Magic numbers and strings throughout code

### Type Safety Issues

- Using `any` type
- Missing prop interfaces
- Inconsistent type definitions
- Not leveraging TypeScript features

## 📝 Code Review Checklist

Before approving any PR, verify:

- [ ] No unnecessary custom hooks for simple operations
- [ ] Proper TypeScript interfaces defined
- [ ] Error boundaries implemented where needed
- [ ] Accessibility features included
- [ ] Tests pass and cover main functionality
- [ ] No console errors or warnings
- [ ] Performance considerations addressed
- [ ] Code follows established patterns

## 🎯 Remember: Keep It Simple and Direct!

The best code is often the simplest code that clearly expresses intent. Don't abstract until abstraction provides real value.
