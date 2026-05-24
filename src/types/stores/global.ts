import z from 'zod/v4';

import { BaseRenderEngine } from '../../renderEngine/BaseRenderEngine';

// 生命周期回调函数
const callBackSchema = z.function({
  input: [],
  output: z.void(),
});
export type T_VoidCallBack = z.infer<typeof callBackSchema>;
const lifecycleCallBackSchema = z.object({
  func: callBackSchema.describe('回调函数'),
  delay: z.number().default(0).describe('延迟帧数'),
});
export type T_LifecycleCallBack = z.infer<typeof lifecycleCallBackSchema>;
// resize回调函数
const resizeCallBackSchema = z.function({
  input: [z.instanceof(ResizeObserverEntry)],
  output: z.void(),
});
export type T_ResizeCallBack = z.infer<typeof resizeCallBackSchema>;

// 生命周期类型
const lifecycleTypeSchema = z.enum([
  'awakes',
  'beforeStarts',
  'starts',
  'beforeUpdates',
  'updates',
  'afterUpdates',
  'nextFrames',
  'destroys',
  'resizes',
]);
export type T_LifecycleType = z.infer<typeof lifecycleTypeSchema>;

// 私有字段
const privateFieldSchema = z.object({
  awakes: z.array(lifecycleCallBackSchema),
  beforeStarts: z.array(lifecycleCallBackSchema),
  starts: z.array(lifecycleCallBackSchema),
  beforeUpdates: z.array(lifecycleCallBackSchema),
  updates: z.array(lifecycleCallBackSchema),
  afterUpdates: z.array(lifecycleCallBackSchema),
  nextFrames: z.array(lifecycleCallBackSchema),
  destroys: z.array(lifecycleCallBackSchema),
  resizes: z.array(resizeCallBackSchema),
  engine: z.instanceof(BaseRenderEngine).nullable(),
});
export type T_PrivateField = z.infer<typeof privateFieldSchema>;
