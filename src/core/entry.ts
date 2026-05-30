import { runTrigger } from '../reactivity';
import { EngineFactory } from '../renderEngine/EngineFactory';
import { GlobalStore } from '../stores/globalStore';
import { syncLabelConfigSchema, T_SyncLabelConfig } from '../types/core/entry';
import { bind } from './resize';

let __initialized = false;

function __loop() {
  requestAnimationFrame(__loop);
  const globalStore = GlobalStore.getInstance();
  if (!globalStore) return;

  // beforeUpdates
  globalStore.runLifecycleCallBack('beforeUpdates');

  runTrigger();

  // updates
  globalStore.runLifecycleCallBack('updates');

  // render
  if (globalStore.engine) {
    globalStore.engine.render();
  }

  // afterUpdates
  globalStore.runLifecycleCallBack('afterUpdates');

  // nextFrames
  globalStore.runLifecycleCallBack('nextFrames');
}

export async function init(config: T_SyncLabelConfig) {
  if (__initialized) return;
  const parsedRes = syncLabelConfigSchema.safeParse(config);
  if (!parsedRes.success) {
    console.error(parsedRes.error);
    throw new Error(`Invalid config ${JSON.stringify(config)}`);
  }
  config = parsedRes.data;

  const globalStore = GlobalStore.getInstance();
  if (!globalStore) return;

  // textConfig
  globalStore.textConfig = config.textConfig!;

  // awakes
  globalStore.runLifecycleCallBack('awakes');
  globalStore.clearLifecycleCallBack('awakes');

  // init
  const engine = EngineFactory.generate(config.engine);
  const { renderer } = engine.init();
  if (!renderer) throw new Error('renderer is null');
  globalStore.engine = engine;
  globalStore.destroys = { func: engine.destroy.bind(engine), delay: 0 };
  // resize
  globalStore.resizes = engine.resize.bind(engine);
  const element = renderer.domElement.parentElement;
  if (element) {
    bind(element, (entry) => {
      for (const resizeFunc of globalStore.resizes) {
        resizeFunc(entry);
      }
    });
  } else {
    console.error('element not found');
    throw new Error('element not found');
  }

  // beforeStarts
  globalStore.runLifecycleCallBack('beforeStarts');
  globalStore.clearLifecycleCallBack('beforeStarts');
  // starts
  globalStore.runLifecycleCallBack('starts');
  globalStore.clearLifecycleCallBack('starts');

  __initialized = true;

  __loop();
}

export function destroy() {
  const globalStore = GlobalStore.getInstance();
  if (!globalStore) return;

  globalStore.runLifecycleCallBack('destroys');
  globalStore.clearLifecycleCallBack('beforeUpdates');
  globalStore.clearLifecycleCallBack('updates');
  globalStore.clearLifecycleCallBack('afterUpdates');
  globalStore.clearLifecycleCallBack('nextFrames');
  globalStore.clearLifecycleCallBack('destroys');
  globalStore.clearLifecycleCallBack('resizes');
}
