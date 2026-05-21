import { Camera, Scene, WebGLRenderer } from "three";
import z from "zod/v4";

export const threejsEngineOutputSchema = z.object({
  renderer: z.instanceof(WebGLRenderer),
  camera: z.instanceof(Camera),
  scene: z.instanceof(Scene)
});
export type T_ThreejsEngineOutput = z.infer<typeof threejsEngineOutputSchema>;