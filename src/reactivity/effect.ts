export let activeEffect: ReactiveEffect | undefined;
import { Dep, createDep } from "./dep";
import { ComputedRefImpl } from "./computed";
import { isArray, extend } from "./shared";

// 合并effects
const effectsMap = new Map<any, Function>();
// 分类数据类型：增、删、改
const effectDataMap = new WeakMap();

export function runTrigger() {
    effectsMap.forEach((fn, key) => {
        if (effectDataMap.has(key)) {
            fn(effectDataMap.get(key));
            effectDataMap.delete(key);
        } else {
            fn();
        }
    })
    effectsMap.clear();
}

export type EffectScheduler = (...args: any[]) => any;

/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. `key`：响应性对象
 * 2. `value`：`Map` 对象
 *      1. `key`：响应性对象的指定属性
 *      2. `value`：指定对象的指定属性的 执行函数
 */
type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<object, KeyToDepMap>();

export function trackEffects(dep: Dep) {
    dep.add(activeEffect!);
}

export function track(target: object, key: unknown) {
    if (!activeEffect) return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }
    trackEffects(dep);
    activeEffect = void 0;
}

export function triggerEffect(effect: ReactiveEffect, data?: any) {
    if (effect.scheduler) {
        effect.scheduler();
    } else {
        effect.fn(data);
    }
}

export function triggerEffects(dep: Dep, data?: any) {
    const effects = isArray(dep) ? dep : [...dep];
    for (const effect of effects) {
        if (effect.computed) {
            triggerEffect(effect, data);
        }
    }
    for (const effect of effects) {
        if (!effect.computed) {
            triggerEffect(effect, data);
        }
    }
}

export function trigger(target: object, key?: unknown, type?: string, newValue?: any) {
    if (type !== void 0 && newValue !== void 0) {
        const dataMap = effectDataMap.get(target) || {
            append: new Map(),
            remove: new Map(),
            modify: new Map()
        };
        switch(type) {
            case "APPEND":
                if (dataMap.remove.has(newValue.id)) {
                    // 同一帧内首先删除再添加，则不触发APPEND和REMOVE，合并成MODIFY
                    dataMap.remove.delete(newValue.id);
                    dataMap.modify.set(newValue.id, newValue.data);
                } else if (dataMap.modify.has(newValue.id)) {
                    dataMap.modify.set(newValue.id, newValue.data);
                } else {
                    dataMap.append.set(newValue.id, newValue.data);
                }
                break;
            case "REMOVE":
                if (dataMap.append.has(newValue.id)) {
                    // 同一帧内首先添加后删除，则不触发APPEND和REMOVE
                    dataMap.append.delete(newValue.id);
                } else if (dataMap.modify.has(newValue.id)) {
                    // 同一帧内首先修改后删除，则不触发MODIFY
                    dataMap.modify.delete(newValue.id);
                    dataMap.remove.set(newValue.id, newValue.data);
                } else {
                    dataMap.remove.set(newValue.id, newValue.data);
                }
                break;
            case "CLEAR": 
                dataMap.append.clear();
                dataMap.modify.clear();
                newValue.data.forEach((id: string) => {
                    dataMap.remove.set(id, null);
                });
                break;
            case "MODIFY":
                dataMap.modify.set(newValue.id, newValue.data);
                break;
            default:
                break;
        }
        effectDataMap.set(target, dataMap);
    }
    // 合并effects
    if(!effectsMap.has(target)) {
        effectsMap.set(target, (data?: any) => {
            const depsMap = targetMap.get(target);
            if (!depsMap) return;
            const dep: Dep | undefined = depsMap.get(key);
            if (!dep) return;
            triggerEffects(dep, data);
        });
    }
}

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
    public computed?: ComputedRefImpl<T>;
    constructor(public fn: (data?: any) => T, public scheduler: EffectScheduler | null = null) {}
    run(data?: any) {
        activeEffect = this;
        return this.fn(data);
    }
}

export interface ReactiveEffectOptions {
    lazy?: boolean;
    scheduler?: EffectScheduler;
}

export function effect<T = any>(fn: (data?: any) => T, options?: ReactiveEffectOptions) {
    const _effect = new ReactiveEffect(fn);
    if (options) {
        extend(_effect, options);
    }
    if (!options || !options.lazy) {
        _effect.run();
    }
}