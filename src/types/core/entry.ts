import z from "zod/v4";
import { renderEngineConfigSchema } from "../renderEngine/renderEngine";

const syncLabelConfigSchema = z.object({
    engine: renderEngineConfigSchema.describe("渲染引擎配置"),
});
export type T_SyncLabelConfig = z.infer<typeof syncLabelConfigSchema>;