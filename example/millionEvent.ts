/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vector3 } from 'three';

import * as SYNC_LABEL from '../src/index';

export function registerEvent() {
  let pointMap: any = null;
  let camera: any = null;
  let frameNum: number = 0;
  const NUM = 1000000;

  SYNC_LABEL.onAwake(() => {
    console.log('awake');
  });

  SYNC_LABEL.onBeforeStart(() => {
    console.log('beforeStart');
  });

  SYNC_LABEL.onStart(() => {
    pointMap = SYNC_LABEL.generatePointMap();
    for (let i = 0; i < NUM; ++i) {
      const id = i.toString();
      const radius = 1000;
      const x = Math.random() - 0.5;
      const z = Math.random() - 0.5;
      const y = Math.random() - 0.5;
      const vec3 = new Vector3(x, y, z).normalize().multiplyScalar(radius);

      const color =
        '#' +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, '0');
      pointMap.set(id, {
        id,
        width: 5,
        height: 5,
        visible: true,
        position: { x: vec3.x, y: vec3.y, z: vec3.z },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        color,
      });
    }
    {
      camera = SYNC_LABEL.getCamera();
      const x = Math.random() - 0.5;
      const z = Math.random() - 0.5;
      const y = Math.random() - 0.5;
      const vec3 = new Vector3(x, y, z).normalize().multiplyScalar(150);
      camera.position.copy(vec3);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.updateMatrixWorld();
    }
  });

  SYNC_LABEL.onBeforeUpdate(() => {});

  SYNC_LABEL.onUpdate(() => {
    if (!pointMap || !camera) return;
    const factor = (Math.PI / 180) * 0.1;
    const length = 1600 + Math.sin(frameNum * factor) * 400;
    const x = Math.sin(frameNum * factor);
    const z = Math.cos(frameNum * factor);
    const y = Math.sin(frameNum * factor * 2);
    const vec3 = new Vector3(x, y, z).normalize().multiplyScalar(length);
    camera.position.copy(vec3);
    camera.lookAt(new Vector3(0, 0, 0));
    camera.updateMatrixWorld();
  });

  SYNC_LABEL.onAfterUpdate(() => {
    ++frameNum;
  });

  SYNC_LABEL.onDestroy(() => {
    console.log('destroy');
  });

  SYNC_LABEL.onResize((e) => {
    console.log('resize', e);
  });
}
