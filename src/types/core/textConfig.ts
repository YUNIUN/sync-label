import z from 'zod/v4';

import textImage from '../../assets/text.jpg';
import textUvJson from '../../assets/text.json';

export const textConfigSchema = z
  .object({
    image: z.string().default(textImage).describe('文字图片'),
    uvJson: z
      .record(z.string(), z.array(z.number()).length(4))
      .default(textUvJson)
      .describe('文字图片的uv坐标'),
  })
  .optional()
  .default({
    image: textImage,
    uvJson: textUvJson,
  })
  .describe('文字配置');
export type T_TextConfig = z.infer<typeof textConfigSchema>;
