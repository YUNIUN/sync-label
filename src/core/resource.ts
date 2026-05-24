import { ThreejsRenderEngine } from '../renderEngine/ThreejsRenderEngine';
import { GlobalStore } from '../stores/globalStore';

export function getCamera() {
  return (GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine).camera;
}

export function getScene() {
  return (GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine).scene;
}

export function getRenderer() {
  return (GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine).renderer;
}
