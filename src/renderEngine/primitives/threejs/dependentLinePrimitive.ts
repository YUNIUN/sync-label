import {
  BufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  Scene,
} from 'three';

import { generateTextMap } from '../../../annotates/threejs/text/generateTextMap';
import { GlobalStore } from '../../../stores/globalStore';
import { T_Vector3 } from '../../../types/common';
import {
  dependentLineAnnotateSchema,
  dependentTextAnnotateSchema,
  T_DependentLineAnnotate,
  T_DependentLineDrawData,
  T_DependentTextAnnotate,
  T_IDType,
} from '../../../types/renderEngine/renderEngine';
import { standardizeColor } from '../../../utils/standardizeColor';
import { BasePrimitive } from '../basePrimitive';
import { MAX_COUNT } from '../const';

type DrawData = {
  start: T_Vector3;
  end: T_Vector3;
  color: { r: number; g: number; b: number; a: number };
  lineWidth: number;
  arrowSize: number;
  dashSize: number;
  gapSize: number;
  visible: boolean;
  opacity: number;
};

const __privateFieldMap = new WeakMap<
  DependentLinePrimitive,
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

export class DependentLinePrimitive extends BasePrimitive {
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
    // start
    geometry.setAttribute(
      'instanceStart',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // end
    geometry.setAttribute(
      'instanceEnd',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // color
    geometry.setAttribute(
      'instanceColor',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // { lineWidth, arrowSize, dashSize, dashGap }
    geometry.setAttribute(
      'instanceStyle',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 4), 4),
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

  public draw(data?: T_DependentLineDrawData): void {
    if (data !== void 0) {
      this.remove(data.remove);
      this.append(data.append);
      this.modify(data.modify);
      this.needsUpdate();
      this.updateID(data);
    }
  }

  private remove(data: Map<T_IDType, T_DependentLineAnnotate>): void {
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

  private append(data: Map<T_IDType, T_DependentLineAnnotate>): void {
    const privateMap = __privateFieldMap.get(this);
    if (!privateMap) throw new Error('privateMap is null');
    const availableSeat = privateMap.availableSeat;
    const occupiedSeat = privateMap.occupiedSeat;
    data.forEach((data, id) => {
      const parsed = dependentLineAnnotateSchema.safeParse(data);
      if (!parsed.success) throw new Error(parsed.error.message);
      const validData = parsed.data;
      if (validData.positions.length < 2) {
        const set = new Set<number>();
        occupiedSeat.set(id, set);
      }
      for (let i = 0; i < validData.positions.length - 1; i++) {
        const start: T_Vector3 = validData.positions[i];
        const end: T_Vector3 = validData.positions[i + 1];
        const lineWidth: number = validData.lineWidth;
        const arrowSize: number = validData.arrowSize;
        const dashSize: number = validData.dashSize;
        const gapSize: number = validData.gapSize;
        const color: { r: number; g: number; b: number; a: number } = standardizeColor(
          validData.color,
        );
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
          start,
          end,
          color,
          lineWidth,
          arrowSize,
          dashSize,
          gapSize,
          opacity: validData.opacity,
          visible: validData.visible,
        });
      }
    });
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh;
    instancedMesh!.count = Math.max(instancedMesh!.count, this.count);
  }

  private modify(data: Map<string, T_DependentLineAnnotate>): void {
    this.remove(data);
    this.append(data);
  }

  private updateByIndex(index: number, data: DrawData): void {
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh as InstancedMesh;
    if (!instancedMesh) throw new Error('instancedMesh is null');
    // 1. 渲染数据
    const instanceStart = instancedMesh.geometry.getAttribute('instanceStart');
    instanceStart.setXYZ(index, data.start.x, data.start.y, data.start.z);
    const instanceEnd = instancedMesh.geometry.getAttribute('instanceEnd');
    instanceEnd.setXYZ(index, data.end.x, data.end.y, data.end.z);
    const instanceColor = instancedMesh.geometry.getAttribute('instanceColor');
    const color = data.color;
    const factor = 1.0 / 255;
    instanceColor.setXYZ(index, color.r * factor, color.g * factor, color.b * factor);
    const instanceStyle = instancedMesh.geometry.getAttribute('instanceStyle');
    instanceStyle.setXYZW(index, data.lineWidth, data.arrowSize, data.dashSize, data.gapSize);

    // 2. 显示元素
    const instanceShown = instancedMesh.geometry.getAttribute('instanceShown');
    instanceShown.setXYZ(index, 1, color.a * factor * data.opacity, data.visible ? 1 : 0);
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
    const instanceStart = instancedMesh.geometry.getAttribute('instanceStart');
    const instanceEnd = instancedMesh.geometry.getAttribute('instanceEnd');
    const instanceColor = instancedMesh.geometry.getAttribute('instanceColor');
    const instanceStyle = instancedMesh.geometry.getAttribute('instanceStyle');
    const instanceShown = instancedMesh.geometry.getAttribute('instanceShown');

    instanceStart.needsUpdate = true;
    instanceEnd.needsUpdate = true;
    instanceColor.needsUpdate = true;
    instanceStyle.needsUpdate = true;
    instanceShown.needsUpdate = true;
  }

  private updateID(data: T_DependentLineDrawData) {
    const textMap: Map<T_IDType, T_DependentTextAnnotate> = __privateFieldMap.get(this)!.textMap;
    const anchor = (positions: Array<T_Vector3>) => {
      const position = positions[positions.length - 1];
      return position;
    };

    data.remove.forEach((_, id) => {
      textMap.delete(id);
    });
    data.append.forEach((item, id) => {
      if (item.positions.length < 2) return;
      if (!item.showID) {
        return;
      }
      const color = standardizeColor(item.color);
      color.a = 255;
      const parsed = dependentTextAnnotateSchema.safeParse({
        id: id,
        color,
        content: item.textConfig?.content || id,
        offset: item.textConfig?.offset || { x: 10, y: 2 },
        fontSize: item.textConfig?.fontSize || 18,
        position: anchor(item.positions),
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
        offset: item.textConfig?.offset || { x: 10, y: 2 },
        fontSize: item.textConfig?.fontSize || 18,
        position: anchor(item.positions),
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
