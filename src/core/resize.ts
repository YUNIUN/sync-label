import { T_ResizeCallBack } from '../types/stores/global';
const map = new WeakMap<Element, T_ResizeCallBack>();
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    map.get(entry.target)?.(entry);
  }
});

export function bind(element: Element, callback: T_ResizeCallBack) {
  resizeObserver.observe(element);
  map.set(element, callback);
}
