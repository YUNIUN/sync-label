import {
  colorSchema,
  hexColorSchema,
  objColorSchema,
  strColorSchema,
  T_Color,
  T_ObjColor,
} from '../types/common';

export function standardizeColor(color: Partial<T_Color>): Required<T_ObjColor> {
  let parseRes = colorSchema.safeParse(color);
  if (!parseRes.success) {
    throw new Error(`Invalid color: ${color}`);
  }
  const result = { r: 0, g: 0, b: 0, a: 255 };
  // 颜色对象处理
  parseRes = objColorSchema.safeParse(color as T_ObjColor);
  if (parseRes.success) {
    return parseRes.data as Required<T_ObjColor>;
  }
  // 文字颜色处理
  parseRes = strColorSchema.safeParse(color as string);
  if (parseRes.success) {
    let str = parseRes.data as string;
    if (/^#([0-9a-f]{3})$/i.test(str)) {
      str = `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}ff`;
    } else if (/^#([0-9a-f]{6})$/i.test(str)) {
      str += 'ff';
    }
    if (/^#([0-9a-f]{8})$/i.test(str)) {
      result.r = parseInt(str.substring(1, 3), 16);
      result.g = parseInt(str.substring(3, 5), 16);
      result.b = parseInt(str.substring(5, 7), 16);
      result.a = parseInt(str.substring(7, 9), 16);
      return result;
    } else {
      throw new Error(`Invalid color: ${color}`);
    }
  }
  // 16进制颜色转RGB颜色
  parseRes = hexColorSchema.safeDecode(color as number);
  if (parseRes.success) {
    const a = (0xff000000 & (parseRes.data as number)) >>> 24;
    const b = (0x00ff0000 & (parseRes.data as number)) >>> 16;
    const g = (0x0000ff00 & (parseRes.data as number)) >>> 8;
    const r = (0x000000ff & (parseRes.data as number)) >>> 0;
    return { r, g, b, a };
  }

  return result;
}
