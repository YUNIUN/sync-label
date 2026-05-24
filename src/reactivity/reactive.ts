/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutableHandlers } from './baseHandlers';
import { isObject } from './shared';

// 创建一个WeakMap，用于存储响应式对象
export const reactiveMap = new WeakMap<object, object>();

// 创建响应式对象
function createReactiveObject<T extends object>(
  target: object,
  baseHandlers: ProxyHandler<T>,
  proxyMap: WeakMap<object, any>,
) {
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}

export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap);
}

export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value as object) : value;
