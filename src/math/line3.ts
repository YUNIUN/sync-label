import { Vector3 } from './vector3';

export class Line3 {
  public start: Vector3;
  public end: Vector3;
  constructor(start: Vector3, end: Vector3) {
    this.start = start.clone();
    this.end = end.clone();
  }

  public clone(): Line3 {
    return new Line3(this.start.clone(), this.end.clone());
  }

  public lengthSq(): number {
    return this.start.clone().sub(this.end).lengthSq();
  }

  public length(): number {
    return Math.sqrt(this.lengthSq());
  }

  public distanceSqToPoint(point: Vector3): number {
    const start = this.start;
    const end = this.end;
    const startToPoint = point.clone().sub(start);
    const startToEndNormalized = end.clone().sub(start).normalize();
    const distance = startToPoint.cross(startToEndNormalized);
    return distance.lengthSq();
  }

  public distanceToPoint(point: Vector3): number {
    return Math.sqrt(this.distanceSqToPoint(point));
  }
}
