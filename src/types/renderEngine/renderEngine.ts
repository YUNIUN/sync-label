import z from "zod/v4";
import { colorSchema, vector3Schema, vector4Schema } from "../common";
import { threejsEngineOutputSchema } from "./threejsEngine";

// | 摄像机配置
// |-- 相机类型
const cameraTypeSchema = z.enum(["PERSPECTIVE", "ORTHOGRAPHIC"]);
export type T_CameraType = z.infer<typeof cameraTypeSchema>;
// |-- 透视相机配置选项
const perspectiveConfigSchema = z.object({
  type: z.literal("PERSPECTIVE"),
  fov: z.number(),
  aspect: z.number(),
  near: z.number(),
  far: z.number(),
});
// |-- 正交相机配置选项
export type T_PerspectiveConfig = z.infer<typeof perspectiveConfigSchema>;
const orthographicConfigSchema = z.object({
  type: z.literal("ORTHOGRAPHIC"),
  left: z.number(),
  right: z.number(),
  top: z.number(),
  bottom: z.number(),
  near: z.number(),
  far: z.number(),
});
export type T_OrthographicConfig = z.infer<typeof orthographicConfigSchema>;
// |-- 相机配置选项
export const cameraConfigSchema = z.object({
  config: z
    .union([orthographicConfigSchema, perspectiveConfigSchema])
    .default({
      type: "PERSPECTIVE",
      fov: 75,
      aspect: 2,
      near: 0.1,
      far: 100,
    })
    .describe("相机配置"),
  position: vector3Schema.default({ x: 0, y: 10, z: 0 }).describe("相机位置"),
  lookAt: vector3Schema.default({ x: 0, y: 0, z: 0 }).describe("相机lookAt"),
  quaternion: vector4Schema
    .optional()
    .describe("相机四元数"),
  up: vector3Schema.default({ x: 0, y: 1, z: 0 }).describe("相机up"),
});
export type T_CameraConfig = z.infer<typeof cameraConfigSchema>;

// | 场景配置
// |-- 渲染场景配置
export const sceneConfigSchema = z.object({
  background: colorSchema
    .default({
      r: 0,
      g: 0,
      b: 0,
      a: 255,
    })
    .describe("场景配置"),
});
export type T_SceneConfig = z.infer<typeof sceneConfigSchema>;

// | 渲染器配置
export const rendererConfigSchema = z.object({
  element: z.instanceof(Element).describe("渲染目标元素"),
  logarithmicDepthBuffer: z
    .boolean()
    .default(true)
    .describe("是否开启对数深度缓冲区"),
  precision: z
    .enum(["lowp", "mediump", "highp"])
    .default("highp")
    .describe("渲染精度"),
  premultipliedAlpha: z.boolean().default(true).describe("是否开启预乘Alpha"),
  antialias: z.boolean().default(true).describe("是否开启抗锯齿"),
  preserveDrawingBuffer: z
    .boolean()
    .default(true)
    .describe("是否保存绘图缓冲区"),
  powerPreference: z
    .enum(["default", "high-performance", "low-power"])
    .default("high-performance")
    .describe("渲染性能"),
  alpha: z.boolean().default(false).describe("是否开启透明"),
  outputColorSpace: z
    .enum(["", "srgb", "srgb-linear"])
    .default("srgb-linear")
    .describe("输出颜色空间"),
});
export type T_RendererConfig = z.infer<typeof rendererConfigSchema>;

// | 渲染引擎
// |-- 渲染引擎类型
const renderEngineTypeSchema = z.enum(["WEBGL", "WEBGPU", "THREEJS"]);
export type T_RenderEngineType = z.infer<typeof renderEngineTypeSchema>;
// |-- 渲染引擎配置
export const renderEngineConfigSchema = z.object({
  engineType: renderEngineTypeSchema.describe(
    "渲染引擎类型: WEBGL | WEBGPU | THREEJS",
  ),
  camera: cameraConfigSchema,
  scene: sceneConfigSchema,
  renderer: rendererConfigSchema,
});
export type T_RenderEngineConfig = z.infer<typeof renderEngineConfigSchema>;

export const engineOutputSchema = z.union([
  threejsEngineOutputSchema,
  // webglEngineOutputSchema,
  // webgpuEngineOutputSchema,
]);
export type T_EngineOutput = z.infer<typeof engineOutputSchema>;