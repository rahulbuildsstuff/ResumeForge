import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const vertexShaderGLSL = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentShaderGLSL = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colorBottom;
uniform vec3 u_colorMid;
uniform vec3 u_colorTop;
uniform float u_speed;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p, float t) {
  float v = 0.0; float a = 0.5; float fi = 0.0;
  mat2 rot = mat2(0.86, 0.51, -0.51, 0.86);
  for (int i = 0; i < 6; i++) {
    vec2 morph = vec2(sin(t * 0.5 + fi), cos(t * 0.3 - fi)) * 0.05;
    v += a * noise(p + morph);
    p = rot * p * 2.0; a *= 0.5; fi += 1.0;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect;
  vec2 wind = vec2(t * 0.1, t * 0.02);
  float pattern = fbm(p * 2.2 - wind, t);
  float bandLow = smoothstep(0.3, 0.65, pattern);
  float bandHigh = smoothstep(0.7, 0.95, pattern);
  vec3 color = mix(u_colorBottom, u_colorMid, bandLow);
  color = mix(color, u_colorTop, bandHigh);
  gl_FragColor = vec4(color, 1.0);
}
`;



const DEFAULT_COLOR = "#0d1117";
const COLOR_HEX_PATTERN = /^#?[0-9a-fA-F]{6}$/;

function normalizeHexColor(value, fallback) {
  const trimmed = value.trim();
  if (!COLOR_HEX_PATTERN.test(trimmed)) return fallback;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}
function hexToRgbNormalized(hex) {
  const n = normalizeHexColor(hex, DEFAULT_COLOR).replace("#", "");
  return [parseInt(n.slice(0, 2), 16) / 255, parseInt(n.slice(2, 4), 16) / 255, parseInt(n.slice(4, 6), 16) / 255];
}

const Cloudscape = ({
  colorBottom = "#87ceeb",
  colorMid = "#f8f8f8",
  colorTop = "#ffffff",
  speed = 1,
  className,
  children,
  ...props
}) => {
  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const settings = useMemo(() => ({ colorBottom, colorMid, colorTop, speed }), [colorBottom, colorMid, colorTop, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    const compile = (type, source) => {
      const s = gl.createShader(type); if (!s) return null;
      gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vertexShaderGLSL);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentShaderGLSL);
    if (!vs || !fs) return;
    const program = gl.createProgram(); if (!program) return;
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); return;
    }
    gl.useProgram(program);

    const posLoc = gl.getAttribLocation(program, "position");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uCB = gl.getUniformLocation(program, "u_colorBottom");
    const uCM = gl.getUniformLocation(program, "u_colorMid");
    const uCT = gl.getUniformLocation(program, "u_colorTop");
    const uSpeed = gl.getUniformLocation(program, "u_speed");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(host);

    let raf = 0;
    const start = performance.now();
    const render = (now) => {
      const t = (now - start) / 1000;
      const cb = hexToRgbNormalized(settings.colorBottom);
      const cm = hexToRgbNormalized(settings.colorMid);
      const ct = hexToRgbNormalized(settings.colorTop);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      gl.uniform3f(uCB, cb[0], cb[1], cb[2]);
      gl.uniform3f(uCM, cm[0], cm[1], cm[2]);
      gl.uniform3f(uCT, ct[0], ct[1], ct[2]);
      gl.uniform1f(uSpeed, settings.speed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      gl.deleteBuffer(buf); gl.deleteProgram(program);
      gl.deleteShader(vs); gl.deleteShader(fs);
    };
  }, [settings]);

  return (
    <div ref={hostRef} className={cn("relative h-full w-full overflow-hidden", className)} {...props}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {children}
    </div>
  );
};

export default Cloudscape;
