import { cloneDeep } from 'lodash-es';

import { RenderOrderMap } from '../../../config/renderOrder';
import { effect, ref } from '../../../reactivity';
import { DependentTextPrimitive } from '../../../renderEngine/primitives/threejs/dependentTextPrimitive';
import { ThreejsRenderEngine } from '../../../renderEngine/ThreejsRenderEngine';
import { GlobalStore } from '../../../stores/globalStore';
import {
  T_DependentTextAnnotate,
  T_DependentTextDrawData,
  T_IDType,
} from '../../../types/renderEngine/renderEngine';
import { TextGeometry } from './textGeometry';
import { TextMaterial } from './textMaterial';

export function generateTextMap() {
  const geometry = new TextGeometry();
  const material = new TextMaterial();
  const _ref = ref(new Map<T_IDType, T_DependentTextAnnotate>());
  const engine = GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine;
  if (!engine) throw new Error('engine is null');
  const textPrimitives: DependentTextPrimitive[] = [];

  effect((data: T_DependentTextDrawData) => {
    void _ref.value.trackMe;
    if (data) {
      let index = 0;
      while (data.append.size || data.modify.size || data.remove.size) {
        let textPrimitive = textPrimitives[index];
        if (!textPrimitive) {
          textPrimitive = engine.generateDependentTextPrimitive(
            geometry,
            material,
            RenderOrderMap['text'],
          );
          textPrimitives.push(textPrimitive);
        }
        const subData: T_DependentTextDrawData = {
          append: new Map<T_IDType, T_DependentTextAnnotate>(),
          modify: new Map<T_IDType, T_DependentTextAnnotate>(),
          remove: new Map<T_IDType, T_DependentTextAnnotate>(),
        };
        for (const [id, item] of Array.from(data.modify.entries())) {
          if (textPrimitive.has(id)) {
            subData.modify.set(id, item);
            data.modify.delete(id);
          }
        }
        for (const [id, item] of Array.from(data.remove.entries())) {
          if (textPrimitive.has(id)) {
            subData.remove.set(id, item);
            data.remove.delete(id);
          }
        }
        const removeNum = subData.remove
          .values()
          .reduce((acc, cur) => acc + (cur?.content || '').length, 0);
        const restNum = textPrimitive.getRestNum() + removeNum;
        const appendNum = data.append
          .values()
          .reduce((acc, cur) => acc + (cur?.content || '').length, 0);

        if (restNum >= appendNum) {
          subData.append = cloneDeep(data.append);
          data.append.clear();
        } else {
          let rest = restNum;
          for (const [id, item] of Array.from(data.append.entries())) {
            rest -= (item.content || '').length;
            if (rest < 0) {
              break;
            }
            subData.append.set(id, item);
            data.append.delete(id);
          }
        }
        textPrimitive.draw(subData);
        ++index;
      }
    }
  });
  return _ref.value;
}
