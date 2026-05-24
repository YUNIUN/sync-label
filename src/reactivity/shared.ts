export const isArray = Array.isArray;

export const isObject = (val: unknown): boolean => val !== null && typeof val === 'object';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 允许 any
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- 允许使用Function
export const isFunction = (val: unknown): val is Function => typeof val === 'function';

export const extend = Object.assign;

export const isString = (val: unknown): val is string => typeof val === 'string';

export const isIntegerKey = (key: unknown): boolean =>
  isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val =>
  hasOwnProperty.call(val, key);
