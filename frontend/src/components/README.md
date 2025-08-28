# Starfield Component

A calming interactive starfield component that responds to mouse gestures with twinkling and size changes.

## Features

- Interactive stars that twinkle and change size when hovered
- Transparent background for placement over any content
- Configurable star count, colors, and sizes
- Performance optimized with canvas rendering
- Responsive design that adapts to container size

## Installation

The component is ready to use in your React application. Simply import it:

```jsx
import Starfield from './Starfield';
```

## Usage

### Basic Usage

```jsx
import Starfield from './Starfield';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Starfield />
    </div>
  );
}
```

### Customized Usage

```jsx
import Starfield from './Starfield';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Starfield
        starCount={200}
        starColor="#ffcc00"
        minStarSize={2}
        maxStarSize={5}
        twinkleSpeed={0.01}
        sensitivity={150}
      />
    </div>
  );
}
```

## Props

| Prop Name | Type | Default | Description |
|-----------|------|---------|-------------|
| `starCount` | number | 100 | Number of stars to render in the starfield |
| `starColor` | string | '#ffffff' | Color of the stars in hex format |
| `backgroundColor` | string | 'transparent' | Background color of the canvas |
| `minStarSize` | number | 1 | Minimum size of stars in pixels |
| `maxStarSize` | number | 3 | Maximum size of stars in pixels |
| `twinkleSpeed` | number | 0.005 | Speed of the twinkling animation (opacity change) |
| `sensitivity` | number | 100 | Sensitivity distance for mouse interaction in pixels |
| `className` | string | '' | Additional CSS class names to apply to the canvas |

## Implementation Details

The component uses HTML5 Canvas for efficient rendering of stars. It implements:

1. **Performance Optimization**: Uses `requestAnimationFrame` for smooth animations
2. **Interactive Behavior**: Stars twinkle and change size when the mouse is near them
3. **Responsive Design**: Automatically adjusts to container size changes
4. **Memory Efficiency**: Reuses star objects and uses object pooling concepts

## How It Works

1. **Star Initialization**: Creates a specified number of star objects with random positions, sizes, and properties
2. **Animation Loop**: Continuously updates star positions and properties using `requestAnimationFrame`
3. **Mouse Interaction**: Detects mouse proximity to stars and triggers twinkling and size changes
4. **Rendering**: Draws all stars on a canvas element with their current properties

## Customization

You can customize the appearance and behavior by adjusting the component props. For example:

```jsx
<Starfield
  starCount={300}           // More stars
  starColor="#00ffaa"       // Cyan stars
  minStarSize={1}           // Smaller minimum size
  maxStarSize={4}           // Larger maximum size
  twinkleSpeed={0.02}       // Faster twinkling
  sensitivity={200}          // Larger interaction area
/>
```

## Styling

The component uses CSS modules for styling. You can customize the appearance by passing additional class names:

```jsx
<Starfield className="custom-starfield" />
```

And in your CSS:

```css
.custom-starfield {
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}