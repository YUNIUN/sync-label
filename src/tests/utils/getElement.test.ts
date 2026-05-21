import { getElement } from "../../utils/getElement";

// 创建测试用的 DOM 元素
function createTestElements() {
  // 创建一个模拟的 DOM 环境
  const div = document.createElement("div");
  div.id = "test-div";
  div.className = "test-class";
  document.body.appendChild(div);
  
  const span = document.createElement("span");
  span.className = "test-span";
  document.body.appendChild(span);
  
  return { div, span };
}

function cleanupTestElements() {
  const testDiv = document.getElementById("test-div");
  if(testDiv) {
    document.body.removeChild(testDiv);
  }
  const testSpan = document.querySelector(".test-span");
  if(testSpan) {
    document.body.removeChild(testSpan);
  }
}

describe("getElement", () => {
  beforeEach(() => {
    // 在每个测试之前清理之前的元素
    cleanupTestElements();
  });

  afterEach(() => {
    // 在每个测试之后进行清理
    cleanupTestElements();
  });

  // 测试传入字符串选择器的情况
  it("should return element when selector is a valid string", () => {
    const { div } = createTestElements();
    
    const result = getElement("#test-div");
    expect(result).toBe(div);
  });

  it("should return null when selector is an invalid string", () => {
    const result = getElement("#non-existent-element");
    expect(result).toBeNull();
  });

  it("should return element when selector is a valid class string", () => {
    const { div } = createTestElements();
    
    const result = getElement(".test-class");
    expect(result).toBe(div);
  });

  // 测试传入 Element 对象的情况
  it("should return the same element when selector is already an Element", () => {
    const { div } = createTestElements();
    
    const result = getElement(div);
    expect(result).toBe(div);
  });

  // 测试边界情况
  it("should return null when selector is an empty string", () => {
    const result = getElement("");
    expect(result).toBeNull();
  });

  it("should return null when selector is not a string or Element", () => {
    // @ts-ignore - 测试无效输入类型
    const result = getElement(null);
    expect(result).toBeNull();

    // @ts-ignore - 测试无效输入类型
    const result2 = getElement(undefined);
    expect(result2).toBeNull();

    // @ts-ignore - 测试无效输入类型
    const result3 = getElement(123);
    expect(result3).toBeNull();

    // @ts-ignore - 测试无效输入类型
    const result4 = getElement({});
    expect(result4).toBeNull();
  });
});