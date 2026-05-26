import {
  T_DependentDrawData,
  T_DependentTextDrawData,
  T_IDType,
  T_StandaloneDrawData,
} from '../../types/renderEngine/renderEngine';

// 独立的标注基类
export abstract class BasePrimitive {
  constructor() {}

  abstract draw(data?: T_StandaloneDrawData | T_DependentTextDrawData | T_DependentDrawData): void;

  abstract isFull(): boolean;

  abstract getRestNum(): number;

  abstract has(id: T_IDType): boolean;
}
