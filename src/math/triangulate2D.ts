import { T_Vector2 } from '../types/common';
import { isConvexPolygon } from './isConvexPolygon';
import { isPointInsidePolygon } from './isPointInsidePolygon';
import { Vector2 } from './vector2';
import { Vector3 } from './vector3';

export function triangulate2D(vectorArr: T_Vector2[]): number[] {
  const result: number[] = [];
  const cloneVectorArr: Vector2[] = [];
  const indexArr: number[] = [];

  let index = 0;
  for (const v of vectorArr) {
    const vec: Vector2 = new Vector2(v.x, v.y);
    indexArr.push(index++);
    cloneVectorArr.push(vec);
  }

  partTriangles(cloneVectorArr, indexArr, result);
  return result;
}

function partTriangles(vectorArr: Vector2[], indexArr: number[], result: number[]) {
  const length: number = vectorArr.length;
  if (length === 3) {
    result.push(indexArr[0], indexArr[1], indexArr[2]);
  } else {
    const isConvex: boolean = isConvexPolygon(vectorArr);
    if (isConvex) {
      // 凸多边形
      for (let i = 0; i < length - 2; ++i) {
        result.push(indexArr[0], indexArr[i + 1], indexArr[i + 2]);
      }
    } else {
      // 凹多边形
      let pointIndex = 0;
      for (let i = 0; i < length; ++i) {
        const polygon = vectorArr.slice(0);
        polygon.splice(i, 1);
        if (!isPointInsidePolygon(vectorArr[i], polygon) && isFragmentIndex(i, vectorArr)) {
          pointIndex = i;
          break;
        }
      }
      const mNext = (pointIndex + 1) % length;
      const mPrev = (pointIndex - 1 + length) % length;
      result.push(indexArr[mPrev], indexArr[pointIndex], indexArr[mNext]);
      indexArr.splice(pointIndex, 1);
      vectorArr.splice(pointIndex, 1);
      partTriangles(vectorArr, indexArr, result);
    }
  }
}

function isFragmentIndex(index: number, vertices: Vector2[]): boolean {
  const len: number = vertices.length;
  const triangleVert: Vector2[] = [];
  const mNext: number = (index + 1) % len;
  const mPrev: number = (index - 1 + len) % len;
  triangleVert.push(vertices[mPrev]);
  triangleVert.push(vertices[index]);
  triangleVert.push(vertices[mNext]);
  for (let i = 0; i < len; ++i) {
    if (i !== index && i !== mPrev && i !== mNext) {
      if (isPointInsidePolygon(vertices[i], triangleVert)) {
        return false;
      }
    }
  }
  return true;
}
