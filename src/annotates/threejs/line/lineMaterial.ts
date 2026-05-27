import { AlwaysDepth, DoubleSide, ShaderMaterial, Vector2 } from 'three';

import { ThreejsRenderEngine } from '../../../renderEngine/ThreejsRenderEngine';
import { GlobalStore } from '../../../stores/globalStore';
import fragment from '../shaders/line.fs';
import vertex from '../shaders/line.vs';

type LinePrimitiveUniform = {
  screenResolution: { value: Vector2 };
};

export class LineMaterial extends ShaderMaterial {
  constructor() {
    const { renderer } = GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine;
    if (!renderer) return;
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    const uniforms: LinePrimitiveUniform = {
      screenResolution: { value: new Vector2(width, height) },
    };
    super({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
      depthFunc: AlwaysDepth,
    });
    GlobalStore.getInstance().resizes = (entry: ResizeObserverEntry) => {
      const { width, height } = entry.contentRect;
      this.uniforms.screenResolution.value.set(width, height);
    };
  }
}
