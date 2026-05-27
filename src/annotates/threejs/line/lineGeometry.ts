import { BufferGeometry, Float32BufferAttribute } from 'three';

export class LineGeometry extends BufferGeometry {
  constructor() {
    super();
    const posArr = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0];
    const uvArr = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2];
    const indexArr = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setAttribute('position', new Float32BufferAttribute(posArr, 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvArr, 2));
    this.setIndex(indexArr);
  }
}
