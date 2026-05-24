import type { BufferGeometry, Material } from 'three';

import type { BaseStandalonePrimitive } from '../renderEngine/primitives/baseStandalonePrimitive';
import {
  cameraConfigSchema,
  rendererConfigSchema,
  sceneConfigSchema,
  T_CameraConfig,
  T_EngineOutput,
  T_RenderEngineConfig,
  T_RendererConfig,
  T_SceneConfig,
} from '../types/renderEngine/renderEngine';

export abstract class BaseRenderEngine {
  protected __sceneConfig: T_SceneConfig;
  protected __cameraConfig: T_CameraConfig;
  protected __rendererConfig: T_RendererConfig;
  constructor(config: T_RenderEngineConfig) {
    const sceneParsed = sceneConfigSchema.safeParse(config.scene);
    if (!sceneParsed.success) {
      throw new Error(`Invalid scene config: ${sceneParsed.error}`);
    }
    this.__sceneConfig = sceneParsed.data;

    const cameraParsed = cameraConfigSchema.safeParse(config.camera);
    if (!cameraParsed.success) {
      throw new Error(`Invalid camera config: ${cameraParsed.error}`);
    }
    this.__cameraConfig = cameraParsed.data;

    const rendererParsed = rendererConfigSchema.safeParse(config.renderer);
    if (!rendererParsed.success) {
      throw new Error(`Invalid renderer config: ${rendererParsed.error}`);
    }
    this.__rendererConfig = rendererParsed.data;
  }
  abstract init(): T_EngineOutput;
  abstract render(): void;
  abstract destroy(): void;
  abstract resize(entry: ResizeObserverEntry): void;
  abstract generateStandalonePrimitive(
    sourceGeometry: BufferGeometry,
    material: Material,
    renderOrder: number,
  ): BaseStandalonePrimitive;
  abstract generateDependentPrimitive(): void;
  abstract generateDependentLinePrimitive(): void;
  abstract generateDependentTextPrimitive(): void;
}
