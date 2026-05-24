/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dep } from './dep';
import { ReactiveEffect } from './effect';
import { trackRefValue, triggerRefValue } from './ref';
import { isFunction } from './shared';

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined;
  public readonly __v_isRef = true;
  // dirty标记,当依赖的值发生变化时,dirty为true,下次取值时重新计算。
  public _dirty = true;

  private _value!: T;
  private effect: ReactiveEffect<any>;
  constructor(getter: () => T) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        // 触发依赖dep
        triggerRefValue(this);
      }
    });
    this.effect.computed = this;
  }

  get value() {
    trackRefValue(this); // 把effect加入dep
    if (this._dirty) {
      // 脏数据则重新计算
      this._dirty = false;
      this._value = this.effect.run(); // 执行computed的getter
    }
    // this._value = this.effect.run();
    return this._value;
  }
}

export function computed<T>(getterOrOption: () => T) {
  let getter;
  const onlyGetter = isFunction(getterOrOption);
  if (onlyGetter) {
    getter = getterOrOption;
  } else {
    // getter = getterOrOption.get
  }
  const cRef = new ComputedRefImpl<T>(getter!);
  return cRef;
}
