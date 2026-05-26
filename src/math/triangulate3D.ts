import { T_Vector3 } from '../types/common';
import { triangulate2D } from './triangulate2D';

export function triangulate3D(
  vectorArr: Array<T_Vector3>,
  upDirect: 'X' | 'Y' | 'Z' = 'Y',
): Array<number> {
  const cloneVectorArr: Array<T_Vector3> = [];

  for (const vector of vectorArr) {
    const vec3: T_Vector3 = {
      x: vector.x,
      y: vector.y,
      z: vector.z,
    };
    switch (upDirect) {
      case 'X':
        vec3.x = vec3.z;
        break;
      case 'Y':
        vec3.y = vec3.z;
        break;
      case 'Z':
        break;
    }
    vec3.z = 0;
    cloneVectorArr.push(vec3);
  }

  return triangulate2D(cloneVectorArr);
}
