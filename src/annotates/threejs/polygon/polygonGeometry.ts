import { BufferGeometry, Float32BufferAttribute } from 'three';

export class PolygonGeometry extends BufferGeometry {
  constructor() {
    super();
    const posArr = [1, 0, 0, 2, 0, 0, 3, 0, 0];
    this.setAttribute('position', new Float32BufferAttribute(posArr, 3));
  }
}
