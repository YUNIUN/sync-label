export const isArray = Array.isArray;

export const isObject = (val: unknown): boolean => val !== null && typeof val === "object";

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

export const isFunction = (val: unknown): val is Function => typeof val === "function";

export const extend = Object.assign;

export const isString = (val: unknown): val is string => typeof val === "string";

export const isIntegerKey = (key: unknown): boolean => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (
  val: object,
  key: string | symbol,
): key is keyof typeof val => hasOwnProperty.call(val, key)