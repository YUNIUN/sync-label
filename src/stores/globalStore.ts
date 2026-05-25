import { BaseRenderEngine } from '../renderEngine/BaseRenderEngine';
import { T_TextConfig } from '../types/core/textConfig';
import {
  T_LifecycleCallBack,
  T_LifecycleType,
  T_PrivateField,
  T_ResizeCallBack,
} from '../types/stores/global';

const __privateFieldMap = new WeakMap<GlobalStore, T_PrivateField>();

/**
 * 全局状态管理器
 * @description 用于管理全局状态，例如生命周期函数、渲染器、相机等
 */
export class GlobalStore {
  // 生命周期 awake -> beforeStart -> start -> beforeUpdate -> update -> afterUpdate -> nextFrame -> destroy
  public set awakes(value: T_LifecycleCallBack) {
    __privateFieldMap.get(this)!.awakes.push(value);
  }
  public get awakes(): T_LifecycleCallBack[] {
    return __privateFieldMap.get(this)!.awakes;
  }
  public set beforeStarts(value: T_LifecycleCallBack) {
    __privateFieldMap.get(this)!.beforeStarts.push(value);
  }
  public get beforeStarts(): T_LifecycleCallBack[] {
    return __privateFieldMap.get(this)!.beforeStarts;
  }
  public set starts(value: T_LifecycleCallBack) {
    __privateFieldMap.get(this)!.starts.push(value);
  }
  public get starts(): T_LifecycleCallBack[] {
    return __privateFieldMap.get(this)!.starts;
  }
  public set beforeUpdates(value: T_LifecycleCallBack) {
    __privateFieldMap.get(this)!.beforeUpdates.push(value);
  }
  public get beforeUpdates(): T_LifecycleCallBack[] {
    return __privateFieldMap.get(this)!.beforeUpdates;
  }
  public set updates(value: T_LifecycleCallBack) {
    __privateFieldMap.get(this)!.updates.push(value);
  }
  public get updates(): T_LifecycleCallBack[] {
    return __privateFieldMap.get(this)!.updates;
  }
  public set afterUpdates(value: T_LifecycleCallBack) {
    __privateFieldMap.get(this)!.afterUpdates.push(value);
  }
  public get afterUpdates(): T_LifecycleCallBack[] {
    return __privateFieldMap.get(this)!.afterUpdates;
  }
  public set nextFrames(value: T_LifecycleCallBack) {
    __privateFieldMap.get(this)!.nextFrames.push(value);
  }
  public get nextFrames(): T_LifecycleCallBack[] {
    return __privateFieldMap.get(this)!.nextFrames;
  }
  public set destroys(value: T_LifecycleCallBack) {
    __privateFieldMap.get(this)!.destroys.push(value);
  }
  public get destroys(): T_LifecycleCallBack[] {
    return __privateFieldMap.get(this)!.destroys;
  }
  public set resizes(value: T_ResizeCallBack) {
    __privateFieldMap.get(this)!.resizes.push(value);
  }
  public get resizes(): T_ResizeCallBack[] {
    return __privateFieldMap.get(this)!.resizes;
  }
  // 渲染引擎
  public set engine(value: BaseRenderEngine) {
    __privateFieldMap.get(this)!.engine = value;
  }
  public get engine(): BaseRenderEngine | null {
    return __privateFieldMap.get(this)!.engine;
  }
  // 文本配置
  public textConfig: T_TextConfig | null = null;

  private static __instance: GlobalStore | null = null;
  private constructor() {
    __privateFieldMap.set(this, {
      // 生命周期函数
      awakes: [],
      beforeStarts: [],
      starts: [],
      beforeUpdates: [],
      updates: [],
      afterUpdates: [],
      nextFrames: [],
      destroys: [],
      resizes: [],
      engine: null,
    });
  }

  public static getInstance(): GlobalStore {
    if (!GlobalStore.__instance) {
      GlobalStore.__instance = new GlobalStore();
    }
    return GlobalStore.__instance;
  }

  public runLifecycleCallBack(type: T_LifecycleType) {
    if (type === 'resizes') return;
    const runs = __privateFieldMap.get(this)![type];
    if (type === 'nextFrames') {
      const newNextFrames: T_LifecycleCallBack[] = [];
      for (const run of runs) {
        if (run.delay <= 0) {
          run.func();
          continue;
        }
        newNextFrames.push({ func: run.func, delay: run.delay - 1 });
      }
      __privateFieldMap.get(this)!.nextFrames = newNextFrames;
    } else {
      for (const run of runs) {
        run.func();
      }
    }
  }

  public clearLifecycleCallBack(type: T_LifecycleType) {
    __privateFieldMap.get(this)![type].length = 0;
  }
}
