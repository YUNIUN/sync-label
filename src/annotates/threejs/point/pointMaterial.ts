import vertex from "../shaders/point.vs";
import fragment from "../shaders/point.fs";
import { GlobalStore } from "../../../stores/globalStore";
import { ShaderMaterial, Vector2, AlwaysDepth } from "three";
import { ThreejsRenderEngine } from "../../../renderEngine/ThreejsRenderEngine";

type PointPrimitiveUniform = {
    screenResolution: { value: Vector2 },
};

export class PointMaterial extends ShaderMaterial {
    constructor() {
        const { renderer } = GlobalStore.getInstance().engine as unknown as ThreejsRenderEngine;
        if (!renderer) return;
        const width = renderer?.domElement.clientWidth;
        const height = renderer?.domElement.clientHeight;
        const uniforms: PointPrimitiveUniform = {
            screenResolution: { value: new Vector2(width, height) }
        };
        super({
            uniforms: uniforms,
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            depthFunc: AlwaysDepth
        });
        GlobalStore.getInstance().resizes = (entry: ResizeObserverEntry) => {
            const {width, height} = entry.contentRect;
            this.uniforms.screenResolution.value.set(width, height);
        };
    }
}