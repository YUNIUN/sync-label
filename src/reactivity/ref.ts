/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComputedRefImpl } from './computed';
import { createDep, Dep } from './dep';
import { activeEffect, trackEffects, triggerEffects } from './effect';
import { toReactive } from './reactive';
import { hasChanged } from './shared';

export interface Ref<T = any> {
  value: T;
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true);
}

export function trackRefValue(ref: RdfImpl<any> | ComputedRefImpl<any>) {
  // 用于追踪ref的value
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()));
  }
}

export function triggerRefValue(ref: RdfImpl<any> | ComputedRefImpl<any>) {
  // 用于触发ref的value
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}

class RdfImpl<T> {
  public readonly __v_isRef = true;
  public dep?: Dep = undefined;
  private _value: T;
  private _rawValue: T;
  constructor(
    value: T,
    public readonly __v_isShallow: boolean,
  ) {
    this._value = __v_isShallow ? value : toReactive(value);
    this._rawValue = value;
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue: T) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = toReactive(newValue);
      triggerRefValue(this);
    }
  }
}

export function createRdf(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RdfImpl(rawValue, shallow);
}

export function ref(value?: unknown) {
  return createRdf(value, false);
}
