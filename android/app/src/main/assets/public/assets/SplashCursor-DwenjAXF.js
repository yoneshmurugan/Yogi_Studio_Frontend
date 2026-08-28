import{$ as e,Q as t,et as n}from"./index-Drar0vZy.js";var r=n(e(),1),i=t();function a({SIM_RESOLUTION:e=128,DYE_RESOLUTION:t=1440,CAPTURE_RESOLUTION:n=512,DENSITY_DISSIPATION:a=3.5,VELOCITY_DISSIPATION:o=2,PRESSURE:s=.1,PRESSURE_ITERATIONS:c=20,CURL:l=3,SPLAT_RADIUS:u=.2,SPLAT_FORCE:ee=6e3,SHADING:te=!0,COLOR_UPDATE_SPEED:ne=10,BACK_COLOR:d={r:0,g:0,b:0},TRANSPARENT:f=!0,RAINBOW_MODE:p=!1,COLOR:re=`#d4af37`}){let m=(0,r.useRef)(null);return(0,r.useEffect)(()=>{let r=m.current;if(!r)return;function i(){this.id=-1,this.texcoordX=0,this.texcoordY=0,this.prevTexcoordX=0,this.prevTexcoordY=0,this.deltaX=0,this.deltaY=0,this.down=!1,this.moved=!1,this.color=[0,0,0]}let h={SIM_RESOLUTION:e,DYE_RESOLUTION:t,CAPTURE_RESOLUTION:n,DENSITY_DISSIPATION:a,VELOCITY_DISSIPATION:o,PRESSURE:s,PRESSURE_ITERATIONS:c,CURL:l,SPLAT_RADIUS:u,SPLAT_FORCE:ee,SHADING:te,COLOR_UPDATE_SPEED:ne,PAUSED:!1,BACK_COLOR:d,TRANSPARENT:f,RAINBOW_MODE:p,COLOR:re},g=[new i],{gl:_,ext:v}=ie(r);v.supportLinearFiltering||(h.DYE_RESOLUTION=256,h.SHADING=!1);function ie(e){let t={alpha:!0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1},n=e.getContext(`webgl2`,t),r=!!n;r||(n=e.getContext(`webgl`,t)||e.getContext(`experimental-webgl`,t));let i,a;r?(n.getExtension(`EXT_color_buffer_float`),a=n.getExtension(`OES_texture_float_linear`)):(i=n.getExtension(`OES_texture_half_float`),a=n.getExtension(`OES_texture_half_float_linear`)),n.clearColor(0,0,0,1);let o=r?n.HALF_FLOAT:i&&i.HALF_FLOAT_OES,s,c,l;return r?(s=y(n,n.RGBA16F,n.RGBA,o),c=y(n,n.RG16F,n.RG,o),l=y(n,n.R16F,n.RED,o)):(s=y(n,n.RGBA,n.RGBA,o),c=y(n,n.RGBA,n.RGBA,o),l=y(n,n.RGBA,n.RGBA,o)),{gl:n,ext:{formatRGBA:s,formatRG:c,formatR:l,halfFloatTexType:o,supportLinearFiltering:a}}}function y(e,t,n,r){if(!ae(e,t,n,r))switch(t){case e.R16F:return y(e,e.RG16F,e.RG,r);case e.RG16F:return y(e,e.RGBA16F,e.RGBA,r);default:return null}return{internalFormat:t,format:n}}function ae(e,t,n,r){let i=e.createTexture();e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,t,4,4,0,n,r,null);let a=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,a),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE}class oe{constructor(e,t){this.vertexShader=e,this.fragmentShaderSource=t,this.programs=[],this.activeProgram=null,this.uniforms=[]}setKeywords(e){let t=0;for(let n=0;n<e.length;n++)t+=Le(e[n]);let n=this.programs[t];if(n==null){let r=C(_.FRAGMENT_SHADER,this.fragmentShaderSource,e);n=x(this.vertexShader,r),this.programs[t]=n}n!==this.activeProgram&&(this.uniforms=S(n),this.activeProgram=n)}bind(){_.useProgram(this.activeProgram)}}class b{constructor(e,t){this.uniforms={},this.program=x(e,t),this.uniforms=S(this.program)}bind(){_.useProgram(this.program)}}function x(e,t){let n=_.createProgram();return _.attachShader(n,e),_.attachShader(n,t),_.linkProgram(n),_.getProgramParameter(n,_.LINK_STATUS)||console.trace(_.getProgramInfoLog(n)),n}function S(e){let t=[],n=_.getProgramParameter(e,_.ACTIVE_UNIFORMS);for(let r=0;r<n;r++){let n=_.getActiveUniform(e,r).name;t[n]=_.getUniformLocation(e,n)}return t}function C(e,t,n){t=se(t,n);let r=_.createShader(e);return _.shaderSource(r,t),_.compileShader(r),_.getShaderParameter(r,_.COMPILE_STATUS)||console.trace(_.getShaderInfoLog(r)),r}function se(e,t){if(!t)return e;let n=``;return t.forEach(e=>{n+=`#define `+e+`
`}),n+e}let w=C(_.VERTEX_SHADER,`
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `),ce=C(_.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `),le=C(_.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
     `),ue=C(_.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `),de=C(_.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
            #ifdef MANUAL_FILTERING
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `,v.supportLinearFiltering?null:[`MANUAL_FILTERING`]),fe=C(_.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `),pe=C(_.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `),me=C(_.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `),he=C(_.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `),ge=C(_.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `),T=(_.bindBuffer(_.ARRAY_BUFFER,_.createBuffer()),_.bufferData(_.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),_.STATIC_DRAW),_.bindBuffer(_.ELEMENT_ARRAY_BUFFER,_.createBuffer()),_.bufferData(_.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),_.STATIC_DRAW),_.vertexAttribPointer(0,2,_.FLOAT,!1,0,0),_.enableVertexAttribArray(0),(e,t=!1)=>{e==null?(_.viewport(0,0,_.drawingBufferWidth,_.drawingBufferHeight),_.bindFramebuffer(_.FRAMEBUFFER,null)):(_.viewport(0,0,e.width,e.height),_.bindFramebuffer(_.FRAMEBUFFER,e.fbo)),t&&(_.clearColor(0,0,0,1),_.clear(_.COLOR_BUFFER_BIT)),_.drawElements(_.TRIANGLES,6,_.UNSIGNED_SHORT,0)}),E,D,O,k,A,j=new b(w,ce),M=new b(w,le),N=new b(w,ue),P=new b(w,de),F=new b(w,fe),I=new b(w,pe),L=new b(w,me),R=new b(w,he),z=new b(w,ge),B=new oe(w,`
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform vec2 texelSize;

      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
      }
    `);function V(){let e=Ie(h.SIM_RESOLUTION),t=Ie(h.DYE_RESOLUTION),n=v.halfFloatTexType,r=v.formatRGBA,i=v.formatRG,a=v.formatR,o=v.supportLinearFiltering?_.LINEAR:_.NEAREST;_.disable(_.BLEND),E=E?W(E,t.width,t.height,r.internalFormat,r.format,n,o):U(t.width,t.height,r.internalFormat,r.format,n,o),D=D?W(D,e.width,e.height,i.internalFormat,i.format,n,o):U(e.width,e.height,i.internalFormat,i.format,n,o),O=H(e.width,e.height,a.internalFormat,a.format,n,_.NEAREST),k=H(e.width,e.height,a.internalFormat,a.format,n,_.NEAREST),A=U(e.width,e.height,a.internalFormat,a.format,n,_.NEAREST)}function H(e,t,n,r,i,a){_.activeTexture(_.TEXTURE0);let o=_.createTexture();_.bindTexture(_.TEXTURE_2D,o),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MIN_FILTER,a),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MAG_FILTER,a),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_WRAP_S,_.CLAMP_TO_EDGE),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_WRAP_T,_.CLAMP_TO_EDGE),_.texImage2D(_.TEXTURE_2D,0,n,e,t,0,r,i,null);let s=_.createFramebuffer();return _.bindFramebuffer(_.FRAMEBUFFER,s),_.framebufferTexture2D(_.FRAMEBUFFER,_.COLOR_ATTACHMENT0,_.TEXTURE_2D,o,0),_.viewport(0,0,e,t),_.clear(_.COLOR_BUFFER_BIT),{texture:o,fbo:s,width:e,height:t,texelSizeX:1/e,texelSizeY:1/t,attach(e){return _.activeTexture(_.TEXTURE0+e),_.bindTexture(_.TEXTURE_2D,o),e}}}function U(e,t,n,r,i,a){let o=H(e,t,n,r,i,a),s=H(e,t,n,r,i,a);return{width:e,height:t,texelSizeX:o.texelSizeX,texelSizeY:o.texelSizeY,get read(){return o},set read(e){o=e},get write(){return s},set write(e){s=e},swap(){let e=o;o=s,s=e}}}function _e(e,t,n,r,i,a,o){let s=H(t,n,r,i,a,o);return j.bind(),_.uniform1i(j.uniforms.uTexture,e.attach(0)),T(s),s}function W(e,t,n,r,i,a,o){return e.width===t&&e.height===n?e:(e.read=_e(e.read,t,n,r,i,a,o),e.write=H(t,n,r,i,a,o),e.width=t,e.height=n,e.texelSizeX=1/t,e.texelSizeY=1/n,e)}function ve(){let e=[];h.SHADING&&e.push(`SHADING`),B.setKeywords(e)}ve(),V();let G=Date.now(),K=0,q=!0,J=new IntersectionObserver(e=>{q=e[0].isIntersecting,q&&(G=Date.now())},{threshold:0});J.observe(r);function Y(){if(requestAnimationFrame(Y),!q)return;let e=ye();be()&&V(),xe(e),Se(),Ce(e),we(null)}function ye(){let e=Date.now(),t=(e-G)/1e3;return t=Math.min(t,.016666),G=e,t}function be(){let e=$(r.clientWidth),t=$(r.clientHeight);return r.width!==e||r.height!==t?(r.width=e,r.height=t,!0):!1}function xe(e){K+=e*h.COLOR_UPDATE_SPEED,K>=1&&(K=Fe(K,0,1),g.forEach(e=>{e.color=Q()}))}function Se(){g.forEach(e=>{e.moved&&(e.moved=!1,Ee(e))})}function Ce(e){_.disable(_.BLEND),I.bind(),_.uniform2f(I.uniforms.texelSize,D.texelSizeX,D.texelSizeY),_.uniform1i(I.uniforms.uVelocity,D.read.attach(0)),T(k),L.bind(),_.uniform2f(L.uniforms.texelSize,D.texelSizeX,D.texelSizeY),_.uniform1i(L.uniforms.uVelocity,D.read.attach(0)),_.uniform1i(L.uniforms.uCurl,k.attach(1)),_.uniform1f(L.uniforms.curl,h.CURL),_.uniform1f(L.uniforms.dt,e),T(D.write),D.swap(),F.bind(),_.uniform2f(F.uniforms.texelSize,D.texelSizeX,D.texelSizeY),_.uniform1i(F.uniforms.uVelocity,D.read.attach(0)),T(O),M.bind(),_.uniform1i(M.uniforms.uTexture,A.read.attach(0)),_.uniform1f(M.uniforms.value,h.PRESSURE),T(A.write),A.swap(),R.bind(),_.uniform2f(R.uniforms.texelSize,D.texelSizeX,D.texelSizeY),_.uniform1i(R.uniforms.uDivergence,O.attach(0));for(let e=0;e<h.PRESSURE_ITERATIONS;e++)_.uniform1i(R.uniforms.uPressure,A.read.attach(1)),T(A.write),A.swap();z.bind(),_.uniform2f(z.uniforms.texelSize,D.texelSizeX,D.texelSizeY),_.uniform1i(z.uniforms.uPressure,A.read.attach(0)),_.uniform1i(z.uniforms.uVelocity,D.read.attach(1)),T(D.write),D.swap(),P.bind(),_.uniform2f(P.uniforms.texelSize,D.texelSizeX,D.texelSizeY),v.supportLinearFiltering||_.uniform2f(P.uniforms.dyeTexelSize,D.texelSizeX,D.texelSizeY);let t=D.read.attach(0);_.uniform1i(P.uniforms.uVelocity,t),_.uniform1i(P.uniforms.uSource,t),_.uniform1f(P.uniforms.dt,e),_.uniform1f(P.uniforms.dissipation,h.VELOCITY_DISSIPATION),T(D.write),D.swap(),v.supportLinearFiltering||_.uniform2f(P.uniforms.dyeTexelSize,E.texelSizeX,E.texelSizeY),_.uniform1i(P.uniforms.uVelocity,D.read.attach(0)),_.uniform1i(P.uniforms.uSource,E.read.attach(1)),_.uniform1f(P.uniforms.dissipation,h.DENSITY_DISSIPATION),T(E.write),E.swap()}function we(e){_.blendFunc(_.ONE,_.ONE_MINUS_SRC_ALPHA),_.enable(_.BLEND),Te(e)}function Te(e){let t=e==null?_.drawingBufferWidth:e.width,n=e==null?_.drawingBufferHeight:e.height;B.bind(),h.SHADING&&_.uniform2f(B.uniforms.texelSize,1/t,1/n),_.uniform1i(B.uniforms.uTexture,E.read.attach(0)),T(e)}function Ee(e){let t=e.deltaX*h.SPLAT_FORCE,n=e.deltaY*h.SPLAT_FORCE;Oe(e.texcoordX,e.texcoordY,t,n,e.color)}function De(e){let t=Q();t.r*=10,t.g*=10,t.b*=10;let n=10*(Math.random()-.5),r=30*(Math.random()-.5);Oe(e.texcoordX,e.texcoordY,n,r,t)}function Oe(e,t,n,i,a){N.bind(),_.uniform1i(N.uniforms.uTarget,D.read.attach(0)),_.uniform1f(N.uniforms.aspectRatio,r.width/r.height),_.uniform2f(N.uniforms.point,e,t),_.uniform3f(N.uniforms.color,n,i,0),_.uniform1f(N.uniforms.radius,ke(h.SPLAT_RADIUS/100)),T(D.write),D.swap(),_.uniform1i(N.uniforms.uTarget,E.read.attach(0)),_.uniform3f(N.uniforms.color,a.r,a.g,a.b),T(E.write),E.swap()}function ke(e){let t=r.width/r.height;return t>1&&(e*=t),e}function X(e,t,n,i){e.id=t,e.down=!0,e.moved=!1,e.texcoordX=n/r.width,e.texcoordY=1-i/r.height,e.prevTexcoordX=e.texcoordX,e.prevTexcoordY=e.texcoordY,e.deltaX=0,e.deltaY=0,e.color=Q()}function Z(e,t,n,i){e.prevTexcoordX=e.texcoordX,e.prevTexcoordY=e.texcoordY,e.texcoordX=t/r.width,e.texcoordY=1-n/r.height,e.deltaX=je(e.texcoordX-e.prevTexcoordX),e.deltaY=Me(e.texcoordY-e.prevTexcoordY),e.moved=Math.abs(e.deltaX)>0||Math.abs(e.deltaY)>0,e.color=i}function Ae(e){e.down=!1}function je(e){let t=r.width/r.height;return t<1&&(e*=t),e}function Me(e){let t=r.width/r.height;return t>1&&(e/=t),e}function Ne(e){let t=e.replace(`#`,``);t.length===3&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]);let n=parseInt(t.slice(0,2),16)/255,r=parseInt(t.slice(2,4),16)/255,i=parseInt(t.slice(4,6),16)/255;return{r:n*.15,g:r*.15,b:i*.15}}function Q(){if(!h.RAINBOW_MODE)return Ne(h.COLOR);let e=Pe(Math.random(),1,1);return e.r*=.15,e.g*=.15,e.b*=.15,e}function Pe(e,t,n){let r,i,a,o,s,c,l,u;switch(o=Math.floor(e*6),s=e*6-o,c=n*(1-t),l=n*(1-s*t),u=n*(1-(1-s)*t),o%6){case 0:r=n,i=u,a=c;break;case 1:r=l,i=n,a=c;break;case 2:r=c,i=n,a=u;break;case 3:r=c,i=l,a=n;break;case 4:r=u,i=c,a=n;break;case 5:r=n,i=c,a=l;break;default:break}return{r,g:i,b:a}}function Fe(e,t,n){let r=n-t;return r===0?t:(e-t)%r+t}function Ie(e){let t=_.drawingBufferWidth/_.drawingBufferHeight;t<1&&(t=1/t);let n=Math.round(e),r=Math.round(e*t);return _.drawingBufferWidth>_.drawingBufferHeight?{width:r,height:n}:{width:n,height:r}}function $(e){let t=window.devicePixelRatio||1;return Math.floor(e*t)}function Le(e){if(e.length===0)return 0;let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t|=0;return t}return window.addEventListener(`mousedown`,e=>{let t=g[0],n=r.getBoundingClientRect();X(t,-1,$(e.clientX-n.left),$(e.clientY-n.top)),De(t)}),document.body.addEventListener(`mousemove`,function e(t){let n=g[0],i=r.getBoundingClientRect(),a=$(t.clientX-i.left),o=$(t.clientY-i.top),s=Q();Y(),Z(n,a,o,s),document.body.removeEventListener(`mousemove`,e)}),window.addEventListener(`mousemove`,e=>{let t=g[0],n=r.getBoundingClientRect(),i=$(e.clientX-n.left),a=$(e.clientY-n.top),o=t.color;Z(t,i,a,o)}),document.body.addEventListener(`touchstart`,function e(t){let n=t.targetTouches,i=g[0],a=r.getBoundingClientRect();for(let e=0;e<n.length;e++){let t=$(n[e].clientX-a.left),r=$(n[e].clientY-a.top);Y(),X(i,n[e].identifier,t,r)}document.body.removeEventListener(`touchstart`,e)}),window.addEventListener(`touchstart`,e=>{let t=e.targetTouches,n=g[0],i=r.getBoundingClientRect();for(let e=0;e<t.length;e++){let r=$(t[e].clientX-i.left),a=$(t[e].clientY-i.top);X(n,t[e].identifier,r,a)}}),window.addEventListener(`touchmove`,e=>{let t=e.targetTouches,n=g[0],i=r.getBoundingClientRect();for(let e=0;e<t.length;e++)Z(n,$(t[e].clientX-i.left),$(t[e].clientY-i.top),n.color)},!1),window.addEventListener(`touchend`,e=>{let t=e.changedTouches,n=g[0];for(let e=0;e<t.length;e++)Ae(n)}),Y(),()=>{J.disconnect()}},[e,t,n,a,o,s,c,l,u,ee,te,ne,d,f,p,re]),(0,i.jsx)(`div`,{className:`absolute top-0 left-0 z-0 pointer-events-none w-full h-full overflow-hidden`,children:(0,i.jsx)(`canvas`,{ref:m,id:`fluid`,className:`w-full h-full block`})})}export{a as default};