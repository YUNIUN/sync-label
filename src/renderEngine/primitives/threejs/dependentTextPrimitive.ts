import {
  BufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  Object3D,
  Scene,
} from 'three';

import { GlobalStore } from '../../../stores/globalStore';
import {
  dependentTextAnnotateSchema,
  T_DependentTextAnnotate,
  T_DependentTextDrawData,
  T_IDType,
} from '../../../types/renderEngine/renderEngine';
import { standardizeColor } from '../../../utils/standardizeColor';
import { BasePrimitive } from '../basePrimitive';
import { MAX_COUNT } from '../const';

type DrawData = {
  offset: { x: number; y: number };
  uv: number[];
  size: { width: number; height: number };
  color: { r: number; g: number; b: number; a: number };
  position: { x: number; y: number; z: number };
  visible: boolean;
  opacity: number;
};

const __privateFieldMap = new WeakMap<
  DependentTextPrimitive,
  {
    geometry: BufferGeometry;
    material: Material;
    instancedMesh: InstancedMesh | null;
    renderOrder: number;
    lastIndex: number;
    // 实例复用
    occupiedSeat: Map<T_IDType, Set<number>>; // id => index
    availableSeat: Set<number>; // 可用的index
  }
>();

export class DependentTextPrimitive extends BasePrimitive {
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
      // textMap: new Map(),
    });
    this.init();
  }

  private init(): void {
    const privateMap = __privateFieldMap.get(this);
    if (!privateMap) throw new Error('privateMap is null');
    const geometry = privateMap.geometry.clone();
    const material = privateMap.material;
    // { shownFlag, alpha, visible }
    geometry.setAttribute(
      'instanceShown',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // { leftTop.x, leftTop.y, rightBottom.x, rightBottom.y }
    geometry.setAttribute(
      'instanceUV',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 4), 4),
    );
    // color
    geometry.setAttribute(
      'instanceColor',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 3), 3),
    );
    // { offset.x, offset.y }
    geometry.setAttribute(
      'instanceOffset',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 2), 2),
    );
    // { width, height }
    geometry.setAttribute(
      'instanceSize',
      new InstancedBufferAttribute(new Float32Array(MAX_COUNT * 2), 2),
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

  public draw(data?: T_DependentTextDrawData): void {
    if (data !== void 0) {
      this.remove(data.remove);
      this.append(data.append);
      this.modify(data.modify);
      this.needsUpdate();
    }
  }

  private remove(data: Map<T_IDType, T_DependentTextAnnotate>): void {
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

  private append(data: Map<T_IDType, T_DependentTextAnnotate>): void {
    const privateMap = __privateFieldMap.get(this);
    if (!privateMap) throw new Error('privateMap is null');
    const availableSeat = privateMap.availableSeat;
    const occupiedSeat = privateMap.occupiedSeat;
    const config = GlobalStore.getInstance().textConfig!.uvJson;
    const defaultUV: Array<number> = config['?'];
    data.forEach((data, id) => {
      const parsed = dependentTextAnnotateSchema.safeParse(data);
      if (!parsed.success) throw new Error(parsed.error.message);
      const validData = parsed.data;
      let lastWordWidth: number = 0;
      const offset = { ...validData.offset };
      for (let i = 0; i < validData.content.length; i++) {
        offset.x += lastWordWidth;
        const character: string = validData.content[i];
        // leftTop.x, leftTop.y, rightBottom.x, rightBottom.y
        const uv: Array<number> = config[character] || defaultUV;
        const height: number = validData.fontSize;
        const width = (height / (uv[1] - uv[3])) * (uv[2] - uv[0]);
        lastWordWidth = width;
        const size = { width, height };
        const color = standardizeColor(validData.color);
        const position = validData.position;
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
          offset,
          uv,
          size,
          color,
          position,
          visible: validData.visible,
          opacity: validData.opacity,
        });
      }
    });
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh;
    instancedMesh!.count = Math.max(instancedMesh!.count, this.count);
  }

  private modify(data: Map<string, T_DependentTextAnnotate>): void {
    this.remove(data);
    this.append(data);
  }

  private updateByIndex(index: number, data: DrawData): void {
    const instancedMesh = __privateFieldMap.get(this)!.instancedMesh as InstancedMesh;
    if (!instancedMesh) throw new Error('instancedMesh is null');
    // 1. 渲染数据
    const object3D = new Object3D();
    object3D.position.copy(data.position);
    object3D.updateMatrix();
    instancedMesh.setMatrixAt(index, object3D.matrix);
    const instanceUV = instancedMesh.geometry.getAttribute('instanceUV');
    instanceUV.setXYZW(index, data.uv[0], data.uv[1], data.uv[2], data.uv[3]); // leftTop.x, leftTop.y, rightBottom.x, rightBottom.y
    const instanceOffset = instancedMesh.geometry.getAttribute('instanceOffset');
    instanceOffset.setXY(index, data.offset.x, data.offset.y);
    const instanceSize = instancedMesh.geometry.getAttribute('instanceSize');
    instanceSize.setXY(index, data.size.width, data.size.height);
    const instanceColor = instancedMesh.geometry.getAttribute('instanceColor');
    const color = data.color;
    const factor = 1.0 / 255;
    instanceColor.setXYZ(index, color.r * factor, color.g * factor, color.b * factor);
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
    const instanceUV = instancedMesh.geometry.getAttribute('instanceUV');
    const instanceOffset = instancedMesh.geometry.getAttribute('instanceOffset');
    const instanceSize = instancedMesh.geometry.getAttribute('instanceSize');
    const instanceColor = instancedMesh.geometry.getAttribute('instanceColor');
    const instanceShown = instancedMesh.geometry.getAttribute('instanceShown');
    instancedMesh.instanceMatrix.needsUpdate = true;
    instanceUV.needsUpdate = true;
    instanceOffset.needsUpdate = true;
    instanceSize.needsUpdate = true;
    instanceColor.needsUpdate = true;
    instanceShown.needsUpdate = true;
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

  public textFit(id: T_IDType): boolean {
    return this.count + id.length >= MAX_COUNT;
  }
}
