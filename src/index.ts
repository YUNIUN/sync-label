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

// 点类型的标注元素
export { generatePointMap, generateTextMap } from './annotates/index';
