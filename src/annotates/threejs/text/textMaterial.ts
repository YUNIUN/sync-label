import { AlwaysDepth, ShaderMaterial, Texture, TextureLoader, Vector2 } from 'three';

import { ThreejsRenderEngine } from '../../../renderEngine/ThreejsRenderEngine';
import { GlobalStore } from '../../../stores/globalStore';
import fragment from '../shaders/text.fs';
import vertex from '../shaders/text.vs';

type TextPrimitiveUniform = {
  screenResolution: { value: Vector2 };
  fontImage: { value: Texture };
};

export class TextMaterial extends ShaderMaterial {
  constructor() {
    const { renderer } = GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine;
    if (!renderer) return;
    const width = renderer?.domElement.clientWidth;
    const height = renderer?.domElement.clientHeight;
    const imgUrl = GlobalStore.getInstance().textConfig!.image;
    const fontImage = new TextureLoader().load(imgUrl);
    const uniforms: TextPrimitiveUniform = {
      screenResolution: { value: new Vector2(width, height) },
      fontImage: { value: fontImage },
    };
    super({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      depthFunc: AlwaysDepth,
    });
    GlobalStore.getInstance().resizes = (entry: ResizeObserverEntry) => {
      const { width, height } = entry.contentRect;
      this.uniforms.screenResolution.value.set(width, height);
    };
  }
}
