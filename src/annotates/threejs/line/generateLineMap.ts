import { cloneDeep } from 'lodash-es';

import { RenderOrderMap } from '../../../config/renderOrder';
import { effect, ref } from '../../../reactivity';
import { DependentLinePrimitive } from '../../../renderEngine/primitives/threejs/dependentLinePrimitive';
import { ThreejsRenderEngine } from '../../../renderEngine/ThreejsRenderEngine';
import { GlobalStore } from '../../../stores/globalStore';
import {
  T_DependentLineAnnotate,
  T_DependentLineDrawData,
  T_IDType,
} from '../../../types/renderEngine/renderEngine';
import { LineGeometry } from './lineGeometry';
import { LineMaterial } from './lineMaterial';

export function generateLineMap() {
  const geometry = new LineGeometry();
  const material = new LineMaterial();
  const _ref = ref(new Map<T_IDType, T_DependentLineAnnotate>());
  const engine = GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine;
  if (!engine) throw new Error('engine is null');
  const linePrimitives: DependentLinePrimitive[] = [];
  const lineNum = (length: number) => Math.max(length - 1, 0);

  effect((data: T_DependentLineDrawData) => {
    void _ref.value.trackMe;
    if (data) {
      let index = 0;
      while (data.append.size || data.modify.size || data.remove.size) {
        let linePrimitive = linePrimitives[index];
        if (!linePrimitive) {
          linePrimitive = engine.generateDependentLinePrimitive(
            geometry,
            material,
            RenderOrderMap['line'],
          );
          linePrimitives.push(linePrimitive);
        }
        const subData: T_DependentLineDrawData = {
          append: new Map<T_IDType, T_DependentLineAnnotate>(),
          modify: new Map<T_IDType, T_DependentLineAnnotate>(),
          remove: new Map<T_IDType, T_DependentLineAnnotate>(),
        };
        for (const [id, item] of Array.from(data.modify.entries())) {
          if (linePrimitive.has(id)) {
            subData.modify.set(id, item);
            data.modify.delete(id);
          }
        }
        for (const [id, item] of Array.from(data.remove.entries())) {
          if (linePrimitive.has(id)) {
            subData.remove.set(id, item);
            data.remove.delete(id);
          }
        }
        const removeNum = subData.remove
          .values()
          .reduce((acc, cur) => acc + lineNum((cur?.positions || []).length), 0);
        const restNum = linePrimitive.getRestNum() + removeNum;
        const appendNum = data.append
          .values()
          .reduce((acc, cur) => acc + lineNum((cur?.positions || []).length), 0);

        if (restNum >= appendNum) {
          subData.append = cloneDeep(data.append);
          data.append.clear();
        } else {
          let rest = restNum;
          for (const [id, item] of Array.from(data.append.entries())) {
            rest -= lineNum((item.positions || []).length);
            if (rest < 0) {
              break;
            }
            subData.append.set(id, item);
            data.append.delete(id);
          }
        }
        linePrimitive.draw(subData);
        ++index;
      }
    }
  });
  return _ref.value;
}
