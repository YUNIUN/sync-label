export class Vector3 {
  public x: number;
  public y: number;
  public z: number;
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public set(x: number, y: number, z: number): Vector3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public copy(v: { x: number; y: number; z: number }): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public cross(v: Vector3): Vector3 {
    const ax = this.x,
      ay = this.y,
      az = this.z;
    const bx = v.x,
      by = v.y,
      bz = v.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }

  public multiply(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  public multiplyScalar(s: number): Vector3 {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public length(): number {
    return Math.sqrt(this.lengthSq());
  }

  public applyMatrix4(m: any): Vector3 {
    const x = this.x,
      y = this.y,
      z = this.z;
    const e = m.elements;

    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return this;
  }

  public normalize(): Vector3 {
    const length = this.length();
    if (length) {
      this.x /= length;
      this.y /= length;
      this.z /= length;
    }
    return this;
  }

  public project(matrixWorldInverse: any, projectionMatrix: any): Vector3 {
    return this.applyMatrix4(matrixWorldInverse).applyMatrix4(projectionMatrix);
  }

  public unproject(projectionMatrixInverse: any, matrixWorld: any): Vector3 {
    return this.applyMatrix4(projectionMatrixInverse).applyMatrix4(matrixWorld);
  }

  public lerp(v: Vector3, alpha: number) {
    const res = new Vector3();
    res.x = this.x + (v.x - this.x) * alpha;
    res.y = this.y + (v.y - this.y) * alpha;
    res.z = this.z + (v.z - this.z) * alpha;
    return res;
  }

  public static min(a: Vector3, b: Vector3) {
    return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
  }

  public static max(a: Vector3, b: Vector3) {
    return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
  }
}
