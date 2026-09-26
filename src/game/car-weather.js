// Weather scene and particle resources are reused when modes change.
export default function createCarWeather(THREE, scene, renderer) {
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color() },
      bottom: { value: new THREE.Color() },
    },
    vertexShader:
      "varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:
      "varying float h;uniform vec3 top;uniform vec3 bottom;void main(){gl_FragColor=vec4(mix(bottom,top,smoothstep(-0.03,0.8,h)),1.0);}",
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 24, 12), skyMat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);
  const clouds = new THREE.Group(),
    cloudGeo = new THREE.IcosahedronGeometry(1, 2),
    cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      transparent: true,
      opacity: 0.9,
    });
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 3; j++) {
      const m = new THREE.Mesh(cloudGeo, cloudMat);
      m.position.set(
        ((i % 4) - 1.5) * 100 + j * 9,
        66 + (i % 3) * 12,
        -180 + Math.floor(i / 4) * 130,
      );
      m.scale.set(19, 5 + (j % 2) * 2, 12);
      clouds.add(m);
    }
  scene.add(clouds);
  const sunOrb = new THREE.Mesh(
    new THREE.SphereGeometry(9, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe6a3 }),
  );
  scene.add(sunOrb);
  sunOrb.name = "Weather sun";
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(7, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xdde7f0 }),
  );
  scene.add(moon);
  const starPositions = [];
  for (let i = 0; i < 500; i++) {
    const a = i * 2.399963,
      h = 0.12 + (i % 97) / 110,
      r = Math.sqrt(1 - h * h);
    starPositions.push(Math.cos(a) * r * 550, h * 550, Math.sin(a) * r * 550);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3),
  );
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xe2eaff,
      size: 1.1,
      sizeAttenuation: true,
    }),
  );
  scene.add(stars);
  const rainCount = 850,
    rainArray = new Float32Array(rainCount * 6);
  for (let i = 0; i < rainCount; i++) {
    const j = i * 6,
      x = ((i * 31.71) % 80) - 40,
      y = (i * 13.17) % 40,
      z = ((i * 23.13) % 80) - 40;
    rainArray.set([x, y, z, x - 0.12, y + 1.2, z], j);
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainArray, 3));
  const rain = new THREE.LineSegments(
    rainGeo,
    new THREE.LineBasicMaterial({
      color: 0x9fc0d0,
      transparent: true,
      opacity: 0.55,
    }),
  );
  rain.frustumCulled = false;
  scene.add(rain);
  const flakeCanvas = document.createElement("canvas");
  flakeCanvas.width = flakeCanvas.height = 32;
  const c = flakeCanvas.getContext("2d"),
    gradient = c.createRadialGradient(16, 16, 1, 16, 16, 15);
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(0.5, "#ffffffcc");
  gradient.addColorStop(1, "#ffffff00");
  c.fillStyle = gradient;
  c.fillRect(0, 0, 32, 32);
  const flakes = new Float32Array(650 * 3);
  for (let i = 0; i < 650; i++)
    flakes.set(
      [((i * 17.43) % 70) - 35, (i * 13.15) % 32, ((i * 27.63) % 70) - 35],
      i * 3,
    );
  const snowGeo = new THREE.BufferGeometry();
  snowGeo.setAttribute("position", new THREE.BufferAttribute(flakes, 3));
  const snow = new THREE.Points(
    snowGeo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      map: new THREE.CanvasTexture(flakeCanvas),
      size: 0.23,
      transparent: true,
      depthWrite: false,
    }),
  );
  snow.frustumCulled = false;
  scene.add(snow);
  const lightning = new THREE.DirectionalLight(0xcbdfff, 0);
  scene.add(lightning, lightning.target);
  const boltGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-60, 95, -180),
    new THREE.Vector3(-66, 73, -181),
    new THREE.Vector3(-57, 74, -181),
    new THREE.Vector3(-69, 50, -182),
    new THREE.Vector3(-62, 50, -182),
    new THREE.Vector3(-80, 20, -183),
  ]);
  const bolt = new THREE.Line(
    boltGeo,
    new THREE.LineBasicMaterial({
      color: 0xd8e9ff,
      transparent: true,
      opacity: 0.9,
    }),
  );
  scene.add(bolt);
  let mode = "sunny",
    time = 0,
    nextLightning = 7,
    flashRemaining = 0,
    thunderDelay = -1,
    thunderFn = () => {};
  function setMode(value) {
    mode = value;
    nextLightning = 7;
    flashRemaining = 0;
    thunderDelay = -1;
    lightning.intensity = 0;
    bolt.visible = false;
    const p =
      value === "night"
        ? [0x02040c, 0x101b30]
        : value === "rain"
          ? [0x152332, 0x435767]
          : value === "snow"
            ? [0x98aebd, 0xd4dfe3]
            : [0x0785e7, 0xace5ff];
    skyMat.uniforms.top.value.set(p[0]);
    skyMat.uniforms.bottom.value.set(p[1]);
    cloudMat.color.set(
      value === "rain" ? 0x354655 : value === "night" ? 0x111b2a : 0xe9eff0,
    );
    if (value === "sunny") cloudMat.color.set(0xffffff);
    cloudMat.opacity =
      value === "night" ? 0.35 : value === "sunny" ? 0.82 : 0.9;
    sky.visible = clouds.visible = true;
    sunOrb.visible = value === "sunny";
    moon.visible = stars.visible = value === "night";
    rain.visible = value === "rain";
    snow.visible = value === "snow";
  }
  function triggerLightning() {
    if (mode !== "rain") return;
    flashRemaining = 0.16;
    thunderDelay = 0.6;
    lightning.intensity = 1.8;
    bolt.visible = true;
    nextLightning = 8 + Math.random() * 5;
  }
  function update(dt, position) {
    time += dt;
    sky.position.copy(position);
    clouds.position.set(position.x, 0, position.z);
    clouds.position.x += Math.sin(time * 0.025) * 10;
    sunOrb.position.copy(position).add(new THREE.Vector3(150, 165, -330));
    moon.position.copy(position).add(new THREE.Vector3(-140, 170, -320));
    stars.position.copy(position);
    rain.position.copy(position);
    snow.position.copy(position);
    lightning.position.copy(position).add(new THREE.Vector3(-60, 100, -100));
    lightning.target.position.copy(position);
    bolt.position.copy(position);
    if (mode === "rain") {
      for (let i = 0; i < rainCount; i++) {
        const j = i * 6;
        rainArray[j] += 5 * dt;
        rainArray[j + 1] -= 36 * dt;
        if (rainArray[j + 1] < 0) {
          rainArray[j + 1] = 40;
          rainArray[j] = ((i * 31.71) % 80) - 40;
        }
        rainArray[j + 3] = rainArray[j] - 0.16;
        rainArray[j + 4] = rainArray[j + 1] + 1.3;
      }
      rainGeo.attributes.position.needsUpdate = true;
      nextLightning -= dt;
      if (nextLightning <= 0) triggerLightning();
      if (flashRemaining > 0) {
        flashRemaining = Math.max(0, flashRemaining - dt);
        lightning.intensity = 1.8 * (flashRemaining / 0.16);
        bolt.visible = flashRemaining > 0;
      }
      if (thunderDelay >= 0) {
        thunderDelay -= dt;
        if (thunderDelay < 0) thunderFn();
      }
    }
    if (mode === "snow") {
      for (let i = 0; i < 650; i++) {
        const j = i * 3;
        flakes[j] += Math.sin(time * 0.7 + i) * dt * 0.7;
        flakes[j + 1] -= 2.4 * dt;
        if (flakes[j + 1] < 0) {
          flakes[j + 1] = 32;
          flakes[j] = ((i * 17.43) % 70) - 35;
        }
      }
      snowGeo.attributes.position.needsUpdate = true;
    }
  }
  function hide() {
    for (const o of [sky, clouds, sunOrb, moon, stars, rain, snow, bolt])
      o.visible = false;
    lightning.intensity = 0;
    flashRemaining = 0;
    thunderDelay = -1;
  }
  function cancelFlash() {
    flashRemaining = 0;
    thunderDelay = -1;
    lightning.intensity = 0;
    bolt.visible = false;
  }
  hide();
  return {
    setMode,
    update,
    hide,
    cancelFlash,
    triggerLightning,
    onThunder(fn) {
      thunderFn = fn;
    },
    get mode() {
      return mode;
    },
    get rainVisible() {
      return rain.visible;
    },
    get snowVisible() {
      return snow.visible;
    },
    get lightningIntensity() {
      return lightning.intensity;
    },
    get starVisible() {
      return stars.visible;
    },
  };
}
