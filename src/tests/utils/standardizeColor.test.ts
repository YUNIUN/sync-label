import { standardizeColor } from '../../utils/standardizeColor';

describe('standardizeColor', () => {
  // 测试对象颜色格式
  it('should handle object color format', () => {
    // 测试完整的 RGBA 对象
    expect(standardizeColor({ r: 255, g: 0, b: 0, a: 255 })).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 255,
    });

    // 测试 RGB 对象（alpha 应该默认为 255）
    expect(standardizeColor({ r: 0, g: 255, b: 0 })).toEqual({
      r: 0,
      g: 255,
      b: 0,
      a: 255,
    });

    // 测试部分属性的对象
    expect(standardizeColor({ r: 100 })).toEqual({
      r: 100,
      g: 0,
      b: 0,
      a: 255,
    });

    // 测试空属性的对象
    expect(standardizeColor({})).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 255,
    });
  });

  // 测试十六进制字符串颜色格式
  it('should handle hex string color format', () => {
    // 测试 3 位十六进制颜色
    expect(standardizeColor('#f00')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 255,
    });

    // 测试 6 位十六进制颜色
    expect(standardizeColor('#00ff00')).toEqual({
      r: 0,
      g: 255,
      b: 0,
      a: 255,
    });

    // 测试 8 位十六进制颜色（包含 alpha）
    expect(standardizeColor('#0000ffff')).toEqual({
      r: 0,
      g: 0,
      b: 255,
      a: 255,
    });

    // 测试带透明度的 8 位十六进制颜色
    expect(standardizeColor('#80808080')).toEqual({
      r: 128,
      g: 128,
      b: 128,
      a: 128,
    });
  });

  // 测试数字十六进制颜色格式
  it('should handle hex number color format', () => {
    // 测试 ARGB 格式的数字（高位到低位：Alpha, Red, Green, Blue）
    // 0xFF0000FF 表示红色，完全不透明
    expect(standardizeColor(0xff0000ff)).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 255,
    });

    // 0x8000FF00 表示绿色，半透明
    expect(standardizeColor(0x8000ff00)).toEqual({
      r: 0,
      g: 255,
      b: 0,
      a: 128,
    });

    // 0x400000FF 表示蓝色，低不透明度
    expect(standardizeColor(0x400000ff)).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 64,
    });
  });

  // 测试错误输入
  it('should throw error for invalid color format', () => {
    expect(() => standardizeColor('invalid-color')).toThrow('Invalid color: invalid-color');
    expect(() => standardizeColor('#gggggg')).toThrow('Invalid color: #gggggg');
    expect(() => standardizeColor(-1)).toThrow(); // 负数超出范围
    expect(() => standardizeColor(0xffffffff + 1)).toThrow(); // 超出最大值
  });

  // 测试边界值
  it('should handle edge cases', () => {
    // 最小和最大值
    expect(standardizeColor({ r: 0, g: 0, b: 0, a: 0 })).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    });

    expect(standardizeColor({ r: 255, g: 255, b: 255, a: 255 })).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 255,
    });

    // 测试各种有效的十六进制格式
    expect(standardizeColor('#FFF')).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 255,
    });
  });
});
