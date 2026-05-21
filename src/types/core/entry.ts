import z from "zod/v4";

const syncLabelConfigSchema = z.object({
    element: z.union([z.string(), z.instanceof(Element)]).describe("渲染元素选择器或元素对象"),
});
export type T_SyncLabelConfig = z.infer<typeof syncLabelConfigSchema>;