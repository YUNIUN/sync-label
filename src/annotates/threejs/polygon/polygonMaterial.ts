import { DoubleSide, ShaderMaterial } from 'three';

import fragment from '../shaders/polygon.fs';
import vertex from '../shaders/polygon.vs';

export class PolygonMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
    });
  }
}
