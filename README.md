# Frontend Coding Test - UI Component Tree Inspector

A sophisticated React TypeScript application for visualizing and inspecting UI component hierarchies with intelligent component detection and real-time CSS editing capabilities.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-30%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![React](https://img.shields.io/badge/React-18.2-blue)

## 🚀 Features

### Core Functionality

- **📊 Interactive Tree View**: Hierarchical visualization of UI components
- **🎨 Live Canvas Preview**: Real-time visual representation of the component tree
- **⚙️ CSS Inspector**: Live editing of CSS properties with instant preview
- **🔍 Smart Component Detection**: Automatic identification of reusable component patterns
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **🎯 Performance Optimized**: Handles large datasets (220+ nodes) efficiently

### Advanced Features

- **Component Pattern Recognition**: Automatically detects and labels reusable components (C1, C2, etc.)
- **Hierarchy Prevention**: Intelligent detection prevents child components from being marked when parent is already a component
- **Real-time Updates**: Instant synchronization between tree view, canvas, and inspector
- **Error Boundaries**: Graceful error handling with recovery options
- **Debug Panel**: Development tools for inspecting component state

## 📁 Project Structure

```
frontend-coding-test/
├── .github/
│   ├── copilot-instructions.md     # GitHub Copilot guidelines
│   ├── COPILOT_INSTRUCTIONS        # Development best practices
│   └── copilot-instructions        # Code quality standards
├── src/
│   ├── components/                 # React components
│   │   ├── App.tsx                # Main application component
│   │   ├── TreeNodeComponent.tsx  # Tree view node renderer
│   │   ├── NodeRenderer.tsx       # Canvas node renderer
│   │   ├── TreeViewPanel.tsx      # Complete tree panel
│   │   ├── PreviewPanel.tsx       # Canvas preview panel
│   │   ├── InspectorPanel.tsx     # CSS inspector panel
│   │   ├── ErrorBoundary.tsx      # Error handling wrapper
│   │   └── __tests__/             # Component tests
│   ├── hooks/
│   │   └── useAppState.ts         # Complex state management
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── constants/
│   │   ├── appConstants.ts        # Application constants
│   │   ├── cssProperties.ts       # CSS-related constants
│   │   └── mockData.ts            # Sample data
│   └── utils/
│       ├── componentDetection.ts  # Component detection logic
│       └── __tests__/             # Utility tests
├── README-Component-Detection.md   # Component detection documentation
├── PERFORMANCE-RESULTS.md         # Performance benchmarks
├── REFACTORING-GUIDE.md           # Refactoring methodology
└── package.json                   # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 4.4
- **Styling**: Tailwind CSS 3.3
- **Testing**: Vitest 0.34 + React Testing Library
- **Icons**: Lucide React
- **Linting**: ESLint with TypeScript rules

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend-coding-test

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm test           # Run tests
npm run lint       # Run ESLint
```

The application will be available at `http://localhost:3000` (or next available port).

## 📚 Documentation

### Core Documentation

- **[Component Detection Guide](./README-Component-Detection.md)**: Detailed explanation of the intelligent component detection system
- **[Performance Results](./PERFORMANCE-RESULTS.md)**: Comprehensive performance benchmarks and stress test results
- **[Refactoring Guide](./REFACTORING-GUIDE.md)**: Complete refactoring methodology and best practices applied

### Development Guidelines

- **[GitHub Copilot Instructions](./.github/copilot-instructions.md)**: Comprehensive development guidelines and best practices
- **[Code Quality Standards](./.github/COPILOT_INSTRUCTIONS)**: Specific coding standards and abstraction rules

## 🏗️ Architecture Highlights

### Component Architecture

The application follows a clean, modular architecture with strict separation of concerns:

- **Single Responsibility**: Each component has one clear purpose
- **Error Boundaries**: Isolated error handling for component sections
- **TypeScript First**: Comprehensive type safety throughout
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

### State Management Philosophy

- **Minimal Abstractions**: Custom hooks only for genuinely complex state
- **Local State**: State kept as close to usage as possible
- **Direct Logic**: Simple operations inline rather than wrapped in unnecessary hooks

### Performance Optimizations

- **Optimized Re-renders**: Proper memoization with `React.memo`, `useMemo`, `useCallback`
- **Efficient Updates**: Targeted state changes to minimize cascading updates
- **Large Dataset Support**: Tested with 220+ node hierarchies

## 🔍 Component Detection System

### Intelligent Pattern Recognition

The application includes a sophisticated component detection system that:

- **Analyzes node signatures**: Compares type, dimensions, and structural patterns
- **Detects reusable patterns**: Identifies nodes that could be componentized
- **Prevents hierarchy conflicts**: Ensures parent-child components don't conflict
- **Labels components**: Automatically assigns component labels (C1, C2, etc.)

### Performance Metrics

- **Small datasets (9 nodes)**: ~0.3ms processing time
- **Medium datasets (11 nodes)**: ~0.12ms processing time
- **Large datasets (220+ nodes)**: ~4-5ms processing time
- **Scalability**: Linear performance scaling with node count

## 🧪 Testing

### Test Coverage

- **30 tests passing** across utilities and components
- **Component tests**: UI interaction and rendering
- **Utility tests**: Component detection algorithms
- **Performance tests**: Stress testing with large datasets

### Running Tests

```bash
npm test           # Run tests in watch mode
npm test -- --run  # Run tests once
```

## 🎯 Key Features in Detail

### 1. Tree View Panel

- **Hierarchical Display**: Expandable/collapsible tree structure
- **Component Labels**: Visual indicators for detected component patterns
- **Selection State**: Click to select nodes across all panels
- **Keyboard Navigation**: Full accessibility support

### 2. Canvas Preview

- **Visual Representation**: Live rendering of the component hierarchy
- **Interactive Selection**: Click nodes to select them
- **Real-time Updates**: Instant reflection of CSS changes
- **Responsive Design**: Adapts to different content sizes

### 3. CSS Inspector

- **Live Property Editing**: Real-time CSS property modification
- **Auto-suggestions**: CSS property name suggestions
- **Value Validation**: Type-aware value validation (numbers, colors, etc.)
- **Add New Properties**: Dynamic property addition

### 4. Component Detection

- **Pattern Analysis**: Identifies similar node structures
- **Signature Matching**: Compares multiple node characteristics
- **Hierarchy Awareness**: Prevents nested component conflicts
- **Performance Optimized**: Efficient algorithms for large datasets

## 🔧 Development Best Practices

### Code Quality Standards

- **No Over-Abstraction**: Custom hooks only for complex, multi-state logic
- **Inline Simple Logic**: Direct `useMemo`/`useCallback` for simple operations
- **TypeScript Interfaces**: Comprehensive type definitions
- **Error Handling**: Defensive programming with proper null checks

### Abstraction Guidelines

✅ **Good Abstractions**:

- `useTreeState`: Complex state with multiple related values
- Component separation: Single-responsibility modules

❌ **Avoided Over-Abstractions**:

- Simple Map lookups wrapped in hooks
- Basic `useCallback` wrappers for single operations
- Unnecessary state management layers

## 🚀 Performance

### Benchmarks

The application has been thoroughly performance tested:

- **Component Detection**: Sub-5ms for 220+ nodes
- **Rendering Performance**: Optimized with React.memo and proper memoization
- **Memory Efficiency**: Minimal memory footprint with efficient data structures
- **Scalability**: Linear performance scaling demonstrated

See [PERFORMANCE-RESULTS.md](./PERFORMANCE-RESULTS.md) for detailed benchmarks.

## 🤝 Contributing

### Development Setup

1. Follow the Quick Start guide above
2. Read the [Refactoring Guide](./REFACTORING-GUIDE.md) for methodology
3. Review [GitHub Copilot Instructions](./.github/copilot-instructions.md) for coding standards
4. Run tests before submitting PRs

### Code Review Checklist

- [ ] No unnecessary custom hooks for simple operations
- [ ] Proper TypeScript interfaces defined
- [ ] Error boundaries implemented where needed
- [ ] Accessibility features included
- [ ] Tests pass and cover main functionality
- [ ] Performance considerations addressed

## 📄 License

This project is licensed under the MIT License.

## 🎉 Acknowledgments

This project demonstrates modern React development best practices including:

- Clean architecture with minimal abstractions
- Performance optimization techniques
- Comprehensive testing strategies
- Accessibility-first development
- TypeScript best practices
- Intelligent algorithm implementation

---

**Built with ❤️ using React, TypeScript, and modern web development best practices.**
