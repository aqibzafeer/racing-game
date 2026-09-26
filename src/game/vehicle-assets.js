// Detailed, local procedural cars. All dimensions are tuned for game-world scale.
export default function createDetailedCar(
  THREE,
  kind = "sport",
  color = "#f43b47",
) {
  const suv = kind === "suv",
    van = kind === "van",
    supercar = kind === "supercar",
    rally = kind === "rally",
    muscle = kind === "muscle",
    sport = kind === "sport";
  const width = van
      ? 2.02
      : suv
        ? 2.08
        : supercar
          ? 2.06
          : muscle
            ? 2.04
            : rally
              ? 1.86
              : 1.96,
    length = van
      ? 4.85
      : suv
        ? 4.72
        : muscle
          ? 4.85
          : supercar
            ? 4.62
            : rally
              ? 3.95
              : 4.5;
  const w = width / 2,
    l = length / 2,
    radius = suv || van ? 0.43 : rally ? 0.37 : 0.36,
    roof = van
      ? 2.22
      : suv
        ? 1.96
        : rally
          ? 1.58
          : supercar
            ? 1.28
            : muscle
              ? 1.49
              : sport
                ? 1.42
                : 1.6;
  const g = new THREE.Group(),
    paint = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.19,
      metalness: 0.52,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.2,
    });
  const mat = (color, roughness = 0.6, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const dark = mat(0x17212b, 0.55),
    rubber = mat(0x182027, 0.95),
    chrome = mat(0xc4d7e2, 0.24, 0.82),
    carbon = mat(0x26323a, 0.66),
    interior = mat(0x314352, 0.86);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x37647d,
    metalness: 0.23,
    roughness: 0.12,
    clearcoat: 1,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
  });
  const lamps = new THREE.MeshStandardMaterial({
    color: 0xf5ffff,
    emissive: 0xc8f6ff,
    emissiveIntensity: 0.8,
    roughness: 0.15,
  });
  const tails = new THREE.MeshStandardMaterial({
    color: 0xb41424,
    emissive: 0xff2538,
    emissiveIntensity: 0.35,
    roughness: 0.2,
  });
  const amber = mat(0xffaa28, 0.25),
    brake = mat(0xd83a2d, 0.4, 0.3),
    cube = new THREE.BoxGeometry(1, 1, 1);
  cube.userData.shared = true;
  // Each builder owns its unit geometry; dispose it with the group after batching.
  cube.userData.shared = false;
  function mesh(geometry, material, parent = g) {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function box(size, pos, material = dark, parent = g) {
    const m = mesh(cube, material, parent);
    m.scale.set(...size);
    m.position.set(...pos);
    return m;
  }
  function link(a, b, r, material, parent = g) {
    const va = new THREE.Vector3(...a),
      vb = new THREE.Vector3(...b),
      m = mesh(
        new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 8),
        material,
        parent,
      );
    m.position.copy(va).lerp(vb, 0.5);
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      vb.sub(va).normalize(),
    );
    return m;
  }
  function quad(points, material) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points.flat(), 3),
    );
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.computeVertexNormals();
    return mesh(geo, material);
  }
  function loft(profiles, material) {
    const vertices = [],
      indices = [],
      n = 10;
    for (const [z, ww, top, low] of profiles) {
      for (const [x, y] of [
        [-0.88, low],
        [-1, low + 0.09],
        [-1, top - 0.1],
        [-0.96, top - 0.03],
        [-0.8, top],
        [0.8, top],
        [0.96, top - 0.03],
        [1, top - 0.1],
        [1, low + 0.09],
        [0.88, low],
      ])
        vertices.push(x * ww, y, z);
    }
    for (let i = 0; i < profiles.length - 1; i++)
      for (let j = 0; j < n; j++) {
        const a = i * n + j,
          b = i * n + ((j + 1) % n);
        indices.push(a, a + n, b, b, a + n, b + n);
      }
    for (let j = 1; j < n - 1; j++) {
      indices.push(0, j, j + 1);
      const a = (profiles.length - 1) * n;
      indices.push(a, a + j + 1, a + j);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return mesh(geo, material);
  }
  const bodyTop = supercar ? 0.86 : suv || van ? 1.13 : 1.02;
  loft(
    [
      [-l, w * 0.75, bodyTop - 0.19, 0.4],
      [-l * 0.94, w * 0.92, bodyTop - 0.07, 0.37],
      [-l * 0.7, w, bodyTop + 0.01, 0.37],
      [-l * 0.36, w * 0.97, bodyTop, 0.39],
      [l * 0.05, w * 0.99, bodyTop, 0.4],
      [l * 0.54, w, bodyTop, 0.4],
      [l * 0.86, w * 0.96, bodyTop - 0.06, 0.39],
      [l, w * 0.8, bodyTop - 0.13, 0.43],
    ],
    paint,
  );
  box([width * 0.92, 0.09, length * 0.94], [0, 0.36, 0], carbon);
  const front = supercar ? -l * 0.4 : muscle ? -l * 0.04 : -l * 0.28,
    rear = van ? l * 0.89 : rally ? l * 0.66 : l * 0.58,
    frontRoof = front + (supercar ? 0.48 : 0.57),
    rearRoof = rear - (van ? 0.17 : rally ? 0.18 : 0.55),
    roofW = w * (van ? 0.88 : suv ? 0.79 : 0.69),
    baseW = w * 0.87,
    baseY = bodyTop - 0.01;
  if (!van) {
    quad(
      [
        [-baseW, baseY, front],
        [baseW, baseY, front],
        [roofW, roof, frontRoof],
        [-roofW, roof, frontRoof],
      ],
      glass,
    );
    quad(
      [
        [baseW, baseY, rear],
        [-baseW, baseY, rear],
        [-roofW, roof, rearRoof],
        [roofW, roof, rearRoof],
      ],
      glass,
    );
    for (const side of [-1, 1]) {
      const f = [side * baseW, baseY, front],
        r = [side * baseW, baseY, rear],
        rf = [side * roofW, roof, frontRoof],
        rr = [side * roofW, roof, rearRoof];
      quad([f, rf, rr, r], glass);
      link(f, rf, 0.045, paint);
      link(r, rr, 0.065, paint);
      link(rf, rr, 0.035, paint);
      const split = (frontRoof + rearRoof) * 0.5;
      link(
        [side * baseW, baseY, split],
        [side * roofW, roof, split],
        0.035,
        carbon,
      );
      box([0.3, 0.38, 0.25], [side * 0.43, 1.05, 0.25], interior);
      box([0.34, 0.17, 0.46], [side * 0.43, 0.84, 0.3], interior);
    }
    loft(
      [
        [frontRoof - 0.04, roofW * 0.94, roof + 0.02, roof - 0.085],
        [frontRoof + 0.14, roofW, roof + 0.06, roof - 0.04],
        [rearRoof - 0.14, roofW, roof + 0.06, roof - 0.04],
        [rearRoof + 0.04, roofW * 0.94, roof + 0.02, roof - 0.085],
      ],
      paint,
    );
    box(
      [width * 0.72, 0.12, 0.25],
      [0, bodyTop + 0.08, front + 0.18],
      interior,
    );
  } else {
    // A short windscreen and painted cargo box distinguish the van from passenger cars.
    quad(
      [
        [-baseW, 1.08, front],
        [baseW, 1.08, front],
        [roofW, roof - 0.07, frontRoof],
        [-roofW, roof - 0.07, frontRoof],
      ],
      glass,
    );
    loft(
      [
        [frontRoof, roofW, roof, 1.04],
        [rear - 0.1, roofW, roof, 1.04],
        [rear, roofW * 0.95, roof - 0.05, 1.04],
      ],
      paint,
    );
    for (const side of [-1, 1]) {
      quad(
        [
          [side * (roofW + 0.01), 1.15, front + 0.3],
          [side * (roofW + 0.01), roof - 0.16, frontRoof + 0.08],
          [side * (roofW + 0.01), roof - 0.16, frontRoof + 0.58],
          [side * (roofW + 0.01), 1.15, frontRoof + 0.58],
        ],
        glass,
      );
      link(
        [side * baseW, 1.08, front],
        [side * roofW, roof - 0.05, frontRoof],
        0.055,
        paint,
      );
      box([0.015, 0.025, 1.6], [side * (roofW + 0.012), 1.45, 0.65], chrome);
    }
  }
  const axle = length * (rally ? 0.31 : 0.32),
    wheels = [],
    frontWheels = [];
  for (const side of [-1, 1])
    for (const z of [-axle, axle]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * (w - 0.015), radius + 0.035, z);
      g.add(pivot);
      const wheel = new THREE.Group();
      pivot.add(wheel);
      const tire = mesh(
        new THREE.CylinderGeometry(radius, radius, 0.25, 32),
        rubber,
        wheel,
      );
      tire.rotation.z = Math.PI / 2;
      const sidewall = mesh(
        new THREE.TorusGeometry(radius * 0.8, radius * 0.15, 8, 32),
        rubber,
        wheel,
      );
      sidewall.rotation.y = Math.PI / 2;
      sidewall.position.x = side * 0.115;
      const disc = mesh(
        new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, 0.23, 24),
        chrome,
        wheel,
      );
      disc.rotation.z = Math.PI / 2;
      const faceX = side * 0.14;
      for (let i = 0; i < 7; i++) {
        const angle = (i * Math.PI * 2) / 7;
        link(
          [
            faceX,
            Math.sin(angle) * radius * 0.22,
            Math.cos(angle) * radius * 0.22,
          ],
          [
            faceX,
            Math.sin(angle + 0.15) * radius * 0.7,
            Math.cos(angle + 0.15) * radius * 0.7,
          ],
          0.018,
          rally ? chrome : carbon,
          wheel,
        );
      }
      const hub = mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.29, 16),
        chrome,
        wheel,
      );
      hub.rotation.z = Math.PI / 2;
      box([0.08, 0.17, 0.075], [side * 0.1, 0.04, radius * 0.55], brake, pivot);
      wheels.push(wheel);
      if (z < 0) frontWheels.push(pivot);
      const arch = mesh(
        new THREE.TorusGeometry(radius + 0.07, 0.045, 8, 32, Math.PI),
        suv || rally ? carbon : paint,
      );
      arch.rotation.y = Math.PI / 2;
      arch.position.set(side * (w + 0.015), radius + 0.035, z);
    }
  const nose = -l - 0.015,
    tail = l + 0.015;
  box([width * 0.55, 0.2, 0.035], [0, 0.64, nose], dark);
  for (let i = 0; i < 7; i++)
    box([0.022, 0.13, 0.025], [(i - 3) * 0.11, 0.64, nose - 0.024], chrome);
  for (const side of [-1, 1]) {
    if (muscle) {
      for (const x of [0.49, 0.74]) {
        const light = mesh(
          new THREE.CylinderGeometry(0.105, 0.105, 0.055, 24),
          lamps,
        );
        light.rotation.x = Math.PI / 2;
        light.position.set(side * x, 0.84, nose);
      }
    } else {
      const light = box(
        [width * 0.23, 0.065, 0.045],
        [side * w * 0.59, bodyTop - 0.11, nose],
        lamps,
      );
      light.rotation.z = side * (supercar ? 0.12 : 0.04);
      box(
        [width * 0.2, 0.035, 0.035],
        [side * w * 0.59, bodyTop - 0.21, nose - 0.006],
        carbon,
      );
    }
    box(
      [width * 0.22, 0.055, 0.04],
      [side * w * 0.6, bodyTop - 0.11, tail],
      tails,
    );
    box([0.06, 0.05, 0.035], [side * w * 0.83, bodyTop - 0.2, nose], amber);
    box(
      [0.28, 0.13, 0.24],
      [side * (w + 0.11), bodyTop + 0.2, front + 0.3],
      paint,
    );
    box(
      [0.23, 0.095, 0.025],
      [side * (w + 0.11), bodyTop + 0.2, front + 0.43],
      chrome,
    );
    link(
      [side * w, bodyTop + 0.12, front + 0.33],
      [side * (w + 0.11), bodyTop + 0.2, front + 0.33],
      0.025,
      carbon,
    );
    box(
      [0.025, 0.035, 0.22],
      [side * (w + 0.005), bodyTop - 0.09, 0.21],
      chrome,
    );
    if (kind === "sedan" || suv)
      box(
        [0.025, 0.035, 0.22],
        [side * (w + 0.005), bodyTop - 0.09, 0.85],
        chrome,
      );
    const pipe = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.23, 16), chrome);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(side * w * 0.65, 0.45, l - 0.04);
    box([0.045, 0.12, length * 0.48], [side * w, 0.46, 0.1], carbon);
    if (suv) {
      link(
        [side * 0.63, roof + 0.1, frontRoof],
        [side * 0.63, roof + 0.1, rearRoof],
        0.035,
        chrome,
      );
      box(
        [0.04, 0.11, 0.1],
        [side * 0.63, roof + 0.045, frontRoof + 0.15],
        carbon,
      );
    }
  }
  box([width * 0.79, 0.055, 0.16], [0, 0.39, nose + 0.06], carbon);
  box([width * 0.75, 0.13, 0.17], [0, 0.44, l - 0.03], carbon);
  if (sport || supercar || rally) {
    const spoilerY = bodyTop + (rally ? 0.52 : 0.22),
      spoilerZ = l * 0.79;
    for (const x of [-0.57, 0.57])
      box([0.05, 0.2, 0.07], [x, spoilerY - 0.08, spoilerZ], carbon);
    box(
      [width * 0.9, 0.055, 0.26],
      [0, spoilerY, spoilerZ],
      supercar ? carbon : paint,
    );
  }
  if (supercar) {
    for (const side of [-1, 1]) {
      box([0.022, 0.19, 0.59], [side * w * 0.99, 0.75, 0.48], carbon);
      for (let i = 0; i < 3; i++)
        box(
          [0.035, 0.015, 0.4],
          [side * w * 0.995, 0.69 + i * 0.045, 0.47],
          chrome,
        );
    }
    for (let i = 0; i < 5; i++)
      box([0.04, 0.13, 0.32], [(i - 2) * 0.24, 0.4, l - 0.05], carbon);
  }
  if (muscle) {
    for (const x of [-0.18, 0.18]) {
      box([0.19, 0.013, l * 0.88], [x, bodyTop + 0.023, -l * 0.47], carbon);
      box([0.19, 0.012, 0.36], [x, bodyTop + 0.006, l * 0.72], carbon);
    }
    box([0.47, 0.085, 0.44], [0, bodyTop + 0.055, -l * 0.38], paint);
  }
  if (rally) {
    for (const x of [-0.35, 0, 0.35]) {
      const light = mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.1, 20),
        lamps,
      );
      light.rotation.x = Math.PI / 2;
      light.position.set(x, 0.8, nose - 0.08);
    }
  }
  // Door shut-lines and a thin beltline keep the cabin from reading as one solid block.
  const seamMat = new THREE.LineBasicMaterial({
    color: 0x273b49,
    transparent: true,
    opacity: 0.5,
  });
  for (const side of [-1, 1]) {
    const geo = new THREE.BufferGeometry().setFromPoints(
      [
        [side * (w + 0.004), bodyTop - 0.03, -0.3],
        [side * (w + 0.004), 0.52, -0.15],
        [side * (w + 0.004), 0.52, 0.6],
        [side * (w + 0.004), bodyTop - 0.03, 0.75],
      ].map((p) => new THREE.Vector3(...p)),
    );
    g.add(new THREE.Line(geo, seamMat));
  }

  // Polished rim lips, wheel bolts, wipers and mirror indicators.
  for (const wheel of wheels) {
    const side = Math.sign(wheel.parent.position.x);
    const rim = mesh(
      new THREE.TorusGeometry(radius * 0.73, 0.018, 6, 32),
      chrome,
      wheel,
    );
    rim.rotation.y = Math.PI / 2;
    rim.position.x = side * 0.145;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      box(
        [0.025, 0.022, 0.022],
        [side * 0.153, Math.sin(a) * 0.045, Math.cos(a) * 0.045],
        chrome,
        wheel,
      );
    }
  }
  for (const side of [-1, 1]) {
    link(
      [side * 0.48, baseY + 0.018, front + 0.04],
      [side * 0.14, baseY + 0.065, front + 0.12],
      0.012,
      carbon,
    );
    box(
      [0.27, 0.018, 0.025],
      [side * (w + 0.11), bodyTop + 0.16, front + 0.2],
      lamps,
    );
  }
  const labelCache =
    window.__roadPlateMaterial ||
    (window.__roadPlateMaterial = (() => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const c = canvas.getContext("2d");
      c.fillStyle = "#eef4e6";
      c.fillRect(0, 0, 256, 64);
      c.fillStyle = "#142535";
      c.font = "bold 30px Arial";
      c.textAlign = "center";
      c.fillText("ROAD CLUB", 128, 43);
      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 });
      m.userData.shared = true;
      return m;
    })());
  for (const sign of [-1, 1]) {
    const plate = mesh(new THREE.PlaneGeometry(0.48, 0.12), labelCache);
    plate.position.set(0, 0.57, sign * (l + 0.043));
    if (sign < 0) plate.rotation.y = Math.PI;
  }
  g.userData = {
    kind,
    paint,
    wheels,
    frontWheels,
    radius,
    tails,
    halfWidth: w + 0.12,
    halfLength: l + 0.06,
  };
  return g;
}
