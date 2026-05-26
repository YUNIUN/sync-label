import { Vector2 } from './vector2';

export function isPointInsidePolygon(point: Vector2, polygonVectors: Array<Vector2>) {
  const len = polygonVectors.length;
  let interNum = 0;
  for (let i = 1; i < len; ++i) {
    if (isDetectIntersect(point, polygonVectors[i - 1], polygonVectors[i])) {
      ++interNum;
    }
  }
  if (isDetectIntersect(point, polygonVectors[len - 1], polygonVectors[0])) {
    ++interNum;
  }
  return interNum % 2 === 1;
}

function isDetectIntersect(p: Vector2, p1: Vector2, p2: Vector2) {
  let pointY; // 交点Y坐标，x固定值
  if (Math.abs(p1.x - p2.x) < 0.0000001) {
    return false;
  } else if (Math.abs(p1.y - p2.y) < 0.0000001) {
    pointY = p1.y;
  } else {
    // 直线两点式方程：(y-y2)/(y1-y2) = (x-x2)/(x1-x2)
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;
    const c = p2.y / b - p2.x / a;
    pointY = (b / a) * p.x + b * c;
  }
  // 交点y小于射线起点y
  if (p.y > pointY && Math.abs(pointY - p.y) > 1e-6) {
    return false;
  } else {
    const leftP = Math.min(p1.x, p2.x); // 左端点
    const rightP = p2.x + p1.x - leftP; // 右端点
    // 交点x位于线段两个端点x之外，相交与线段某个端点时，仅将射线L与左侧多边形一边的端点记为焦点(即就是：只将右端点记为交点)
    if (p.x < leftP || p.x >= rightP) {
      return false;
    }
  }
  return true;
}
