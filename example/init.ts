import * as SYNC_LABEL from '../src/index';

export async function init() {
  await SYNC_LABEL.init({
    engine: {
      engineType: 'THREEJS',
      camera: {
        config: {
          type: 'PERSPECTIVE',
          fov: 75,
          aspect: window.innerWidth / window.innerHeight,
          near: 1,
          far: 100000,
        },
        position: {
          x: 0,
          y: 0,
          z: 14,
        },
        lookAt: {
          x: 0,
          y: 0,
          z: 0,
        },
        up: {
          x: 0,
          y: 1,
          z: 0,
        },
      },
      scene: {
        background: '#000000',
      },
      renderer: {
        element: '#app',
        logarithmicDepthBuffer: true,
        precision: 'highp',
        premultipliedAlpha: true,
        antialias: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        alpha: false,
        outputColorSpace: 'srgb-linear',
      },
    },
  });
}
