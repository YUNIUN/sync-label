# Sync Label

[English](https://github.com/YUNIUN/sync-label/blob/master/README_en.md)

一个基于 Three.js 的高性能 3D 标注库，支持使用自定义着色器对点、多边形和文字进行实例化渲染。

## 性能分析

渲染 100 万个点元素，帧率保持 60fps，仅需 10 个 drawcall。

**测试环境**

- CPU: AMD Ryzen 7 5800 8-Core Processor
- GPU: NVIDIA GeForce GTX 1660 Ti

![image-fps](https://github.com/YUNIUN/sync-label/blob/master/images/fps.png?raw=true)

![image-drawcalls](https://github.com/YUNIUN/sync-label/blob/master/images/drawcalls.png?raw=true)

## 特性

- **高性能** — 基于 Three.js InstancedMesh + 自定义着色器，单实例可承载 10 万个标注元素，支持百万级标注点渲染
- **帧批量响应式** — 自定义响应式系统，同一帧内的增删改操作会自动合并去重，仅在帧刷新时统一触发渲染更新
- **可伸缩文字标签** — 点、多边形自带文字标签显示，支持屏幕空间偏移和缩放
- **自定义着色器** — 全部使用自定义 GLSL 着色器渲染，支持屏幕空间尺寸限制、独立透明度、旋转/缩放
- **生命周期钩子** — 提供完整的帧循环生命周期：awake → beforeStart → start → (beforeUpdate → update → render → afterUpdate → nextFrame) → destroy

## 安装

```bash
pnpm add sync-label
```

## 快速开始

```typescript
import * as SYNC_LABEL from 'sync-label';

// 1. 初始化渲染引擎
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

// 2. 创建标注元素
const pointMap = SYNC_LABEL.generatePointMap();
const polygonMap = SYNC_LABEL.generatePolygonMap();
const textMap = SYNC_LABEL.generateTextMap();

// 3. 添加标注
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

// 4. 更新/删除元素（响应式自动触发渲染）
pointMap.delete('point-1');
pointMap.set('point-2', { ... });
```

## API

### 初始化

`SYNC_LABEL.init(config)` — 初始化渲染引擎，接受包含 engine/textConfig 的配置对象。

### 标注生成器

| 函数 | 返回 | 描述 |
|------|------|------|
| `generatePointMap()` | `Map<string, T_StandaloneAnnotate>` | 创建点标注集合（独立实例，支持独立变换） |
| `generatePolygonMap()` | `Map<string, T_DependentAnnotate>` | 创建多边形标注集合（自动三角剖分） |
| `generateTextMap()` | `Map<string, T_DependentTextAnnotate>` | 创建文字标注集合 |

生成的 Map 是响应式的，标准的 `set`/`delete`/`clear` 操作会自动触发渲染更新。

### 生命周期钩子

| 函数 | 触发时机 |
|------|----------|
| `onAwake(cb)` | init 调用时 |
| `onBeforeStart(cb)` | 引擎初始化完成后 |
| `onStart(cb)` | 启动前 |
| `onBeforeUpdate(cb)` | 每帧更新前 |
| `onUpdate(cb)` | 每帧更新 |
| `onAfterUpdate(cb)` | 每帧渲染完成后 |
| `onNextFrame(cb, delay?)` | 指定帧数后执行 |
| `onResize(cb)` | 容器尺寸变化时 |
| `onDestroy(cb)` | 销毁时 |

### 资源访问

| 函数 | 返回 |
|------|------|
| `getCamera()` | Three.js Camera |
| `getRenderer()` | Three.js WebGLRenderer |
| `getScene()` | Three.js Scene |

## 架构

```
src/
├── core/          初始化、销毁、生命周期、尺寸适配
├── renderEngine/  渲染引擎抽象层 (BaseRenderEngine → ThreejsRenderEngine)
│   └── primitives/  标注原语 (StandalonePrimitive / DependentPrimitive / DependentTextPrimitive)
├── annotates/     标注生成器 (point / polygon / text)，各包含几何体、材质、着色器
├── reactivity/    自定义帧批量响应式系统 (ref / effect / reactive / computed)
├── stores/        GlobalStore 全局单例
├── types/         基于 Zod 的类型定义和校验
├── math/          三角剖分、凸多边形判断、碰撞检测
├── utils/         工具函数
└── config/        渲染顺序常量
```

### 渲染机制

标注元素基于 Three.js `InstancedMesh` 渲染，每个 Primitive 预分配 100,000 个 instance slot，通过座位复用机制（occupiedSeat / availableSeat）高效管理元素的增删改，避免频繁分配/释放 GPU 内存。不同类型的标注使用自定义着色器，在 GPU 中完成屏幕空间变换和尺寸限制。

## 开发

```bash
# 安装依赖
pnpm install

# 启动 demo
pnpm demo

# 运行测试
pnpm test

# 构建
pnpm build
```

## 许可

[Mozilla Public License Version 2.0](LICENSE)
