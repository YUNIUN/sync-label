import z from 'zod/v4';

// 颜色类型
export const objColorSchema = z.object({
  r: z.number().min(0).max(255).default(0),
  g: z.number().min(0).max(255).default(0),
  b: z.number().min(0).max(255).default(0),
  a: z.number().min(0).max(255).default(255),
});
export type T_ObjColor = z.infer<typeof objColorSchema>;
export const strColorSchema = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
export const hexColorSchema = z.number().min(0).max(0xffffffff);
export const colorSchema = z.union([objColorSchema, strColorSchema, hexColorSchema]);
export type T_Color = z.infer<typeof colorSchema>;

// 位置类型
export const vector2Schema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
});
export const vector3Schema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});
export const vector4Schema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
  w: z.number().default(0),
});
export type T_Vector2 = z.infer<typeof vector2Schema>;
export type T_Vector3 = z.infer<typeof vector3Schema>;
export type T_Vector4 = z.infer<typeof vector4Schema>;

const sphereBoundingSchema = z.object({
  isSphereBounding: z.literal(true),
  center: vector3Schema,
  radius: z.number(),
});
const boxBoundingSchema = z.object({
  isBoxBounding: z.literal(true),
  min: vector3Schema,
  max: vector3Schema,
});
const boundingSchema = z.union([sphereBoundingSchema, boxBoundingSchema]);
export type T_SphereBounding = z.infer<typeof sphereBoundingSchema>;
export type T_BoxBounding = z.infer<typeof boxBoundingSchema>;
export type T_Bounding = z.infer<typeof boundingSchema>;
const octreeSchema = z.record(z.string(), z.any());
export type T_Octree = z.infer<typeof octreeSchema>;
