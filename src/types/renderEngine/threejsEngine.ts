import { Camera, Scene, WebGLRenderer } from 'three';
import z from 'zod/v4';

export const threejsEngineOutputSchema = z.object({
  renderer: z.instanceof(WebGLRenderer).nullable(),
  camera: z.instanceof(Camera).nullable(),
  scene: z.instanceof(Scene).nullable(),
});
export type T_ThreejsEngineOutput = z.infer<typeof threejsEngineOutputSchema>;
