const vertex = `
attribute vec3 instanceStart;
attribute vec3 instanceEnd;
attribute vec3 instanceColor;
attribute vec4 instanceStyle;
attribute vec3 instanceShown;

uniform vec2 screenResolution;

varying float vLinewidth;
varying float vWidthRatio;
varying float vType;
varying vec2 vUv;
varying vec3 vInstanceShown;
varying vec3 vInstanceColor;
varying vec3 vLineDistance;

float whenLt(float a, float b) {
    return max(sign(b - a), 0.0);
}

float whenGt(float a, float b) {
    return whenLt(b, a);
}

float whenEq(float a, float b) {
    return 1.0 - abs(sign(b - a));
}

void trimSegment(const in vec4 start, inout vec4 end) {
    float a = projectionMatrix[2][2];
    float b = projectionMatrix[3][2];
    float nearEstimate = -0.5 * b / a;
    float alpha = (nearEstimate - start.z) / (end.z - start.z);
    end.xyz = mix(start.xyz, end.xyz, alpha);
}

void main() {
    vUv = uv;
    vInstanceShown = instanceShown;
    vInstanceColor = instanceColor;

    float linewidth = instanceStyle.x;
    vLinewidth = linewidth;
    vec4 start = modelViewMatrix * vec4(instanceStart, 1.0);
    vec4 end = modelViewMatrix * vec4(instanceEnd, 1.0);
    bool perspective = (projectionMatrix[ 2 ][ 3 ] == - 1.0);
    if (perspective) {
        if (start.z < 0.0 && end.z >= 0.0) {
            trimSegment(start, end);
        } else if (end.z < 0.0 && start.z >= 0.0) {
            trimSegment(end, start);
        }
    }

    vec4 clipStart = projectionMatrix * start;
    vec4 clipEnd = projectionMatrix * end;
    vec3 ndcStart = clipStart.xyz / clipStart.w;
    vec3 ndcEnd = clipEnd.xyz / clipEnd.w;
    vec2 dir = ndcEnd.xy - ndcStart.xy;
    vec2 screenLineDir = dir * screenResolution * 0.5;
    float len = length(screenLineDir);
    vLineDistance = vec3(len, instanceStyle.z, instanceStyle.w);
    screenLineDir = normalize(screenLineDir);
    vec2 screenVerticalOffset = vec2(screenLineDir.y, -screenLineDir.x);
    screenVerticalOffset *= sign(position.x);
    vec2 screenOffset = vec2(0.0, 0.0);
    vType = instanceStyle.y;

    if (instanceStyle.y < 0.000001) {
        vWidthRatio = 0.1;
        screenOffset += (-whenLt(position.y, -0.5) + whenGt(position.y, 1.5)) * screenLineDir * linewidth * 0.5;
        screenOffset += screenVerticalOffset * linewidth * 0.5 / vWidthRatio;
    } else {
        screenOffset += -whenLt(position.y, -0.5) * screenLineDir * linewidth * 0.5;
        float arrowWidth = mix(linewidth + 4.0, linewidth + 20.0, instanceStyle.y);
        float arrowLength = min(arrowWidth * 3.0, len * 0.3);
        vWidthRatio = linewidth / arrowWidth;
        linewidth = whenLt(position.y, 1.5) * arrowWidth;
        screenOffset += -whenEq(position.y, 1.0) * screenLineDir * arrowLength;
        screenOffset += screenVerticalOffset * linewidth * 0.5;
    }

    vec2 offset = screenOffset * 2.0 / screenResolution;

    vec4 clip = mix(clipStart, clipEnd, whenGt(position.y, 0.5));
    offset *= clip.w;
    clip.xy += offset;

    gl_Position = clip;
}`;
export default vertex;
