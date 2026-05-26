import { BufferGeometry, Float32BufferAttribute } from 'three';

export class ArrowGeometry extends BufferGeometry {
  constructor() {
    super();
    const posArr = [-0.5, -0.5, 0.0, 0.0, 0.5, 0.0, 0.5, -0.5, 0.0];
    const uvArr = [0, 0, 0, 1, 1, 0.5];
    const indexArr = [0, 2, 1];
    this.setAttribute('position', new Float32BufferAttribute(posArr, 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvArr, 2));
    this.setIndex(indexArr);
  }
}
