import { cloneDeep } from 'lodash-es';

import { RenderOrderMap } from '../../../config/renderOrder';
import { effect, ref } from '../../../reactivity';
import { DependentPrimitive } from '../../../renderEngine/primitives/threejs/dependentPrimitive';
import { ThreejsRenderEngine } from '../../../renderEngine/ThreejsRenderEngine';
import { GlobalStore } from '../../../stores/globalStore';
import {
  T_DependentAnnotate,
  T_DependentDrawData,
  T_IDType,
} from '../../../types/renderEngine/renderEngine';
import { PolygonGeometry } from './polygonGeometry';
import { PolygonMaterial } from './polygonMaterial';

export function generatePolygonMap() {
  const geometry = new PolygonGeometry();
  const material = new PolygonMaterial();
  const _ref = ref(new Map<T_IDType, T_DependentAnnotate>());
  const engine = GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine;
  if (!engine) throw new Error('engine is null');
  const polygonPrimitives: DependentPrimitive[] = [];
  const faceNum = (length: number) => Math.max(length - 2, 0);

  effect((data: T_DependentDrawData) => {
    void _ref.value.trackMe;
    if (data) {
      let index = 0;
      while (data.append.size || data.modify.size || data.remove.size) {
        let polygonPrimitive = polygonPrimitives[index];
        if (!polygonPrimitive) {
          polygonPrimitive = engine.generateDependentPrimitive(
            geometry,
            material,
            RenderOrderMap['polygon'],
          );
          polygonPrimitives.push(polygonPrimitive);
        }
        const subData: T_DependentDrawData = {
          append: new Map<T_IDType, T_DependentAnnotate>(),
          modify: new Map<T_IDType, T_DependentAnnotate>(),
          remove: new Map<T_IDType, T_DependentAnnotate>(),
        };
        for (const [id, item] of Array.from(data.modify.entries())) {
          if (polygonPrimitive.has(id)) {
            subData.modify.set(id, item);
            data.modify.delete(id);
          }
        }
        for (const [id, item] of Array.from(data.remove.entries())) {
          if (polygonPrimitive.has(id)) {
            subData.remove.set(id, item);
            data.remove.delete(id);
          }
        }
        const removeNum = subData.remove
          .values()
          .reduce((acc, cur) => acc + faceNum((cur.positions || []).length), 0);
        const restNum = polygonPrimitive.getRestNum() + removeNum;
        const appendNum = data.append
          .values()
          .reduce((acc, cur) => acc + faceNum((cur.positions || []).length), 0);

        if (restNum >= appendNum) {
          subData.append = cloneDeep(data.append);
          data.append.clear();
        } else {
          let rest = restNum;
          for (const [id, item] of Array.from(data.append.entries())) {
            rest -= faceNum((item.positions || []).length);
            if (rest < 0) {
              break;
            }
            subData.append.set(id, item);
            data.append.delete(id);
          }
        }
        polygonPrimitive.draw(subData);
        ++index;
      }
    }
  });
  return _ref.value;
}
