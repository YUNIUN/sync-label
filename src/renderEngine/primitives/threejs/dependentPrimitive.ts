import {
  BufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  Scene,
} from 'three';

import { generateTextMap } from '../../../annotates/threejs/text/generateTextMap';
import { triangulate3D } from '../../../math/triangulate3D';
import { GlobalStore } from '../../../stores/globalStore';
import { T_Vector3 } from '../../../types/common';
import {
  dependentAnnotateSchema,
  dependentTextAnnotateSchema,
  T_DependentAnnotate,
  T_DependentDrawData,
  T_DependentTextAnnotate,
  T_IDType,
} from '../../../types/renderEngine/renderEngine';
import { standardizeColor } from '../../../utils/standardizeColor';
import { BasePrimitive } from '../basePrimitive';
import { MAX_COUNT } from '../const';

type DrawData = {
  p1: T_Vector3;
  p2: T_Vector3;
  p3: T_Vector3;
  color: { r: number; g: number; b: number; a: number };
  visible: boolean;
  opacity: number;
};

const __privateFieldMap = new WeakMap<
  DependentPrimitive,
  {
    geometry: BufferGeometry;
    material: Material;
    instancedMesh: InstancedMesh | null;
    renderOrder: number;
    lastIndex: number;
    // 实例复用
    occupiedSeat: Map<T_IDType, Set<number>>; // id => index
    availableSeat: Set<number>; // 可用的index
    // 文字
    textMap: Map<T_IDType, T_DependentTextAnnotate>;
  }
>();

export class DependentPrimitive extends BasePrimitive {
  public count: number;
  constructor(sourceGeometry: BufferGeometry, material: Material, renderOrder: number) {
    super();
    this.count = 0;

    __privateFieldMap.set(this, {
      geometry: sourceGeometry,
      material: material,
      instancedMesh: null,
      renderOrder: renderOrder,
      lastIndex: 0,
      // 实例复用
      occupiedSeat: new Map<T_IDType, Set<number>>(), // id => Set<index>
      availableSeat: new Set<number>(), // 可用的index
      // 拾取八叉树
      // raycastTree: {},
      textMap: generateTextMap(),
    });
    this.init();
  }

