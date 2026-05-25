/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vector3 } from 'three';

import * as SYNC_LABEL from '../src/index';

export function registerEvent() {
  let pointMap: any = null;
  let textMap: any = null;
  let camera: any = null;
  let frameNum: number = 0;
  const NUM = 300;

  SYNC_LABEL.onAwake(() => {
    console.log('awake');
  });

  SYNC_LABEL.onBeforeStart(() => {
    console.log('beforeStart');
  });

  SYNC_LABEL.onStart(() => {
    pointMap = SYNC_LABEL.generatePointMap();
    textMap = SYNC_LABEL.generateTextMap();
    for (let i = 0; i < NUM; ++i) {
      const id = i.toString();
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      const y = 0;

      const color =
        '#' +
        Math.floor(Math.random() * 0x7e7e7e + 0x808080)
          .toString(16)
          .padStart(6, '0');
      pointMap.set(id, {
        id,
        width: 15,
        height: 15,
        visible: true,
        position: { x, y, z },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        color,
        showID: true,
      });
    }
    {
      camera = SYNC_LABEL.getCamera();
      camera.position.set(0, 80, 0);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.updateMatrixWorld();
    }
  });

  SYNC_LABEL.onBeforeUpdate(() => {});

  SYNC_LABEL.onUpdate(() => {
    animation(9000);
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

  let stage = 0;
  let animationTime = 0;
  let scale = 1;
  const selected = new Set<string>();
  function animation(frameNum: number) {
    if (!pointMap || !pointMap.size) return;
    const select = () => {
      if (selected.size === 0) {
        const subNum = ~~(NUM / 3);
        // 随机从pointMap中选择subNum个点
        while (selected.size < subNum) {
          const id = Math.floor(Math.random() * NUM).toString();
          if (!selected.has(id)) {
            selected.add(id);
          }
        }
        stage = 1;
      } else {
        selected.forEach((id) => {
          const data = pointMap.get(id);
          if (data) {
            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            const y = 0;
            const color =
              '#' +
              Math.floor(Math.random() * 0x7e7e7e + 0x808080)
                .toString(16)
                .padStart(6, '0');
            pointMap.set(id, {
              ...data,
              position: { x, y, z },
              color,
            });
          }
        });
        stage = 2;
      }
    };
    const grow = (factor: number) => {
      if (!selected.size) return;
      selected.forEach((id) => {
        const data = pointMap.get(id);
        if (!data) return;
        const delta = 1 / frameNum;
        scale += delta * factor;
        pointMap.set(id, {
          ...data,
          scale: {
            x: scale,
            y: scale,
            z: scale,
          },
        });
        ++animationTime;
        if (animationTime >= frameNum) {
          animationTime = 0;
          stage = 0;
          if (factor > 0) {
            selected.clear();
          }
        }
      });
    };
    if (stage === 0) select();
    if (stage === 1) grow(-1);
    if (stage === 2) grow(1);
  }
}
