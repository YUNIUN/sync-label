import { cloneDeep } from 'lodash-es';

import { RenderOrderMap } from '../../../config/renderOrder';
import { effect, ref } from '../../../reactivity';
import { StandalonePrimitive } from '../../../renderEngine/primitives/threejs/standalonePrimitive';
import { ThreejsRenderEngine } from '../../../renderEngine/ThreejsRenderEngine';
import { GlobalStore } from '../../../stores/globalStore';
import {
  T_IDType,
  T_StandaloneAnnotate,
  T_StandaloneDrawData,
} from '../../../types/renderEngine/renderEngine';
import { ArrowGeometry } from './arrowGeometry';
import { ArrowMaterial } from './arrowMaterial';

export function generateArrowMap() {
  const geometry = new ArrowGeometry();
  const material = new ArrowMaterial();
  const _ref = ref(new Map<T_IDType, T_StandaloneAnnotate>());
  const engine = GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine;
  if (!engine) throw new Error('engine is null');
  const arrowPrimitives: StandalonePrimitive[] = [];

  effect((data: T_StandaloneDrawData) => {
    void _ref.value.trackMe;
    if (data) {
      let index = 0;
      while (data.append.size || data.modify.size || data.remove.size) {
        let arrowPrimitive = arrowPrimitives[index];
        if (!arrowPrimitive) {
          arrowPrimitive = engine.generateStandalonePrimitive(
            geometry,
            material,
            RenderOrderMap['arrow'],
          );
          arrowPrimitives.push(arrowPrimitive);
        }
        const subData: T_StandaloneDrawData = {
          append: new Map<T_IDType, T_StandaloneAnnotate>(),
          modify: new Map<T_IDType, T_StandaloneAnnotate>(),
          remove: new Map<T_IDType, T_StandaloneAnnotate>(),
        };
        for (const [id, item] of Array.from(data.modify.entries())) {
          if (arrowPrimitive.has(id)) {
            subData.modify.set(id, item);
            data.modify.delete(id);
          }
        }
        for (const [id, item] of Array.from(data.remove.entries())) {
          if (arrowPrimitive.has(id)) {
            subData.remove.set(id, item);
            data.remove.delete(id);
          }
        }
        const restNum = arrowPrimitive.getRestNum() + subData.remove.size;
        if (restNum >= data.append.size) {
          subData.append = cloneDeep(data.append);
          data.append.clear();
        } else {
          let rest = restNum;
          for (const [id, item] of Array.from(data.append.entries())) {
            if (rest <= 0) {
              break;
            }
            subData.append.set(id, item);
            data.append.delete(id);
            --rest;
          }
        }
        arrowPrimitive.draw(subData);
        ++index;
      }
    }
  });
  return _ref.value;
}
