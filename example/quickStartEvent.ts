/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vector3 } from 'three';

import { T_Vector3 } from '@/types/common';

import * as SYNC_LABEL from '../src/index';

export function registerEvent() {
  let pointMap: any = null;
  let textMap: any = null;
  let polygonMap: any = null;
  let arrowMap: any = null;
  let lineMap: any = null;
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
    polygonMap = SYNC_LABEL.generatePolygonMap();
    arrowMap = SYNC_LABEL.generateArrowMap();
    lineMap = SYNC_LABEL.generateLineMap();
    for (let i = 0; i < NUM; ++i) {
      const id = i.toString();
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      const y = 0;

      const color =
        '#' +
        Math.floor(Math.random() * 0x7e7e7e + 0x808080)
          .toString(16)
          .padStart(6, '0') +
        '80';
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
        textConfig: {
          fontSize: 18,
        },
      });
    }
    for (let i = 0; i < ~~(NUM / 10); i++) {
      const id = i.toString();
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      const y = 0;
      arrowMap.set(id, {
        id,
        width: 1,
        height: 3,
        color: '#72c892',
        position: { x, y, z },
        rotation: { x: Math.PI * 0.5, y: 0, z: Math.random() * 2 * Math.PI },
        showID: false,
      });
    }
    {
      let color =
        '#' +
        Math.floor(Math.random() * 0x7e7e7e + 0x808080)
          .toString(16)
          .padStart(6, '0') +
        '80';
      polygonMap.set('1', {
        id: '1',
        visible: true,
        positions: [
          {
            x: -50,
            y: 0,
            z: -50,
          },
          {
            x: -50,
            y: 0,
            z: 50,
          },
          {
            x: 50,
            y: 0,
            z: 50,
          },
          {
            x: 50,
            y: 0,
            z: -50,
          },
          {
            x: 40,
            y: 0,
            z: -50,
          },
          {
            x: 40,
            y: 0,
            z: 40,
          },
          {
            x: -40,
            y: 0,
            z: 40,
          },
          {
            x: -40,
            y: 0,
            z: -50,
          },
        ],
        color,
        showID: true,
        textConfig: {
          fontSize: 30,
        },
      });
      color =
        '#' +
        Math.floor(Math.random() * 0x7e7e7e + 0x808080)
          .toString(16)
          .padStart(6, '0') +
        '80';
      polygonMap.set('2', {
        id: '2',
        visible: true,
        positions: [
          {
            x: -2,
            y: 0,
            z: -60,
          },
          {
            x: -2,
            y: 0,
            z: 60,
          },
          {
            x: 2,
            y: 0,
            z: 60,
          },
          {
            x: 2,
            y: 0,
            z: -60,
          },
        ],
        color,
        showID: true,
        textConfig: {
          fontSize: 30,
        },
      });
    }
    for (let i = 0; i < 10; i++) {
      const positions = [];
      for (let j = 0; j < 3; j++) {
        const x = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        const y = 0;
        positions.push({ x, y, z });
      }
      const color =
        '#' +
        Math.floor(Math.random() * 0x7e7e7e + 0x808080)
          .toString(16)
          .padStart(6, '0');
      const id = i.toString();
      lineMap.set(id, {
        id,
        positions,
        color,
        lineWidth: 1,
        arrowSize: 0.3,
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
    lineAnimation();
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
        // for (let i = 0; i < NUM; i++) {
        //   const id = i.toString();
        //   selected.add(id);
        // }
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
                .padStart(6, '0') +
              '80';
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
          textConfig: {
            fontSize: 18 * scale,
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
  let step = 0;
  function lineAnimation() {
    if (!lineMap) return;
    const getPos = (progress: number, adsorb: boolean = false) => {
      const mix = (a: T_Vector3, b: T_Vector3, c: number) => {
        return {
          x: a.x * (1 - c) + b.x * c,
          y: a.y * (1 - c) + b.y * c,
          z: a.z * (1 - c) + b.z * c,
        };
      };
      const getFract = (n: number) => {
        return n - Math.floor(n);
      };

      const length = 110;
      const path = [
        { x: -length * 0.5, y: 0, z: -length * 0.5 },
        { x: -length * 0.5, y: 0, z: length * 0.5 },
        { x: length * 0.5, y: 0, z: length * 0.5 },
        { x: length * 0.5, y: 0, z: -length * 0.5 },
      ];
      const getT = (pro: number) => {
        const sum = length * 4;
        const p = getFract(pro / sum) * sum;
        const t = p / sum;
        return t;
      };
      const t = getT(progress);
      const c_index = Math.floor(t * 4);
      const n_index = (c_index + 1) % 4;
      if (adsorb) {
        const p_t = ~~(getT(progress - 40) * 4);
        const n_t = ~~(getT(progress + 40) * 4);
        if (p_t !== n_t) {
          return path[n_t];
        }
      }
      return mix(path[c_index], path[n_index], getFract(getFract(t * 4)));
    };
    lineMap.set('dl1', {
      id: 'dl1',
      color: { r: 255, g: 255, b: 0, a: 255 },
      positions: [
        getPos(0.0 + step * 0.2),
        getPos(40.0 + step * 0.2, true),
        getPos(80.0 + step * 0.2, true),
        getPos(120.0 + step * 0.2),
      ],
      arrowSize: 0.3,
      dashSize: 10,
      gapSize: 5,
      showID: true,
      lineWidth: 2,
      textConfig: {
        fontSize: 28,
      },
    });
    lineMap.set('dl2', {
      id: 'dl2',
      color: { r: 255, g: 255, b: 0, a: 255 },
      positions: [
        getPos(240 + 0.0 + step * 0.2),
        getPos(240 + 40.0 + step * 0.2, true),
        getPos(240 + 80.0 + step * 0.2, true),
        getPos(240 + 120.0 + step * 0.2),
      ],
      arrowSize: 0.02,
      dashSize: 10,
      gapSize: 5,
      showID: true,
      lineWidth: 2,
      textConfig: {
        fontSize: 28,
      },
    });
    ++step;
  }
}