  private init(): void {
    const privateMap = __privateFieldMap.get(this);
    if (!privateMap) throw new Error('privateMap is null');
    const geometry = privateMap.geometry;
    const material = privateMap.material;
    // { shownFlag, alpha, visible }
    geometry.setAttribute(
      'instanceShown',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // P1
    geometry.setAttribute(
      'instanceP1',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // P2
    geometry.setAttribute(
      'instanceP2',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // P3
    geometry.setAttribute(
      'instanceP3',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // color
    geometry.setAttribute(
      'instanceColor',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );

    const instancedMesh = new InstancedMesh(geometry, material, MAX_COUNT);
    privateMap.instancedMesh = instancedMesh;
    instancedMesh.count = 0;
    instancedMesh.frustumCulled = false;
    instancedMesh.renderOrder = privateMap.renderOrder;
    const engine = GlobalStore.getInstance().engine;
    if (!engine) throw new Error('engine is null');
    const { scene } = engine as unknown as { scene: Scene };
    if (!scene) throw new Error('scene is null');
    scene.add(instancedMesh);
  }

  public draw(data?: T_DependentDrawData): void {
    if (data !== void 0) {
      this.remove(data.remove);
      this.append(data.append);
      this.modify(data.modify);
      this.needsUpdate();
      this.updateID(data);
    }
  }

  private remove(data: Map<T_IDType, T_DependentAnnotate>): void {
    const privateMap = __privateFieldMap.get(this);
    if (!privateMap) throw new Error('privateMap is null');
    const availableSeat = privateMap.availableSeat;
    const occupiedSeat = privateMap.occupiedSeat;
    data.forEach((_, id) => {
      if (occupiedSeat.has(id)) {
        const indexes = occupiedSeat.get(id);
        if (!indexes) throw new Error('indexes is null');
        for (const index of indexes) {
          availableSeat.add(index);
          this.hideByIndex(index);
          --this.count;
        }
        occupiedSeat.delete(id);
      }
    });
  }

  private append(data: Map<T_IDType, T_DependentAnnotate>): void {
    const privateMap = __privateFieldMap.get(this);
    if (!privateMap) throw new Error('privateMap is null');
    const availableSeat = privateMap.availableSeat;
    const occupiedSeat = privateMap.occupiedSeat;
    data.forEach((data, id) => {
      const parsed = dependentAnnotateSchema.safeParse(data);
      if (!parsed.success) throw new Error(parsed.error.message);
      const validData = parsed.data;
      // 拆分多边形为三角形
      const upDirect = this.getUpDirect(validData.positions);
      const indexArr: Array<number> = triangulate3D(data.positions, upDirect);
      for (let i = 0; i < indexArr.length; i += 3) {
        const p1: T_Vector3 = data.positions[indexArr[i]];
        const p2: T_Vector3 = data.positions[indexArr[i + 1]];
        const p3: T_Vector3 = data.positions[indexArr[i + 2]];
        const color = standardizeColor(data.color);
        let index: number;
        if (availableSeat.size > 0) {
          const iterator = availableSeat.keys();
          index = iterator.next().value!;
          availableSeat.delete(index);
        } else {
          if (MAX_COUNT <= this.count) return;
          const lastIndex = privateMap.lastIndex;
          index = lastIndex;
          privateMap.lastIndex = lastIndex + 1;
        }
        ++this.count;
        if (occupiedSeat.has(id)) {
          occupiedSeat.get(id)!.add(index);
        } else {
          const set = new Set<number>();
          set.add(index);
          occupiedSeat.set(id, set);
        }
        this.updateByIndex(index, {
          p1,
          p2,
          p3,
          color,
          opacity: validData.opacity,
          visible: data.visible,
        });
      }
    });
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh;
    instancedMesh!.count = Math.max(instancedMesh!.count, this.count);
  }

  private getUpDirect(positions: T_Vector3[]): 'X' | 'Y' | 'Z' {
    let xmin = Infinity,
      ymin = Infinity,
      zmin = Infinity;
    let xmax = -Infinity,
      ymax = -Infinity,
      zmax = -Infinity;
    for (const p of positions) {
      if (xmin > p.x) xmin = p.x;
      if (ymin > p.y) ymin = p.y;
      if (zmin > p.z) zmin = p.z;
      if (xmax < p.x) xmax = p.x;
      if (ymax < p.y) ymax = p.y;
      if (zmax < p.z) zmax = p.z;
    }
    const xDelta = xmax - xmin;
    const yDelta = ymax - ymin;
    const zDelta = zmax - zmin;
    const minDelta = Math.min(xDelta, yDelta, zDelta);
    return minDelta === xDelta ? 'X' : minDelta === yDelta ? 'Y' : 'Z';
  }

  private modify(data: Map<string, T_DependentAnnotate>): void {
    this.remove(data);
    this.append(data);
  }

  private updateByIndex(index: number, data: DrawData): void {
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh as InstancedMesh;
    if (!instancedMesh) throw new Error('instancedMesh is null');
    // 1. 渲染数据
    const instanceP1 = instancedMesh.geometry.getAttribute('instanceP1');
    instanceP1.setXYZ(index, data.p1.x, data.p1.y, data.p1.z);
    const instanceP2 = instancedMesh.geometry.getAttribute('instanceP2');
    instanceP2.setXYZ(index, data.p2.x, data.p2.y, data.p2.z);
    const instanceP3 = instancedMesh.geometry.getAttribute('instanceP3');
    instanceP3.setXYZ(index, data.p3.x, data.p3.y, data.p3.z);
    const instanceColor = instancedMesh.geometry.getAttribute('instanceColor');
    const color = data.color;
    const factor = 1.0 / 255;
    instanceColor.setXYZ(index, color.r * factor, color.g * factor, color.b * factor);

    // 2. 显示元素
    const instanceShown = instancedMesh.geometry.getAttribute('instanceShown');
    instanceShown.setXYZ(index, 1, color.a * factor, data.visible ? 1 : 0);
  }

  private hideByIndex(index: number): void {
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh as InstancedMesh;
    if (!instancedMesh) throw new Error('instancedMesh is null');
    instancedMesh.setMatrixAt(index, new Matrix4().identity());
    const instanceShown = instancedMesh.geometry.getAttribute('instanceShown');
    instanceShown.setXYZ(index, 0, 0, 0);
  }

  private needsUpdate() {
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh;
    if (!instancedMesh) throw new Error('instancedMesh is null');
    const instanceP1 = instancedMesh.geometry.getAttribute('instanceP1');
    const instanceP2 = instancedMesh.geometry.getAttribute('instanceP2');
    const instanceP3 = instancedMesh.geometry.getAttribute('instanceP3');
    const instanceColor = instancedMesh.geometry.getAttribute('instanceColor');
    const instanceShown = instancedMesh.geometry.getAttribute('instanceShown');
    instanceP1.needsUpdate = true;
    instanceP2.needsUpdate = true;
    instanceP3.needsUpdate = true;
    instanceColor.needsUpdate = true;
    instanceShown.needsUpdate = true;
  }

  private updateID(data: T_DependentDrawData) {
    const textMap: Map<T_IDType, T_DependentTextAnnotate> = __privateFieldMap.get(this)!.textMap;
    const center = (positions: Array<T_Vector3>) => {
      let x = 0,
        y = 0,
        z = 0;
      for (const position of positions) {
        x += position.x;
        y += position.y;
        z += position.z;
      }
      return {
        x: x / positions.length,
        y: y / positions.length,
        z: z / positions.length,
      };
    };

    data.remove.forEach((_, id) => {
      textMap.delete(id);
    });
    data.append.forEach((item, id) => {
      if (!item.showID) {
        return;
      }
      const color = standardizeColor(item.color);
      color.a = 255;
      const parsed = dependentTextAnnotateSchema.safeParse({
        id: id,
        color,
        content: item.textConfig?.content || id,
        offset: item.textConfig?.offset || { x: 0, y: 0 },
        fontSize: item.textConfig?.fontSize || 18,
        position: center(item.positions),
        visible: item.visible,
      });
      if (!parsed.success) throw new Error(parsed.error.message);
      textMap.set(id, parsed.data);
    });
    data.modify.forEach((item, id) => {
      if (!item.showID) {
        textMap.delete(id);
        return;
      }
      const color = standardizeColor(item.color);
      color.a = 255;
      const parsed = dependentTextAnnotateSchema.safeParse({
        id: id,
        color,
        content: item.textConfig?.content || id,
        offset: item.textConfig?.offset || { x: 0, y: 0 },
        fontSize: item.textConfig?.fontSize || 18,
        position: center(item.positions),
        visible: item.visible,
      });
      if (!parsed.success) throw new Error(parsed.error.message);
      textMap.set(id, parsed.data);
    });
  }

  public isFull(): boolean {
    return this.count >= MAX_COUNT;
  }

  public getRestNum(): number {
    return MAX_COUNT - this.count;
  }

  public has(id: T_IDType): boolean {
    const occupiedSeat = __privateFieldMap.get(this)!.occupiedSeat as Map<T_IDType, Set<number>>;
    if (!occupiedSeat) return false;
    return occupiedSeat.has(id);
  }

  public Fit(id: T_IDType): boolean {
    return this.count + id.length >= MAX_COUNT;
  }
}
