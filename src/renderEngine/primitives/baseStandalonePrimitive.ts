import { T_IDType, T_StandaloneDrawData } from '@/types/renderEngine/renderEngine';

// 独立的标注基类
export abstract class BaseStandalonePrimitive {
  constructor() {}

  abstract draw(data?: T_StandaloneDrawData): void;

  abstract isFull(): boolean;

  abstract getRestNum(): number;

  abstract has(id: T_IDType): boolean;
}
