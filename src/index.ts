// 生命周期
export {
  onAfterUpdate,
  onAwake,
  onBeforeStart,
  onBeforeUpdate,
  onDestroy,
  onNextFrame,
  onResize,
  onStart,
  onUpdate,
} from './core/index';
export { destroy, init } from './core/index';
// 资源
export { getCamera, getRenderer, getScene } from './core/index';

// 标注元素
export {
  generateArrowMap,
  generateLineMap,
  generatePointMap,
  generatePolygonMap,
  generateTextMap,
} from './annotates/index';
