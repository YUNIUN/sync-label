import { track, trigger } from "./effect";

const ITERATE_KEY = Symbol("iterate");

function handleMapSet(target: object, key: unknown, res: any) {
    if (target instanceof Map || target instanceof WeakMap) {
        switch (key) {
            case "get":
                return function (key: any) {
                    key = key.toString();
                    const value = res.call(target, key);
                    // track(target, key);
                    return value;
                };
            case "set":
                return function (key: any, value: any) {
                    key = key.toString();
                    const hadKey = target.has(key);
                    const oldValue = hadKey ? target.get(key) : undefined;
                    const result = res.call(target, key, value);
                    
                    if (!hadKey) {
                        // trigger(target, key);
                        trigger(target, ITERATE_KEY, "APPEND", {id:key, data: value});
                        trigger(target, "size", "APPEND", {id:key, data: value});
                    } else if (value !== oldValue) {
                        trigger(target, ITERATE_KEY, "MODIFY", {id:key, data: value});
                        trigger(target, key, "MODIFY", {id:key, data: value});
                    }
                    return result;
                };
            case "has":
                return function (key: any) {
                    key = key.toString();
                    const result = res.call(target, key);
                    // track(target, key);
                    return result;
                };
            case "delete":
                return function (key: any) {
                    key = key.toString();
                    const hadKey = target.has(key);
                    const result = res.call(target, key);
                    if (hadKey) {
                        // trigger(target, key);
                        trigger(target, ITERATE_KEY, "REMOVE", {id: key, data: null});
                        trigger(target, "size", "REMOVE", {id: key, data: null});
                    }
                    return result;
                };
            case "clear":
                return function () {
                    const hadItems = (target as any).size > 0;
                    const keys = Array.from((target as any).keys());
                    const result = res.call(target);
                    if (hadItems) {
                        trigger(target, ITERATE_KEY, "CLEAR", {id: "", data: keys });
                        trigger(target, "size", "CLEAR", {id: "", data: keys });
                    }
                    return result;
                };
            case "forEach":
                return function (callback: any, thisArg?: any) {
                    res.call(target, (value: any, key: any) => {
                        // track(target, key);
                        callback.call(thisArg, value, key, target);
                    });
                    // track(target, ITERATE_KEY);
                };
            case "entries":
            case "keys":
            case "values":
                return function () {
                    // track(target, ITERATE_KEY);
                    return res.call(target);
                };
            case Symbol.iterator:
                // track(target, ITERATE_KEY);
                return res.call(target);
            case "trackMe": 
                track(target, ITERATE_KEY);
                return () => {};
            default:
                return res;
        }
    }
}

function createGetter() {
    return function get(target: object, key: string | symbol, receiver: object) {
        // Reflect.get方法返回target对象的key属性
        let res = null;
        if ((target instanceof Map || target instanceof WeakMap) && key === "size") {
            res = Reflect.get(target, key);
        } else {
            res = Reflect.get(target, key, receiver);
        }
        const func = handleMapSet(target, key, res);
        if (func) return func;
        // 收集依赖
        track(target, key);
        return res;
    };
}
function createSetter() {
    return function set(target: object, key: string | symbol, value: any, receiver: object) {
        // Reflect.set方法设置target对象的key属性为value
        const res = Reflect.set(target, key, value, receiver);
        // 触发更新
        trigger(target, key);
        return res;
    };
}

const get = createGetter();
const set = createSetter();

export const mutableHandlers: ProxyHandler<object> = {
    get,
    set
};