const fragment = `
varying float vType;
varying float vLinewidth;
varying float vWidthRatio;
varying vec2 vUv;
varying vec3 vInstanceShown;
varying vec3 vInstanceColor;
varying vec3 vLineDistance;

float whenLt(float a, float b) {
    return max(sign(b - a), 0.0);
}

float whenEq(float a, float b) {
    return 1.0 - abs(sign(b - a));
}

void main() {
    if (abs(vUv.y) < 1.0)
        if (mod(vLineDistance.x * (vUv.y + 1.0) * 0.5, vLineDistance.y + vLineDistance.z) > vLineDistance.y)
            discard;
    
    vec3 diff = vInstanceColor;
    
    float aliasing = 1.0;
    float edge = max(8.0, vLinewidth / 1.0);
    if (vUv.y < 1.0 || vType < 0.000001) {
        float x = mix(1.0, 0.0, (abs(vUv.x) - vWidthRatio) * edge);
        aliasing = clamp(x, 0.0, 1.0);
    }
    if (vUv.y < -1.0 || (vType < 0.000001 && vUv.y > 1.0)) {
        float a = vUv.x / vWidthRatio;
        float b = abs(vUv.y) - 1.0;
        float len = length(vec2(a, b));
        float factor = mix(1.0, 0.0, (len - max(0.95, 1.0 - 1.0 / vLinewidth)) * edge);
        aliasing *= clamp(factor, 0.0, 1.0);
    }
    
    gl_FragColor = vec4(diff, vInstanceShown.x * vInstanceShown.y * vInstanceShown.z * aliasing);
}`;
export default fragment;
