import { GlobalStore } from '../stores/globalStore';
import { T_ResizeCallBack, T_VoidCallBack } from '../types/stores/global';

export function onAwake(callback: T_VoidCallBack) {
  GlobalStore.getInstance().awakes = { func: callback, delay: 0 };
}

export function onBeforeStart(callback: T_VoidCallBack) {
  GlobalStore.getInstance().beforeStarts = { func: callback, delay: 0 };
}

export function onStart(callback: T_VoidCallBack) {
  GlobalStore.getInstance().starts = { func: callback, delay: 0 };
}

export function onBeforeUpdate(callback: T_VoidCallBack) {
  GlobalStore.getInstance().beforeUpdates = { func: callback, delay: 0 };
}

export function onUpdate(callback: T_VoidCallBack) {
  GlobalStore.getInstance().updates = { func: callback, delay: 0 };
}

export function onAfterUpdate(callback: T_VoidCallBack) {
  GlobalStore.getInstance().afterUpdates = { func: callback, delay: 0 };
}

export function onNextFrame(callback: T_VoidCallBack, delay = 0) {
  GlobalStore.getInstance().nextFrames = { func: callback, delay };
}

export function onDestroy(callback: T_VoidCallBack) {
  GlobalStore.getInstance().destroys = { func: callback, delay: 0 };
}

export function onResize(callback: T_ResizeCallBack) {
  GlobalStore.getInstance().resizes = callback;
}
