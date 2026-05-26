import { AlwaysDepth, DoubleSide, ShaderMaterial } from 'three';

import fragment from '../shaders/arrow.fs';
import vertex from '../shaders/arrow.vs';

export class ArrowMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {},
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
      depthFunc: AlwaysDepth,
    });
  }
}
