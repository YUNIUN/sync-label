import {
  WebGLRenderer,
  PerspectiveCamera,
  OrthographicCamera,
  Scene,
  Color,
  Vector3,
  Camera,
  Object3D,
  Mesh
} from "three";
import { BaseRenderEngine } from "./BaseRenderEngine";
import { standardizeColor } from "../utils/standardizeColor";
import { T_RenderEngineConfig } from "../types/renderEngine/renderEngine";
import { getElement } from "../utils/getElement";
import { isArray } from "lodash-es";

const __privateFieldMap = new WeakMap<BaseRenderEngine, any>();

export class ThreejsRenderEngine extends BaseRenderEngine {
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
    __privateFieldMap.get(this).scene = scene;
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
    if (this.__cameraConfig.config.type === "PERSPECTIVE") {
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
    __privateFieldMap.get(this).camera = camera;
    return camera;
  }

  private __initRenderer(): WebGLRenderer {
    const element = getElement(this.__rendererConfig.element);
    if (!element) throw new Error("element is not exist");
    let canvas: HTMLCanvasElement;
    if (element instanceof HTMLCanvasElement) {
      canvas = element;
    } else {
      canvas = document.createElement("canvas");
      element.appendChild(canvas);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
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
    __privateFieldMap.get(this).renderer = renderer;
    return renderer;
  }

  public render(): void {
    const camera = __privateFieldMap.get(this).camera;
    const scene = __privateFieldMap.get(this).scene;
    const renderer = __privateFieldMap.get(this).renderer;
    if (camera && scene && renderer) {
      renderer.render(scene, camera);
    }
  }

  public destroy(): void {
    const camera: Camera = __privateFieldMap.get(this).camera;
    const scene: Scene = __privateFieldMap.get(this).scene;
    const renderer: WebGLRenderer = __privateFieldMap.get(this).renderer;
    if (camera) {
      __privateFieldMap.get(this).camera = null;
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
              for(const item of material) {
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
      __privateFieldMap.get(this).scene = null;
    }
    if (renderer) {
      renderer.dispose();
      __privateFieldMap.get(this).renderer = null;
    }
  }

  public resize(entry: ResizeObserverEntry) {
    const camera = __privateFieldMap.get(this).camera;
    const renderer = __privateFieldMap.get(this).renderer;
    const { width, height } = entry.contentRect;
    const aspect = width / height;
    if (camera instanceof PerspectiveCamera) {
      camera.aspect = aspect;
    } else {
      camera.left = width / -2;
      camera.right  = width / 2;
      camera.top = height / 2;
      camera.bottom = height / -2;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  public generateStandalonePrimitive(): void{}
  public generateDependentPrimitive(): void{}
  public generateDependentLinePrimitive(): void{}
  public generateDependentTextPrimitive(): void{}
}
