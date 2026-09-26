/* Procedural assets shared by the main game and the classic car game. */
window.createRoadAssets = function (THREE) {
  const materials = new Map();
  const cube = new THREE.BoxGeometry(1, 1, 1);
  cube.userData.shared = true;
  function material(color, roughness = 0.7, metalness = 0) {
    const key = `${color}/${roughness}/${metalness}`;
    if (!materials.has(key)) {
      const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      m.userData.shared = true;
      materials.set(key, m);
    }
    return materials.get(key);
  }
  function box(g, size, pos, m) {
    const mesh = new THREE.Mesh(cube, m);
    mesh.scale.set(...size);
    mesh.position.set(...pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  }
  function noiseTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d"),
      pixels = ctx.createImageData(256, 256);
    let seed = 9157;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (1664525 * seed + 1013904223) >>> 0;
      const v = 85 + (seed % 45);
      pixels.data.set([v, v + 2, v + 4, 255], i);
    }
    ctx.putImageData(pixels, 0, 0);
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 1);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  const asphalt = material(0xb0b0b0, 0.96);
  asphalt.map = noiseTexture();
  const paint = material(0xe8e5d7),
    concrete = material(0xa9a69b),
    gravel = material(0x827c70);
  const trim = material(0x20252b, 0.48),
    chrome = material(0xaeb9c2, 0.25, 0.8);
  const glass = material(0x274554, 0.15, 0.5);
  function car(kind = "sedan", color = 0xb92d31) {
    const g = new THREE.Group(),
      body = material(color, 0.24, 0.48);
    const suv = kind === "suv",
      van = kind === "van",
      sport = kind === "car" || kind === "sport";
    const width = van ? 2.04 : suv ? 2 : 1.88,
      length = van ? 4.9 : suv ? 4.6 : 4.35;
    const roof = van ? 2.3 : suv ? 1.94 : sport ? 1.42 : 1.64;
    const radius = suv || van ? 0.43 : 0.36,
      axle = length * 0.32;
    const bodyOutline = new THREE.Shape();
    bodyOutline.moveTo(-width * 0.43, 0.5);
    bodyOutline.lineTo(width * 0.43, 0.5);
    bodyOutline.quadraticCurveTo(width * 0.5, 0.5, width * 0.5, 0.66);
    bodyOutline.lineTo(width * 0.48, 0.87);
    bodyOutline.quadraticCurveTo(width * 0.46, 0.98, width * 0.39, 0.98);
    bodyOutline.lineTo(-width * 0.39, 0.98);
    bodyOutline.quadraticCurveTo(-width * 0.46, 0.98, -width * 0.48, 0.87);
    bodyOutline.lineTo(-width * 0.5, 0.66);
    bodyOutline.quadraticCurveTo(-width * 0.5, 0.5, -width * 0.43, 0.5);
    const shell = new THREE.Mesh(
      new THREE.ExtrudeGeometry(bodyOutline, {
        depth: length - 0.16,
        bevelEnabled: true,
        bevelSize: 0.06,
        bevelThickness: 0.08,
        bevelSegments: 2,
        steps: 1,
      }),
      body,
    );
    shell.position.z = -length / 2 + 0.08;
    shell.castShadow = true;
    g.add(shell);
    box(g, [width * 0.94, 0.12, length * 0.96], [0, 0.44, 0], trim);
    box(
      g,
      [width * 0.95, 0.18, length * 0.27],
      [0, 1.04, -length * 0.33],
      body,
    );
    // A tapered cabin gives the windscreen and roof a believable silhouette.
    const lowerW = width * 0.46,
      upperW = width * 0.37;
    const front = -length * 0.19,
      rear = length * (van ? 0.43 : 0.24);
    const vertices = new Float32Array([
      -lowerW,
      0.98,
      front,
      lowerW,
      0.98,
      front,
      -upperW,
      roof,
      front + 0.46,
      upperW,
      roof,
      front + 0.46,
      -lowerW,
      0.98,
      rear,
      lowerW,
      0.98,
      rear,
      -upperW,
      roof,
      rear - 0.3,
      upperW,
      roof,
      rear - 0.3,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.setIndex([
      0, 2, 1, 1, 2, 3, 4, 5, 6, 5, 7, 6, 0, 4, 2, 4, 6, 2, 1, 3, 5, 5, 3, 7, 2,
      6, 3, 6, 7, 3,
    ]);
    geo.computeVertexNormals();
    const cabin = new THREE.Mesh(geo, glass);
    cabin.castShadow = true;
    g.add(cabin);
    box(
      g,
      [upperW * 2 + 0.05, 0.095, rear - front - 0.72],
      [0, roof + 0.015, (front + rear + 0.16) / 2],
      body,
    );
    if (van)
      box(
        g,
        [width * 0.89, roof - 1.04, length * 0.39],
        [0, (roof + 1.04) / 2, length * 0.22],
        body,
      );
    for (const side of [-1, 1]) {
      box(
        g,
        [0.08, roof - 1.02, 0.12],
        [side * width * 0.4, (roof + 1.02) / 2, 0.22],
        body,
      );
      box(
        g,
        [0.06, 0.032, length * 0.35],
        [side * (width / 2 + 0.006), 0.84, 0.2],
        chrome,
      );
      box(g, [0.075, 0.06, 0.22], [side * (width / 2 + 0.02), 1, 0.35], chrome);
      box(
        g,
        [0.24, 0.15, 0.27],
        [side * (width / 2 + 0.1), 1.17, front + 0.25],
        body,
      );
      if (suv)
        box(g, [0.055, 0.07, 1.8], [side * 0.64, roof + 0.09, 0.12], chrome);
    }
    const wheels = [],
      frontWheels = [];
    for (const side of [-1, 1])
      for (const z of [-axle, axle]) {
        const pivot = new THREE.Group();
        pivot.position.set((side * width) / 2, radius + 0.04, z);
        g.add(pivot);
        const wheel = new THREE.Group();
        pivot.add(wheel);
        const tire = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius, 0.25, 20),
          material(0x17191c, 0.95),
        );
        tire.rotation.z = Math.PI / 2;
        wheel.add(tire);
        const rim = new THREE.Mesh(
          new THREE.CylinderGeometry(radius * 0.69, radius * 0.69, 0.265, 16),
          chrome,
        );
        rim.rotation.z = Math.PI / 2;
        wheel.add(rim);
        for (let k = 0; k < 5; k++) {
          const a = (k * Math.PI * 2) / 5;
          const spoke = box(
            wheel,
            [0.275, radius * 1.13, 0.045],
            [0, 0, 0],
            trim,
          );
          spoke.rotation.x = a;
        }
        wheels.push(wheel);
        if (z < 0) frontWheels.push(pivot);
      }
    const tails = new THREE.MeshStandardMaterial({
      color: 0xb7131f,
      emissive: 0xff1620,
      emissiveIntensity: 0.35,
    });
    const lamps = material(0xf5f2da, 0.22);
    lamps.emissive.set(0xffeac2);
    lamps.emissiveIntensity = 0.75;
    for (const side of [-1, 1]) {
      box(
        g,
        [0.48, 0.13, 0.055],
        [side * width * 0.33, 0.89, -length / 2 - 0.015],
        lamps,
      );
      box(
        g,
        [0.46, 0.13, 0.055],
        [side * width * 0.33, 0.89, length / 2 + 0.015],
        tails,
      );
    }
    box(g, [0.68, 0.22, 0.05], [0, 0.67, -length / 2 - 0.02], trim);
    for (const z of [-1, 1])
      box(g, [0.43, 0.13, 0.035], [0, 0.64, z * (length / 2 + 0.05)], paint);
    if (sport) {
      for (const x of [-0.62, 0.62])
        box(g, [0.07, 0.23, 0.09], [x, 1.12, length * 0.41], trim);
      box(g, [1.78, 0.07, 0.29], [0, 1.25, length * 0.41], body);
    }
    g.userData = {
      kind,
      wheels,
      frontWheels,
      radius,
      tails,
      halfWidth: width / 2,
      halfLength: length / 2,
    };
    return g;
  }
  function animateCar(g, speed, steering, braking, dt) {
    if (!g.userData.wheels) return;
    for (const w of g.userData.wheels)
      w.rotation.x -= (speed * dt) / g.userData.radius;
    for (const w of g.userData.frontWheels) w.rotation.y = -steering * 0.3;
    g.userData.tails.emissiveIntensity = braking ? 3 : 0.35;
  }
  function house(seed = 0) {
    const g = new THREE.Group(),
      two = seed % 3 === 0,
      height = two ? 6 : 3.5;
    const wall = material(
      [0xf2c583, 0x86c8c2, 0xf2ae96, 0xb7b0d9][Math.abs(seed) % 4],
    );
    const roofMat = material(seed % 2 ? 0x384e65 : 0xb45d3e);
    box(g, [8, 0.26, 7], [0, 0.13, 0], concrete);
    box(g, [7.4, height, 6.2], [0, height / 2 + 0.25, 0], wall);
    const shape = new THREE.Shape();
    shape.moveTo(-4.05, 0);
    shape.lineTo(0, 2);
    shape.lineTo(4.05, 0);
    shape.closePath();
    const roof = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: 6.9, bevelEnabled: false }),
      roofMat,
    );
    roof.position.set(0, height + 0.23, -3.45);
    roof.castShadow = true;
    g.add(roof);
    box(g, [0.65, 1.7, 0.7], [2.2, height + 1.1, 0.9], material(0x875d49));
    box(g, [1.1, 2.2, 0.09], [0, 1.37, -3.15], material(0x51483d));
    box(g, [1.65, 0.18, 0.8], [0, 0.2, -3.5], concrete);
    box(g, [2, 0.12, 1.15], [0, 2.65, -3.45], roofMat);
    for (let floor = 0; floor < (two ? 2 : 1); floor++)
      for (const x of [-2.3, 2.3]) {
        const y = 1.85 + floor * 2.8;
        box(g, [1.65, 1.5, 0.1], [x, y, -3.16], paint);
        box(g, [1.4, 1.25, 0.12], [x, y, -3.23], glass);
        box(g, [0.06, 1.26, 0.04], [x, y, -3.31], paint);
        box(g, [1.42, 0.06, 0.04], [x, y, -3.31], paint);
        box(g, [1.9, 0.1, 0.32], [x, y - 0.79, -3.25], concrete);
      }
    for (const side of [-1, 1])
      for (let floor = 0; floor < (two ? 2 : 1); floor++)
        for (const z of [-1.45, 1.45]) {
          const y = 1.85 + floor * 2.8;
          box(g, [0.1, 1.5, 1.5], [side * 3.75, y, z], paint);
          box(g, [0.12, 1.24, 1.25], [side * 3.82, y, z], glass);
          box(g, [0.035, 1.25, 0.065], [side * 3.9, y, z], paint);
        }

    // Porch framing, rain gutters and planted window boxes.
    for (const side of [-1, 1]) {
      box(g, [0.14, 0.17, 7], [side * 4.03, height + 0.23, 0], paint);
      box(g, [0.09, height, 0.09], [side * 3.78, height / 2, 3.1], paint);
      box(g, [0.11, 2.5, 0.11], [side * 0.84, 1.3, -3.85], paint);
      for (let row = 1; row < 8; row++) {
        const x = side * row * 0.5;
        box(g, [0.035, 0.035, 6.95], [x, height + 2.25 - Math.abs(x) * 2 / 4.05, 0], roofMat);
      }
      box(g, [1.65, 0.3, 0.4], [side * 2.3, 0.98, -3.4], material(0xa85837));
      box(g, [1.5, 0.22, 0.35], [side * 2.3, 1.2, -3.4], material(0x439b53));
      for (let flower = 0; flower < 5; flower++)
        box(g, [0.14, 0.16, 0.16], [side * 2.3 - 0.6 + flower * 0.3, 1.36, -3.42], material(seed % 2 ? 0xffcf45 : 0xed5991));
    }
    box(g, [0.09, 0.09, 0.12], [0.34, 1.4, -3.24], chrome);
    box(g, [0.9, 0.12, 0.95], [2.2, height + 1.98, 0.9], concrete);
    box(g, [2, 0.045, 7], [0, 0.035, -6.6], concrete);
    for (const side of [-1, 1]) {
      box(g, [0.18, 0.85, 11], [side * 5.2, 0.45, -2], material(0x657452));
      box(g, [3.8, 0.65, 0.6], [side * 3.5, 0.35, -7.3], material(0x4c643c));
    }
    return g;
  }
  const streetGlow = material(0xffe2a4, 0.3);
  streetGlow.emissive.set(0xffd28a);
  streetGlow.emissiveIntensity = 0;
  function streetLamp() {
    const g = new THREE.Group();
    box(g, [0.14, 6.3, 0.14], [0, 3.15, 0], chrome);
    box(g, [1.7, 0.1, 0.12], [0.8, 6.3, 0], chrome);
    box(g, [0.7, 0.12, 0.32], [1.45, 6.22, 0], paint);
    box(g, [0.64, 0.025, 0.28], [1.45, 6.14, 0], streetGlow);
    return g;
  }
  // Curved strips use world-space UVs so the asphalt grain keeps a constant scale.
  function strip(point, tangent, from, to, inner, outer, y, m, steps = 32) {
    const p = [],
      uv = [],
      idx = [];
    for (let i = 0; i <= steps; i++) {
      const d = from + ((to - from) * i) / steps,
        c = point(d),
        t = tangent(d);
      for (const w of [inner, outer]) {
        const x = c.x - t.z * w,
          z = c.z + t.x * w;
        p.push(x, y, z);
        uv.push(x / 4, z / 4);
      }
      if (i < steps) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m);
    mesh.receiveShadow = true;
    return mesh;
  }
  function roadside(group, point, tangent, from, to, seed) {
    group.add(
      strip(point, tangent, from, to, -12, 12, 0.028, gravel),
      strip(point, tangent, from, to, -10, 10, 0.045, asphalt),
    );
    for (const side of [-1, 1]) {
      const lo = side < 0 ? -9.45 : 9.28,
        hi = side < 0 ? -9.28 : 9.45;
      group.add(strip(point, tangent, from, to, lo, hi, 0.058, paint));
      group.add(
        strip(
          point,
          tangent,
          from,
          to,
          side < 0 ? -14 : 12,
          side < 0 ? -12 : 14,
          0.13,
          concrete,
        ),
      );
      const d = (from + to) / 2,
        p = point(d),
        t = tangent(d),
        n = new THREE.Vector3(-t.z, 0, t.x);
      const h = house(Math.abs(seed * 2 + (side > 0 ? 1 : 0)));
      h.position.copy(p).addScaledVector(n, side * 25);
      h.position.y = 0;
      h.rotation.y = Math.atan2(n.x * side, n.z * side);
      group.add(h);
      (group.userData.houses ||= []).push(h);
      const lamp = streetLamp();
      lamp.position.copy(point(from + 8)).addScaledVector(n, side * 13);
      lamp.rotation.y = Math.atan2(t.x, t.z) + (side < 0 ? Math.PI : 0);
      group.add(lamp);
      (group.userData.streetLamps ||= []).push(lamp);
    }
  }
  function batchBoxes(group) {
    group.updateMatrixWorld(true);
    const buckets = new Map();
    group.traverse((o) => {
      if (o.isMesh && o.geometry === cube) {
        if (!buckets.has(o.material)) buckets.set(o.material, []);
        buckets.get(o.material).push(o);
      }
    });
    const inverse = group.matrixWorld.clone().invert();
    for (const [m, meshes] of buckets) {
      const batch = new THREE.InstancedMesh(cube, m, meshes.length);
      meshes.forEach((mesh, i) => {
        batch.setMatrixAt(
          i,
          new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld),
        );
        mesh.removeFromParent();
      });
      batch.castShadow = true;
      batch.receiveShadow = true;
      batch.instanceMatrix.needsUpdate = true;
      group.add(batch);
    }
  }
  function dispose(group) {
    const geometries = new Set(),
      mats = new Set();
    group.traverse((o) => {
      if (o.isInstancedMesh) o.dispose();
      if (o.geometry && !o.geometry.userData.shared) geometries.add(o.geometry);
      if (o.material && !o.material.userData.shared) mats.add(o.material);
    });
    geometries.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    group.removeFromParent();
  }
  return { car, animateCar, house, roadside, asphalt, dispose, batchBoxes, streetGlow };
};
