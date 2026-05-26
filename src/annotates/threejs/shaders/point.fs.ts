const fragment = `
varying float vEdge;

varying vec2 vUv;
varying vec3 vInstanceColor;
varying vec3 vInstanceShown;

float whenLt(float a, float b) {
    return max(sign(b - a), 0.0);
}
void main() {
    vec2  uv = abs(vUv - 0.5) * 2.0;
    float uvLength = length(uv);

    float circleArea = whenLt(uvLength, 1.0);
    float edgeArea = 1.0 - (clamp(1.0 - vEdge, 1.0, uvLength) - (1.0 - vEdge)) / vEdge;

    gl_FragColor = vec4(vInstanceColor, min(1.0, circleArea * edgeArea) * vInstanceShown.x * vInstanceShown.y * vInstanceShown.z);
}`;
export default fragment;
