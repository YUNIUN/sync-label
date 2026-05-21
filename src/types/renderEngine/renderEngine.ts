import z from "zod/v4";
import { colorSchema, vector3Schema, vector4Schema } from "../common";
// import THREE from "three";

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

// | 渲染引擎
// |-- 渲染引擎类型
const renderEngineTypeSchema = z.enum(["WEBGL", "WEBGPU", "THREEJS"]);
export type T_RenderEngineType = z.infer<typeof renderEngineTypeSchema>;
// |-- 渲染场景配置
const renderSceneConfigSchema = z.object({
    background: colorSchema.optional(),
});

export const renderEngineConfigSchema = z.object({
    engineType: renderEngineTypeSchema.describe("渲染引擎类型: WEBGL | WEBGPU | THREEJS"),
    camera: z.object({
        config: z.union([orthographicConfigSchema, perspectiveConfigSchema]).default({
            type: "PERSPECTIVE",
            fov: 75,
            aspect: 2,
            near: 0.1,
            far: 100,
        }).describe("相机配置"),
        position: vector3Schema.default({ x: 0, y: 0, z: 0 }).describe("相机位置"),
        lookAt: vector3Schema.default({ x: 0, y: 0, z: 0 }).describe("相机lookAt"),
        quaternion: vector4Schema.default({ x: 0, y: 0, z: 0, w: 1 }).describe("相机四元数"),
        up: vector3Schema.default({ x: 0, y: 1, z: 0 }).describe("相机up"),
    }),
    scene: renderSceneConfigSchema.default({
        background: { r: 0, g: 0, b: 0, a: 255 }
    }).describe("场景配置"),
});
export type T_RenderEngineConfig = z.infer<typeof renderEngineConfigSchema>;