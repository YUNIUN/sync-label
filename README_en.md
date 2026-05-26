# Sync Label

[中文](https://github.com/YUNIUN/sync-label/blob/master/README.md)

A high-performance 3D annotation library built on Three.js, supporting instanced rendering of points, polygons, and text with custom shaders.

## Performance

Rendering 1 million point elements at 60fps with only 10 draw calls.

**Test Environment**

- CPU: AMD Ryzen 7 5800 8-Core Processor
- GPU: NVIDIA GeForce GTX 1660 Ti

![image-fps](https://github.com/YUNIUN/sync-label/blob/master/images/fps.png?raw=true)

![image-drawcalls](https://github.com/YUNIUN/sync-label/blob/master/images/drawcalls.png?raw=true)

## Features

- **High Performance** — Built on Three.js InstancedMesh with custom shaders. Each primitive supports 100,000 instances, capable of rendering millions of annotation points.
- **Frame-batched Reactivity** — Custom reactive system that automatically deduplicates and merges add/modify/delete operations within the same frame, triggering renders only on frame refresh.
- **Scalable Text Labels** — Points and polygons come with built-in text label support, including screen-space offsets and scaling.
- **Custom Shaders** — All annotations rendered with custom GLSL shaders, supporting screen-space size limits, per-instance opacity, rotation, and scaling.
- **Lifecycle Hooks** — Complete frame loop lifecycle: awake → beforeStart → start → (beforeUpdate → update → render → afterUpdate → nextFrame) → destroy

## Installation

```bash
pnpm add sync-label
```

## Quick Start

```typescript
import * as SYNC_LABEL from 'sync-label';

// 1. Initialize the render engine
await SYNC_LABEL.init({
  engine: {
    engineType: 'THREEJS',
    camera: {
      config: { type: 'PERSPECTIVE', fov: 75, aspect: 2, near: 1, far: 100000 },
      position: { x: 0, y: 0, z: 14 },
      lookAt: { x: 0, y: 0, z: 0 },
    },
    scene: { background: '#000000' },
    renderer: { element: '#app' },
  },
});

// 2. Create annotation maps
const pointMap = SYNC_LABEL.generatePointMap();
const polygonMap = SYNC_LABEL.generatePolygonMap();
const textMap = SYNC_LABEL.generateTextMap();

// 3. Add annotations
pointMap.set('point-1', {
  id: 'point-1',
  position: { x: 0, y: 0, z: 0 },
  width: 10,
  height: 10,
  color: '#ff0000ff',
  showID: true,
});

polygonMap.set('poly-1', {
  id: 'poly-1',
  positions: [
    { x: -5, y: 0, z: -5 },
    { x: -5, y: 0, z: 5 },
    { x: 5, y: 0, z: 5 },
    { x: 5, y: 0, z: -5 },
  ],
  color: '#00ff0080',
  showID: true,
});

// 4. Update/delete (reactivity triggers render automatically)
pointMap.delete('point-1');
pointMap.set('point-2', { ... });
```

## API

### Initialization

`SYNC_LABEL.init(config)` — Initialize the render engine. Accepts a config object with engine and optional textConfig.

### Annotation Generators

| Function | Returns | Description |
|----------|---------|-------------|
| `generatePointMap()` | `Map<string, T_StandaloneAnnotate>` | Create a point annotation collection (standalone instances with independent transforms) |
| `generatePolygonMap()` | `Map<string, T_DependentAnnotate>` | Create a polygon annotation collection (auto-triangulated) |
| `generateTextMap()` | `Map<string, T_DependentTextAnnotate>` | Create a text annotation collection |

Generated Maps are reactive — standard `set`/`delete`/`clear` operations automatically trigger render updates.

### Lifecycle Hooks

| Function | Trigger |
|----------|---------|
| `onAwake(cb)` | When `init()` is called |
| `onBeforeStart(cb)` | After engine initialization |
| `onStart(cb)` | Before start |
| `onBeforeUpdate(cb)` | Before each frame update |
| `onUpdate(cb)` | Each frame update |
| `onAfterUpdate(cb)` | After each frame render |
| `onNextFrame(cb, delay?)` | Execute after N frames |
| `onResize(cb)` | When container resizes |
| `onDestroy(cb)` | On destroy |

### Resource Access

| Function | Returns |
|----------|---------|
| `getCamera()` | Three.js Camera |
| `getRenderer()` | Three.js WebGLRenderer |
| `getScene()` | Three.js Scene |

## Architecture

```
src/
├── core/          Initialization, destroy, lifecycle hooks, resize handling
├── renderEngine/  Render engine abstraction (BaseRenderEngine → ThreejsRenderEngine)
│   └── primitives/  Annotation primitives (StandalonePrimitive / DependentPrimitive / DependentTextPrimitive)
├── annotates/     Annotation generators (point / polygon / text) with geometry, material, and shaders
├── reactivity/    Custom frame-batched reactivity system (ref / effect / reactive / computed)
├── stores/        GlobalStore singleton
├── types/         Zod-based type definitions and validation
├── math/          Triangulation, convex polygon checks, collision detection
├── utils/         Utility functions
└── config/        Render order constants
```

### Rendering Mechanism

Annotations are rendered using Three.js `InstancedMesh`. Each Primitive pre-allocates 100,000 instance slots and uses a seat-reuse mechanism (occupiedSeat / availableSeat) to efficiently manage element addition, removal, and modification without frequent GPU memory allocation. Different annotation types use custom shaders to handle screen-space transforms and size limits on the GPU.

## Development

```bash
# Install dependencies
pnpm install

# Start demo dev server
pnpm demo

# Run tests
pnpm test

# Build
pnpm build
```

## License

[Mozilla Public License Version 2.0](LICENSE)
