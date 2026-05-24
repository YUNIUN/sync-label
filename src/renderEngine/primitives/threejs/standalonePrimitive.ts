import {
  BufferGeometry,
  Euler,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  Object3D,
  Scene,
} from 'three';

import { GlobalStore } from '../../../stores/globalStore';
import {
  standaloneAnnotateSchema,
  T_IDType,
  T_StandaloneAnnotate,
  T_StandaloneDrawData,
} from '../../../types/renderEngine/renderEngine';
import { standardizeColor } from '../../../utils/standardizeColor';
import { BaseStandalonePrimitive } from '../baseStandalonePrimitive';
import { MAX_COUNT } from '../const';

const __privateFieldMap = new WeakMap<
  StandalonePrimitive,
  {
    geometry: BufferGeometry;
    material: Material;
    instancedMesh: InstancedMesh | null;
    renderOrder: number;
    lastIndex: number;
    // 实例复用
    occupiedSeat: Map<T_IDType, number>; // id => index
    availableSeat: Set<number>; // 可用的index
  }
>();

// 独立的标注基类
export class StandalonePrimitive extends BaseStandalonePrimitive {
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
      occupiedSeat: new Map<T_IDType, number>(), // id => index
      availableSeat: new Set<number>(), // 可用的index
      // 拾取八叉树
      // raycastTree: {},
      // textMap: new Map(),
    });
    this.init();
  }

  private init(): void {
    const geometry: BufferGeometry = __privateFieldMap.get(this)!.geometry;
    const material = __privateFieldMap.get(this)!.material;
    // { shownFlag, alpha, visible }
    geometry.setAttribute(
      'instanceShown',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // { width, height }
    geometry.setAttribute(
      'instanceSize',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 2), 2),
    );
    // { minWidth, minHeight, maxWidth, maxHeight }
    geometry.setAttribute(
      'instanceLimit',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 4), 4),
    );
    // { r, g, b }
    geometry.setAttribute(
      'instanceColor',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    const instancedMesh = new InstancedMesh(geometry, material, MAX_COUNT);
    __privateFieldMap.get(this)!.instancedMesh = instancedMesh;
    instancedMesh.count = 0;
    instancedMesh.frustumCulled = false;
    instancedMesh.renderOrder = __privateFieldMap.get(this)!.renderOrder;
    const engine = GlobalStore.getInstance().engine;
    if (!engine) throw new Error('engine is null');
    const { scene } = engine as unknown as { scene: Scene };
    if (!scene) throw new Error('scene is null');
    scene.add(instancedMesh);
  }

  public draw(data?: T_StandaloneDrawData): void {
    if (data !== void 0) {
      this.remove(data.remove);
      this.append(data.append);
      this.modify(data.modify);
      this.needsUpdate();
      this.updateID(data);
    }
  }

  private remove(data: Map<T_IDType, T_StandaloneAnnotate>): void {
    const availableSeat = __privateFieldMap.get(this)!.availableSeat as Set<number>;
    const occupiedSeat = __privateFieldMap.get(this)!.occupiedSeat as Map<T_IDType, number>;
    data.forEach((_, id) => {
      if (occupiedSeat.has(id)) {
        const index = occupiedSeat.get(id)!;
        availableSeat.add(index);
        occupiedSeat.delete(id);
        this.hideByIndex(index);
        this.removeFromRaycastTree(id);
        --this.count;
      }
    });
  }

  private append(data: Map<T_IDType, T_StandaloneAnnotate>): void {
    const availableSeat = __privateFieldMap.get(this)!.availableSeat as Set<number>;
    const occupiedSeat = __privateFieldMap.get(this)!.occupiedSeat as Map<T_IDType, number>;
    data.forEach((data, id) => {
      let index: number;
      if (availableSeat.size > 0) {
        // 存在可复用的位置
        index = availableSeat.values().next().value!;
        availableSeat.delete(index);
      } else {
        // 新增位置
        if (MAX_COUNT <= this.count) return;
        const lastIndex = __privateFieldMap.get(this)!.lastIndex;
        index = lastIndex;
        __privateFieldMap.get(this)!.lastIndex = lastIndex + 1;
      }
      ++this.count;
      occupiedSeat.set(id, index);
      this.updateByIndex(index, data);
      this.appendToRaycastTree(id, data);
    });
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh;
    instancedMesh!.count = Math.max(instancedMesh!.count, this.count);
  }

  private modify(data: Map<T_IDType, T_StandaloneAnnotate>): void {
    const occupiedSeat = __privateFieldMap.get(this)!.occupiedSeat as Map<T_IDType, number>;
    data.forEach((data, id) => {
      if (occupiedSeat.has(id)) {
        const index = occupiedSeat.get(id)!;
        this.updateByIndex(index, data);
        this.modifyToRaycastTree(id, data);
      }
    });
  }

  private updateByIndex(index: number, data: T_StandaloneAnnotate): void {
    const parsed = standaloneAnnotateSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`standalone annotate data is invalid: ${JSON.stringify(data)}`);
    }
    const validData = parsed.data;
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh as InstancedMesh;
    if (!instancedMesh) throw new Error('instancedMesh is null');
    // 1. 渲染数据
    const object3D = new Object3D();
    object3D.position.copy(validData.position);
    object3D.scale.copy(validData.scale);
    object3D.rotation.copy(
      new Euler(validData.rotation.x, validData.rotation.y, validData.rotation.z),
    );
    object3D.updateMatrix();
    instancedMesh.setMatrixAt(index, object3D.matrix);
    const instanceColor = instancedMesh.geometry.getAttribute('instanceColor');
    const color = standardizeColor(validData.color);
    const factor = 1.0 / 255;
    instanceColor.setXYZ(index, color.r * factor, color.g * factor, color.b * factor);
    const instanceSize = instancedMesh.geometry.getAttribute('instanceSize');
    instanceSize.setXY(index, validData.width, validData.height);
    const instanceLimit = instancedMesh.geometry.getAttribute('instanceLimit');
    instanceLimit.setXYZW(
      index,
      validData.minWidth ?? 0,
      validData.minHeight ?? 0,
      validData.maxWidth ?? 0xffffff,
      validData.maxHeight ?? 0xffffff,
    );
    // 2. 显示元素
    const instanceShown = instancedMesh.geometry.getAttribute('instanceShown');
    instanceShown.setXYZ(index, 1, color.a * factor, validData.visible ? 1 : 0);
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
    const instanceColor = instancedMesh.geometry.getAttribute('instanceColor');
    const instanceSize = instancedMesh.geometry.getAttribute('instanceSize');
    const instanceLimit = instancedMesh.geometry.getAttribute('instanceLimit');
    const instanceShown = instancedMesh.geometry.getAttribute('instanceShown');
    instancedMesh.instanceMatrix.needsUpdate = true;
    instanceColor.needsUpdate = true;
    instanceSize.needsUpdate = true;
    instanceLimit.needsUpdate = true;
    instanceShown.needsUpdate = true;
  }

  private updateID(data: T_StandaloneDrawData) {
    // TODO: 处理id文本的逻辑
  }

  private removeFromRaycastTree(id: T_IDType) {
    // TODO: 删除id对应的包围盒
  }

  private appendToRaycastTree(id: T_IDType, data: T_StandaloneAnnotate) {
    // TODO: 添加id对应的包围盒
  }

  private modifyToRaycastTree(id: T_IDType, data: T_StandaloneAnnotate): void {
    this.removeFromRaycastTree(id);
    this.appendToRaycastTree(id, data);
  }

  public isFull(): boolean {
    return this.count >= MAX_COUNT;
  }

  public getRestNum(): number {
    return MAX_COUNT - this.count;
  }

  public has(id: T_IDType): boolean {
    const occupiedSeat = __privateFieldMap.get(this)!.occupiedSeat as Map<T_IDType, number>;
    if (!occupiedSeat) return false;
    return occupiedSeat.has(id);
  }
}
