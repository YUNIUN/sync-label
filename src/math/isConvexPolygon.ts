import { Vector2 } from './vector2';
import { Vector3 } from './vector3';

function toVector3(v: Vector2): Vector3 {
  return new Vector3(v.x, v.y, 0);
}

export function isConvexPolygon(vectorArr: Vector2[]): boolean {
  let isConvex: boolean = true;
  const length: number = vectorArr.length;
  const vec1: Vector3 = toVector3(vectorArr[1].clone().sub(vectorArr[0]));
  const vec2: Vector3 = toVector3(vectorArr[0].clone().sub(vectorArr[length - 1]));
  vec1.cross(vec2);
  if (vec1.lengthSq() < 1e-6) return false;
  for (let i = 1; i < length; ++i) {
    const vec3 = toVector3(vectorArr[(i + 1) % length].clone().sub(vectorArr[i]));
    const vec4 = toVector3(vectorArr[i].clone().sub(vectorArr[i - 1]));
    vec3.cross(vec4);
    if (vec3.dot(vec1) < 0) {
      isConvex = false;
      break;
    }
  }
  return isConvex;
}
