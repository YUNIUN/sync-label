import {
  onAfterUpdate,
  onAwake,
  onBeforeStart,
  onBeforeUpdate,
  onDestroy,
  onNextFrame,
  onResize,
  onStart,
  onUpdate,
} from '../../core/lifecycle';
import { GlobalStore } from '../../stores/globalStore';
import { T_ResizeCallBack, T_VoidCallBack } from '../../types/stores/global';

describe('lifecycle', () => {
  let globalStore: GlobalStore;

  beforeEach(() => {
    // 获取全局存储实例并清空生命周期回调
    globalStore = GlobalStore.getInstance();
    globalStore.clearLifecycleCallBack('awakes');
    globalStore.clearLifecycleCallBack('beforeStarts');
    globalStore.clearLifecycleCallBack('starts');
    globalStore.clearLifecycleCallBack('beforeUpdates');
    globalStore.clearLifecycleCallBack('updates');
    globalStore.clearLifecycleCallBack('afterUpdates');
    globalStore.clearLifecycleCallBack('nextFrames');
    globalStore.clearLifecycleCallBack('destroys');
    globalStore.clearLifecycleCallBack('resizes');
  });

  describe('onAwake', () => {
    it('should add callback to awakes array', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onAwake(mockCallback);

      globalStore.runLifecycleCallBack('awakes');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should add callback with delay 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onAwake(mockCallback);

      const awakes = globalStore.awakes;
      expect(awakes).toHaveLength(1);
      expect(awakes[0]).toEqual({ func: mockCallback, delay: 0 });
    });
  });

  describe('onBeforeStart', () => {
    it('should add callback to beforeStarts array', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onBeforeStart(mockCallback);

      globalStore.runLifecycleCallBack('beforeStarts');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should add callback with delay 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onBeforeStart(mockCallback);

      const beforeStarts = globalStore.beforeStarts;
      expect(beforeStarts).toHaveLength(1);
      expect(beforeStarts[0]).toEqual({ func: mockCallback, delay: 0 });
    });
  });

  describe('onStart', () => {
    it('should add callback to starts array', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onStart(mockCallback);

      globalStore.runLifecycleCallBack('starts');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should add callback with delay 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onStart(mockCallback);

      const starts = globalStore.starts;
      expect(starts).toHaveLength(1);
      expect(starts[0]).toEqual({ func: mockCallback, delay: 0 });
    });
  });

  describe('onBeforeUpdate', () => {
    it('should add callback to beforeUpdates array', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onBeforeUpdate(mockCallback);

      globalStore.runLifecycleCallBack('beforeUpdates');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should add callback with delay 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onBeforeUpdate(mockCallback);

      const beforeUpdates = globalStore.beforeUpdates;
      expect(beforeUpdates).toHaveLength(1);
      expect(beforeUpdates[0]).toEqual({ func: mockCallback, delay: 0 });
    });
  });

  describe('onUpdate', () => {
    it('should add callback to updates array', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onUpdate(mockCallback);

      globalStore.runLifecycleCallBack('updates');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should add callback with delay 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onUpdate(mockCallback);

      const updates = globalStore.updates;
      expect(updates).toHaveLength(1);
      expect(updates[0]).toEqual({ func: mockCallback, delay: 0 });
    });
  });

  describe('onAfterUpdate', () => {
    it('should add callback to afterUpdates array', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onAfterUpdate(mockCallback);

      globalStore.runLifecycleCallBack('afterUpdates');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should add callback with delay 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onAfterUpdate(mockCallback);

      const afterUpdates = globalStore.afterUpdates;
      expect(afterUpdates).toHaveLength(1);
      expect(afterUpdates[0]).toEqual({ func: mockCallback, delay: 0 });
    });
  });

  describe('onNextFrame', () => {
    it('should add callback to nextFrames array with default delay 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onNextFrame(mockCallback);

      const nextFrames = globalStore.nextFrames;
      expect(nextFrames).toHaveLength(1);
      expect(nextFrames[0]).toEqual({ func: mockCallback, delay: 0 });
    });

    it('should add callback to nextFrames array with specified delay', () => {
      const mockCallback: T_VoidCallBack = jest.fn();
      const delay = 5;

      onNextFrame(mockCallback, delay);

      const nextFrames = globalStore.nextFrames;
      expect(nextFrames).toHaveLength(1);
      expect(nextFrames[0]).toEqual({ func: mockCallback, delay });
    });

    it('should execute callback immediately when delay is 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onNextFrame(mockCallback, 0);

      globalStore.runLifecycleCallBack('nextFrames');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should decrease delay and execute callback when delay reaches 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onNextFrame(mockCallback, 2);

      // 第一次运行后，延迟应该减少到1，回调不应该被执行
      globalStore.runLifecycleCallBack('nextFrames');
      expect(mockCallback).not.toHaveBeenCalled();

      // 再次运行，延迟减少到0，此时应该调用回调
      globalStore.runLifecycleCallBack('nextFrames');
      expect(mockCallback).not.toHaveBeenCalled(); // 还没执行，因为延迟是1->0

      // 再次运行，延迟是0，此时应该执行回调
      globalStore.runLifecycleCallBack('nextFrames');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDestroy', () => {
    it('should add callback to destroys array', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onDestroy(mockCallback);

      globalStore.runLifecycleCallBack('destroys');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should add callback with delay 0', () => {
      const mockCallback: T_VoidCallBack = jest.fn();

      onDestroy(mockCallback);

      const destroys = globalStore.destroys;
      expect(destroys).toHaveLength(1);
      expect(destroys[0]).toEqual({ func: mockCallback, delay: 0 });
    });
  });

  describe('onResize', () => {
    it('should add callback to resizes array', () => {
      const mockCallback: T_ResizeCallBack = jest.fn();

      onResize(mockCallback);

      const resizes = globalStore.resizes;
      expect(resizes).toHaveLength(1);
      expect(resizes[0]).toBe(mockCallback);
    });

    it('should store multiple resize callbacks', () => {
      const mockCallback1: T_ResizeCallBack = jest.fn();
      const mockCallback2: T_ResizeCallBack = jest.fn();

      onResize(mockCallback1);
      onResize(mockCallback2);

      const resizes = globalStore.resizes;
      expect(resizes).toHaveLength(2);
      expect(resizes[0]).toBe(mockCallback1);
      expect(resizes[1]).toBe(mockCallback2);
    });
  });
});
