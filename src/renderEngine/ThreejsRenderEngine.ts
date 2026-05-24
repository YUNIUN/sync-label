import { isArray } from 'lodash-es';
import {
  BufferGeometry,
  Camera,
  Color,
  Material,
  Mesh,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

import { T_RenderEngineConfig } from '../types/renderEngine/renderEngine';
import { T_ThreejsEngineOutput } from '../types/renderEngine/threejsEngine';
import { getElement } from '../utils/getElement';
import { standardizeColor } from '../utils/standardizeColor';
import { BaseRenderEngine } from './BaseRenderEngine';
import { StandalonePrimitive } from './primitives/threejs/standalonePrimitive';

const __privateFieldMap = new WeakMap<ThreejsRenderEngine, T_ThreejsEngineOutput>();

export class ThreejsRenderEngine extends BaseRenderEngine {
  get camera(): Camera | null {
    return __privateFieldMap.get(this)!.camera;
  }

  get renderer(): WebGLRenderer | null {
    return __privateFieldMap.get(this)!.renderer;
  }

  get scene(): Scene | null {
    return __privateFieldMap.get(this)!.scene;
  }

  constructor(config: T_RenderEngineConfig) {
    super(config);
    __privateFieldMap.set(this, {
      renderer: null,
      camera: null,
      scene: null,
    });
  }

  public init() {
    const scene = this.__initScene();
    const camera = this.__initCamera();
    const renderer = this.__initRenderer();

    return { scene, camera, renderer };
  }

  private __initScene(): Scene {
    const scene = new Scene();
    __privateFieldMap.get(this)!.scene = scene;
    if (this.__sceneConfig.background) {
      const background = standardizeColor(this.__sceneConfig.background);
      const factor = 1.0 / 255;
      scene.background = new Color(
        background.r * factor,
        background.g * factor,
        background.b * factor,
      );
    }
    return scene;
  }

  private __initCamera(): OrthographicCamera | PerspectiveCamera {
    let camera: OrthographicCamera | PerspectiveCamera;
    if (this.__cameraConfig.config.type === 'PERSPECTIVE') {
      camera = new PerspectiveCamera(
        this.__cameraConfig.config.fov,
        this.__cameraConfig.config.aspect,
        this.__cameraConfig.config.near,
        this.__cameraConfig.config.far,
      );
    } else {
      camera = new OrthographicCamera(
        this.__cameraConfig.config.left,
        this.__cameraConfig.config.right,
        this.__cameraConfig.config.top,
        this.__cameraConfig.config.bottom,
        this.__cameraConfig.config.near,
        this.__cameraConfig.config.far,
      );
    }
    camera.up.copy(this.__cameraConfig.up);
    camera.position.copy(this.__cameraConfig.position);
    if (this.__cameraConfig.quaternion) {
      camera.quaternion.copy(this.__cameraConfig.quaternion);
    } else {
      camera.lookAt(new Vector3().copy(this.__cameraConfig.lookAt));
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    __privateFieldMap.get(this)!.camera = camera;
    return camera;
  }

  private __initRenderer(): WebGLRenderer {
    const element = getElement(this.__rendererConfig.element);
    if (!element) throw new Error('element is not exist');
    let canvas: HTMLCanvasElement;
    if (element instanceof HTMLCanvasElement) {
      canvas = element;
    } else {
      canvas = document.createElement('canvas');
      element.appendChild(canvas);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }
    const renderer = new WebGLRenderer({
      logarithmicDepthBuffer: this.__rendererConfig.logarithmicDepthBuffer,
      precision: this.__rendererConfig.precision,
      premultipliedAlpha: this.__rendererConfig.premultipliedAlpha,
      antialias: this.__rendererConfig.antialias,
      preserveDrawingBuffer: this.__rendererConfig.preserveDrawingBuffer,
      powerPreference: this.__rendererConfig.powerPreference,
      alpha: this.__rendererConfig.alpha,
      canvas,
    });
    renderer.outputColorSpace = this.__rendererConfig.outputColorSpace;
    __privateFieldMap.get(this)!.renderer = renderer;
    return renderer;
  }

  public render(): void {
    const camera = __privateFieldMap.get(this)!.camera;
    const scene = __privateFieldMap.get(this)!.scene;
    const renderer = __privateFieldMap.get(this)!.renderer;
    if (camera && scene && renderer) {
      renderer.render(scene, camera);
    }
  }

  public destroy(): void {
    const camera: Camera | null = __privateFieldMap.get(this)!.camera;
    const scene: Scene | null = __privateFieldMap.get(this)!.scene;
    const renderer: WebGLRenderer | null = __privateFieldMap.get(this)!.renderer;
    if (camera) {
      __privateFieldMap.get(this)!.camera = null;
    }
    if (scene) {
      function clearObject3D(obj3d?: Object3D) {
        if (!obj3d) return;
        obj3d?.traverse((child) => {
          if (child.children && child.children.length > 0) {
            clearObject3D(child);
          }
          const { geometry, material } = child as Mesh;
          if (geometry) {
            geometry.dispose();
          }
          if (material) {
            if (isArray(material)) {
              for (const item of material) {
                item.dispose();
              }
            } else {
              material.dispose();
            }
          }
        });
        obj3d.clear();
      }
      clearObject3D(scene);
      __privateFieldMap.get(this)!.scene = null;
    }
    if (renderer) {
      renderer.dispose();
      __privateFieldMap.get(this)!.renderer = null;
    }
  }

  public resize(entry: ResizeObserverEntry) {
    if (!__privateFieldMap.get(this)) return;
    const scene = __privateFieldMap.get(this)!.scene;
    const camera = __privateFieldMap.get(this)!.camera;
    const renderer = __privateFieldMap.get(this)!.renderer;
    if (!camera || !renderer || !scene) return;
    const { width, height } = entry.contentRect;
    const aspect = width / height;
    if (camera instanceof PerspectiveCamera) {
      camera.aspect = aspect;
    } else {
      (camera as OrthographicCamera).left = width / -2;
      (camera as OrthographicCamera).right = width / 2;
      (camera as OrthographicCamera).top = height / 2;
      (camera as OrthographicCamera).bottom = height / -2;
    }
    (camera as OrthographicCamera | PerspectiveCamera).updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.render(scene, camera);
  }

  public generateStandalonePrimitive(
    sourceGeometry: BufferGeometry,
    material: Material,
    renderOrder: number,
  ): StandalonePrimitive {
    const standalonePrimitive = new StandalonePrimitive(sourceGeometry, material, renderOrder);
    return standalonePrimitive;
  }
  public generateDependentPrimitive(): void {}
  public generateDependentLinePrimitive(): void {}
  public generateDependentTextPrimitive(): void {}
}
