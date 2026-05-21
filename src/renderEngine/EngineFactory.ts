import { ThreejsRenderEngine } from "./ThreejsRenderEngine";
import { T_RenderEngineConfig } from "../types/renderEngine/renderEngine";
import { BaseRenderEngine } from "./BaseRenderEngine";

export class EngineFactory {
    static generate(config: T_RenderEngineConfig):BaseRenderEngine { 
        switch(config.engineType) {
            case "THREEJS": 
                return new ThreejsRenderEngine(config);
            case "WEBGL":
                throw new Error("暂不支持WEBGL");
            case "WEBGPU":
                throw new Error("暂不支持WEBGPU");
            default: 
                throw new Error("Invalid render engine type");
        }
    }
}