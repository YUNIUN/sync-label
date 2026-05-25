import z from 'zod/v4';

import { renderEngineConfigSchema } from '../renderEngine/renderEngine';
import { textConfigSchema } from './textConfig';

export const syncLabelConfigSchema = z.object({
  engine: renderEngineConfigSchema.describe('渲染引擎配置'),
  textConfig: textConfigSchema.optional().describe('文字配置'),
});
export type T_SyncLabelConfig = z.infer<typeof syncLabelConfigSchema>;
