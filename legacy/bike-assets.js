// Moto Road: procedural motorcycles and an articulated, fully equipped rider.
window.createBikeAssets = function (THREE) {
  const mat = (color, r = 0.6, m = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m });
  function mesh(g, geo, m, p = [0, 0, 0]) {
    const o = new THREE.Mesh(geo, m);
    o.position.set(...p);
    o.castShadow = true;
    o.receiveShadow = true;
    g.add(o);
    return o;
  }
  function ellipsoid(g, size, p, m) {
    const o = mesh(g, new THREE.SphereGeometry(1, 18, 12), m, p);
    o.scale.set(...size);
    return o;
  }
  function box(g, size, p, m) {
    return mesh(g, new THREE.BoxGeometry(...size), m, p);
  }
  function link(g, a, b, r, m, r2 = r) {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b);
    const o = mesh(
      g,
      new THREE.CylinderGeometry(r, r2, start.distanceTo(end), 10),
      m,
    );
    o.position.copy(start).lerp(end, 0.5);
    o.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      end.sub(start).normalize(),
    );
    return o;
  }
  function commuter(kind, color) {
    const cg = kind === 4,
      g = new THREE.Group(),
      radius = cg ? 0.365 : 0.34,
      axle = cg ? 1.02 : 0.97;
    const paint = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.23,
        metalness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
      chrome = mat(0xc3d1da, 0.2, 0.86),
      rubber = mat(0x1b2227, 0.88),
      black = mat(0x26323a, 0.65),
      engine = mat(0x82919a, 0.38, 0.65),
      amber = mat(0xff8f20, 0.24);
    const lampMat = new THREE.MeshStandardMaterial({
        color: 0xf4ffff,
        emissive: 0xdbf8ff,
        emissiveIntensity: 0.8,
        roughness: 0.12,
      }),
      brakeMat = new THREE.MeshStandardMaterial({
        color: 0xb71623,
        emissive: 0xff2030,
        emissiveIntensity: 0.35,
      });
    function roundBox(size, pos, material, bevel = 0.025, parent = g) {
      const [w, h, d] = size,
        shape = new THREE.Shape();
      shape.moveTo(-w / 2 + bevel, -h / 2);
      shape.lineTo(w / 2 - bevel, -h / 2);
      shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + bevel);
      shape.lineTo(w / 2, h / 2 - bevel);
      shape.quadraticCurveTo(w / 2, h / 2, w / 2 - bevel, h / 2);
      shape.lineTo(-w / 2 + bevel, h / 2);
      shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - bevel);
      shape.lineTo(-w / 2, -h / 2 + bevel);
      shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + bevel, -h / 2);
      const m = mesh(
        parent,
        new THREE.ExtrudeGeometry(shape, {
          depth: d - 2 * bevel,
          bevelEnabled: true,
          bevelSize: bevel,
          bevelThickness: bevel,
          bevelSegments: 3,
          steps: 1,
        }),
        material,
        [pos[0], pos[1], pos[2] - d / 2 + bevel],
      );
      return m;
    }
    function wheel(parent, z) {
      const spin = new THREE.Group();
      spin.position.set(0, radius + 0.04, z);
      parent.add(spin);
      const tire = mesh(
        spin,
        new THREE.TorusGeometry(radius - 0.047, 0.047, 10, 48),
        rubber,
      );
      tire.rotation.y = Math.PI / 2;
      for (const x of [-0.032, 0.032]) {
        const rim = mesh(
          spin,
          new THREE.TorusGeometry(radius - 0.08, 0.012, 6, 40),
          chrome,
          [x, 0, 0],
        );
        rim.rotation.y = Math.PI / 2;
      }
      const hub = mesh(
        spin,
        new THREE.CylinderGeometry(0.085, 0.085, 0.12, 20),
        engine,
      );
      hub.rotation.z = Math.PI / 2;
      for (let i = 0; i < 28; i++) {
        const a = (i * Math.PI * 2) / 28;
        link(
          spin,
          [
            i % 2 ? 0.035 : -0.035,
            Math.sin(a + 0.2) * 0.06,
            Math.cos(a + 0.2) * 0.06,
          ],
          [0, Math.sin(a) * (radius - 0.09), Math.cos(a) * (radius - 0.09)],
          0.0045,
          chrome,
        );
      }
      return spin;
    }
    const rear = wheel(g, axle),
      frontAssembly = new THREE.Group();
    frontAssembly.position.z = -axle;
    g.add(frontAssembly);
    const front = wheel(frontAssembly, 0);
    // Double cradle frame, swingarm, twin rear shocks and chrome fork sliders.
    for (const side of [-1, 1]) {
      link(
        g,
        [side * 0.12, 0.42, 0.98],
        [side * 0.14, 0.55, 0.08],
        0.027,
        chrome,
      );
      link(
        g,
        [side * 0.14, 0.52, 0.05],
        [side * 0.12, 1.02, -0.48],
        0.027,
        black,
      );
      link(
        g,
        [side * 0.12, 1.02, -0.48],
        [side * 0.14, 0.94, 0.8],
        0.026,
        black,
      );
      link(g, [side * 0.14, 0.94, 0.8], [side * 0.12, 0.5, 0.15], 0.022, black);
      link(
        g,
        [side * 0.16, 0.4, 0.82],
        [side * 0.16, 0.92, 0.66],
        0.025,
        chrome,
      );
      for (let i = 0; i < 9; i++) {
        const coil = mesh(
          g,
          new THREE.TorusGeometry(0.04, 0.006, 5, 12),
          chrome,
          [side * 0.16, 0.48 + i * 0.045, 0.8 - i * 0.014],
        );
        coil.rotation.x = Math.PI / 2;
      }
      link(
        frontAssembly,
        [side * 0.095, radius + 0.04, 0],
        [side * 0.095, 0.93, 0.13],
        0.023,
        chrome,
      );
      link(
        frontAssembly,
        [side * 0.095, 0.8, 0.105],
        [side * 0.095, 1.18, 0.2],
        0.031,
        black,
      );
      link(
        g,
        [side * 0.09, 0.94, 0.73],
        [side * 0.12, 0.78, 1.08],
        0.013,
        chrome,
      );
      box(g, [0.14, 0.04, 0.12], [side * 0.25, 0.46, 0.24], rubber);
    }
    const vertices = [],
      indices = [],
      rings = [
        [-0.6, 0.07, 0.075],
        [-0.52, cg ? 0.18 : 0.15, 0.13],
        [-0.39, cg ? 0.23 : 0.2, cg ? 0.17 : 0.145],
        [-0.18, cg ? 0.23 : 0.2, cg ? 0.16 : 0.14],
        [0.04, 0.14, 0.105],
        [0.11, 0.055, 0.05],
      ],
      segments = 16;
    for (const [z, width, height] of rings)
      for (let i = 0; i < segments; i++) {
        const angle = (i * Math.PI * 2) / segments;
        vertices.push(
          Math.cos(angle) * width,
          1.045 + Math.sin(angle) * height,
          z,
        );
      }
    for (let j = 0; j < rings.length - 1; j++)
      for (let i = 0; i < segments; i++) {
        const a = j * segments + i,
          n = j * segments + ((i + 1) % segments);
        indices.push(a, n, a + segments, n, n + segments, a + segments);
      }
    for (let i = 1; i < segments - 1; i++) {
      indices.push(0, i + 1, i);
      const base = (rings.length - 1) * segments;
      indices.push(base, base + i, base + i + 1);
    }
    const tankGeometry = new THREE.BufferGeometry();
    tankGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    tankGeometry.setIndex(indices);
    tankGeometry.computeVertexNormals();
    mesh(g, tankGeometry, paint);
    mesh(g, new THREE.CylinderGeometry(0.055, 0.055, 0.012, 20), chrome, [
      0,
      cg ? 1.21 : 1.19,
      -0.24,
    ]);
    roundBox([0.36, 0.13, 0.94], [0, 1.04, 0.55], rubber, 0.025);
    for (let i = 0; i < 12; i++)
      box(g, [0.32, 0.008, 0.012], [0, 1.12, 0.14 + i * 0.065], black);
    for (const side of [-1, 1]) {
      roundBox([0.065, 0.28, 0.38], [side * 0.16, 0.81, 0.27], paint, 0.02);
      link(
        g,
        [side * 0.2, 0.98, 0.75],
        [side * 0.21, 0.99, 1.1],
        0.015,
        chrome,
      );
    }
    // The CD 70 has a forward-facing horizontal cylinder; the CG 125 an upright finned cylinder.
    const crank = mesh(
      g,
      new THREE.CylinderGeometry(cg ? 0.19 : 0.145, cg ? 0.19 : 0.145, 0.3, 24),
      engine,
      [0, 0.57, 0.06],
    );
    crank.rotation.z = Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      if (cg) box(g, [0.29, 0.018, 0.25], [0, 0.66 + i * 0.034, -0.13], engine);
      else box(g, [0.27, 0.19, 0.016], [0, 0.57, -0.14 - i * 0.025], engine);
    }
    const cover = mesh(
      g,
      new THREE.CylinderGeometry(0.1, 0.1, 0.325, 20),
      chrome,
      [0, 0.57, 0.06],
    );
    cover.rotation.z = Math.PI / 2;
    link(g, [0.12, 0.45, -0.23], [0.21, 0.35, -0.1], 0.022, chrome);
    link(g, [0.21, 0.35, -0.1], [0.23, 0.36, 0.49], 0.026, chrome);
    link(g, [0.23, 0.36, 0.49], [0.23, 0.39, 1.08], cg ? 0.047 : 0.037, chrome);
    const outlet = mesh(
      g,
      new THREE.CylinderGeometry(0.029, 0.029, 0.014, 16),
      black,
      [0.23, 0.39, 1.085],
    );
    outlet.rotation.x = Math.PI / 2;
    link(g, [-0.15, 0.54, 0.12], [-0.26, 0.57, -0.02], 0.016, chrome);
    box(g, [0.07, 0.03, 0.08], [-0.27, 0.57, -0.03], rubber);
    link(g, [0.15, 0.58, 0.14], [0.23, 0.74, 0.23], 0.016, chrome);
    for (const [parent, z] of [
      [frontAssembly, 0],
      [g, axle],
    ]) {
      const f = mesh(
        parent,
        new THREE.TorusGeometry(radius + 0.06, 0.028, 8, 36, Math.PI),
        chrome,
        [0, radius + 0.04, z],
      );
      f.rotation.y = Math.PI / 2;
      f.scale.z = 2.2;
    }
    roundBox(
      [cg ? 0.3 : 0.25, cg ? 0.21 : 0.18, 0.16],
      [0, 1.08, 0.06],
      chrome,
      0.025,
      frontAssembly,
    );
    roundBox(
      [cg ? 0.25 : 0.21, cg ? 0.16 : 0.135, 0.015],
      [0, 1.08, -0.03],
      lampMat,
      0.012,
      frontAssembly,
    );
    link(frontAssembly, [-0.34, 1.29, 0.25], [0.34, 1.29, 0.25], 0.018, chrome);
    for (const side of [-1, 1]) {
      link(
        frontAssembly,
        [side * 0.31, 1.29, 0.25],
        [side * 0.43, 1.31, 0.28],
        0.023,
        rubber,
      );
      link(
        frontAssembly,
        [side * 0.3, 1.31, 0.25],
        [side * 0.34, 1.56, 0.2],
        0.009,
        chrome,
      );
      const mirror = mesh(
        frontAssembly,
        new THREE.CylinderGeometry(0.07, 0.07, 0.018, 20),
        chrome,
        [side * 0.34, 1.56, 0.18],
      );
      mirror.rotation.x = Math.PI / 2;
      link(
        frontAssembly,
        [side * 0.1, 1.07, 0.08],
        [side * 0.25, 1.05, 0.07],
        0.009,
        chrome,
      );
      roundBox(
        [0.06, 0.06, 0.06],
        [side * 0.26, 1.05, 0.07],
        amber,
        0.01,
        frontAssembly,
      );
      roundBox([0.065, 0.065, 0.06], [side * 0.2, 0.89, 1.08], amber, 0.01);
    }
    if (cg) {
      for (const side of [-1, 1]) {
        const gauge = mesh(
          frontAssembly,
          new THREE.CylinderGeometry(0.062, 0.06, 0.07, 20),
          black,
          [side * 0.08, 1.23, 0.22],
        );
        gauge.rotation.x = 0.3;
        const face = mesh(
          frontAssembly,
          new THREE.CircleGeometry(0.052, 20),
          mat(0xe8f0e6),
          [side * 0.08, 1.27, 0.21],
        );
        face.rotation.x = -Math.PI / 2 + 0.3;
      }
    } else
      roundBox([0.17, 0.07, 0.1], [0, 1.24, 0.23], black, 0.015, frontAssembly);
    roundBox([0.15, 0.085, 0.04], [0, 0.9, 1.13], brakeMat, 0.01);
    box(g, [0.16, 0.14, 0.02], [0, 0.73, 1.15], mat(0xf3f1e1));
    // Painted side badges are generated locally and shared between instances.
    const cache = window.__commuterBadges || (window.__commuterBadges = {});
    if (!cache[kind]) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 192;
      const c = canvas.getContext("2d");
      c.clearRect(0, 0, 512, 192);
      c.fillStyle = "#ffe173";
      c.beginPath();
      c.moveTo(0, 145);
      c.lineTo(300, 30);
      c.lineTo(495, 30);
      c.lineTo(180, 155);
      c.fill();
      c.fillStyle = "#ffffff";
      c.font = "bold 58px Arial";
      c.textAlign = "center";
      c.strokeStyle = "#183044";
      c.lineWidth = 6;
      c.strokeText("HONDA", 258, 91);
      c.fillText("HONDA", 258, 91);
      c.font = "bold 36px Arial";
      c.fillText(cg ? "CG 125" : "CD 70", 285, 142);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      material.userData.shared = true;
      cache[kind] = material;
    }
    for (const side of [-1, 1]) {
      const decal = mesh(g, new THREE.PlaneGeometry(0.49, 0.18), cache[kind], [
        side * (cg ? 0.234 : 0.204),
        1.045,
        -0.21,
      ]);
      decal.rotation.y = (side * Math.PI) / 2;
      decal.castShadow = false;
    }
    g.userData = {
      paint,
      frontWheel: front,
      rearWheel: rear,
      frontAssembly,
      brakeMat,
      radius,
      kind,
    };
    return g;
  }
  function bike(kind = 0, color = 0xcf3038) {
    if (kind >= 3) return commuter(kind, color);
    const g = new THREE.Group(),
      paint = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.25,
        metalness: 0.38,
        clearcoat: 1,
      }),
      rubber = mat(0x161b20, 0.95),
      metal = mat(0xa5afb6, 0.28, 0.8),
      engine = mat(0x39414a, 0.45, 0.65),
      dark = mat(0x222b31),
      glass = mat(0x406573, 0.16, 0.35),
      gold = mat(0xb89a53, 0.3, 0.7);
    const dirt = kind === 2,
      street = kind === 1,
      radius = dirt ? 0.43 : 0.38,
      axle = dirt ? 1.07 : 1.02;
    function wheel(parent, z) {
      const spin = new THREE.Group();
      spin.position.set(0, radius + 0.06, z);
      parent.add(spin);
      const tire = mesh(
        spin,
        new THREE.TorusGeometry(radius - 0.085, 0.085, 10, 32),
        rubber,
      );
      tire.rotation.y = Math.PI / 2;
      const rim = mesh(
        spin,
        new THREE.TorusGeometry(radius - 0.16, 0.025, 8, 24),
        metal,
      );
      rim.rotation.y = Math.PI / 2;
      link(spin, [-0.12, 0, 0], [0.12, 0, 0], 0.055, metal);
      for (let i = 0; i < (dirt ? 14 : 7); i++) {
        const a = (i * Math.PI * 2) / (dirt ? 14 : 7);
        link(
          spin,
          [0, 0, 0],
          [0, Math.cos(a) * (radius - 0.16), Math.sin(a) * (radius - 0.16)],
          dirt ? 0.006 : 0.014,
          metal,
        );
      }
      const disc = mesh(
        spin,
        new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 0.013, 24),
        engine,
        [0.085, 0, 0],
      );
      disc.rotation.z = Math.PI / 2;
      if (dirt)
        for (let i = 0; i < 24; i++) {
          const a = (i * Math.PI) / 12;
          const tread = box(
            spin,
            [0.145, 0.035, 0.07],
            [0, Math.cos(a) * radius, Math.sin(a) * radius],
            rubber,
          );
          tread.rotation.x = a;
        }
      return spin;
    }
    const rear = wheel(g, axle),
      frontAssembly = new THREE.Group();
    g.add(frontAssembly);
    frontAssembly.position.z = -axle;
    const front = wheel(frontAssembly, 0);
    for (const side of [-1, 1]) {
      link(
        g,
        [side * 0.12, 0.47, axle],
        [side * 0.18, 0.7, 0.12],
        0.045,
        metal,
      );
      link(
        g,
        [side * 0.17, 0.69, 0.25],
        [side * 0.16, 1.12, -0.6],
        0.045,
        engine,
      );
      link(
        g,
        [side * 0.16, 1.12, -0.6],
        [side * 0.16, 1.05, 0.62],
        0.04,
        engine,
      );
      link(
        frontAssembly,
        [side * 0.11, radius + 0.06, 0],
        [side * 0.11, 1.25, 0.22],
        0.032,
        gold,
      );
      link(g, [side * 0.18, 0.58, 0.5], [side * 0.18, 0.96, 0.68], 0.035, gold);
      box(g, [0.12, 0.055, 0.25], [side * 0.3, 0.5, 0.35], rubber);
    }
    ellipsoid(g, [0.24, 0.26, 0.3], [0, 0.7, 0.1], engine);
    for (let y = 0.55; y < 0.89; y += 0.055)
      box(g, [0.46, 0.023, 0.37], [0, y, 0.06], metal);
    const tank = ellipsoid(g, [0.29, 0.23, 0.43], [0, 1.08, -0.17], paint);
    tank.rotation.x = 0.1;
    const cap = mesh(
      g,
      new THREE.CylinderGeometry(0.07, 0.07, 0.012, 16),
      metal,
      [0, 1.31, -0.12],
    );
    ellipsoid(g, [0.25, 0.09, 0.44], [0, 1.1, 0.49], rubber);
    ellipsoid(g, [0.22, 0.12, 0.37], [0, 1.08, 0.87], paint);
    if (!street) {
      for (const side of [-1, 1]) {
        const fair = ellipsoid(
          g,
          [0.105, dirt ? 0.16 : 0.32, dirt ? 0.33 : 0.47],
          [side * 0.23, 0.9, -0.47],
          paint,
        );
        fair.rotation.x = -0.35;
        box(g, [0.015, 0.05, 0.25], [side * 0.335, 0.85, -0.46], dark);
      }
    }
    const nose = ellipsoid(
      frontAssembly,
      [street ? 0.22 : 0.28, street ? 0.17 : 0.24, 0.22],
      [0, 1.18, 0.02],
      paint,
    );
    if (!dirt) {
      const windshield = ellipsoid(
        frontAssembly,
        [0.22, 0.22, 0.025],
        [0, 1.48, 0.09],
        glass,
      );
      windshield.rotation.x = -0.35;
    }
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xfff4db,
      emissive: 0xffedc7,
      emissiveIntensity: 1.3,
    });
    ellipsoid(frontAssembly, [0.17, 0.055, 0.025], [0, 1.2, -0.18], lampMat);
    const brakeMat = new THREE.MeshStandardMaterial({
      color: 0xa51c2b,
      emissive: 0xff2233,
      emissiveIntensity: 0.35,
    });
    box(g, [0.25, 0.05, 0.035], [0, 1.05, 1.23], brakeMat);
    const fender = ellipsoid(
      frontAssembly,
      [0.12, 0.07, 0.34],
      [0, dirt ? 1.04 : 0.92, -0.03],
      paint,
    );
    link(frontAssembly, [-0.42, 1.3, 0.27], [0.42, 1.3, 0.27], 0.024, metal);
    for (const side of [-1, 1]) {
      link(
        frontAssembly,
        [side * 0.3, 1.3, 0.27],
        [side * 0.44, 1.3, 0.27],
        0.035,
        rubber,
      );
      if (!dirt) {
        link(
          frontAssembly,
          [side * 0.27, 1.34, 0.22],
          [side * 0.43, 1.57, 0.09],
          0.014,
          metal,
        );
        ellipsoid(
          frontAssembly,
          [0.09, 0.055, 0.025],
          [side * 0.43, 1.57, 0.07],
          glass,
        );
      }
    }
    link(g, [0.27, 0.58, -0.3], [0.32, 0.42, 0.35], 0.038, metal);
    link(g, [0.32, 0.42, 0.35], [0.37, 0.65, 0.98], 0.075, metal, 0.06);
    box(g, [0.18, 0.14, 0.015], [0, 0.78, 1.23], mat(0xe5e7db));
    g.userData = {
      paint,
      frontWheel: front,
      rearWheel: rear,
      frontAssembly,
      brakeMat,
      radius,
      kind,
    };
    return g;
  }
  function rider(primary = 0xd43b42, secondary = 0x27394b, kind = 0) {
    const g = new THREE.Group(),
      suit = mat(primary, 0.88),
      trim = mat(secondary, 0.8),
      armor = mat(0x242a31, 0.65),
      gloves = mat(0x161b20, 0.9),
      helmet = mat(primary, 0.26, 0.3),
      visor = mat(0x152e40, 0.11, 0.55);
    const upright = kind >= 3 ? 0.07 : kind === 2 ? 0.1 : kind === 1 ? 0.04 : 0,
      torso = new THREE.Group();
    g.add(torso);
    ellipsoid(
      torso,
      [0.235, 0.34, 0.15],
      [0, 1.51 + upright, 0.19],
      suit,
    ).rotation.x = -0.3;
    ellipsoid(torso, [0.2, 0.09, 0.14], [0, 1.16, 0.38], trim);
    ellipsoid(
      torso,
      [0.15, 0.24, 0.035],
      [0, 1.53 + upright, 0.35],
      armor,
    ).rotation.x = -0.3;
    const head = new THREE.Group();
    head.position.set(0, 1.98 + upright, -0.06);
    head.rotation.x = -0.08;
    torso.add(head);
    ellipsoid(head, [0.23, 0.265, 0.24], [0, 0, 0], helmet);
    mesh(
      head,
      new THREE.SphereGeometry(
        0.245,
        24,
        12,
        Math.PI + 0.25,
        Math.PI - 0.5,
        0.67,
        0.68,
      ),
      visor,
    );
    ellipsoid(head, [0.17, 0.07, 0.11], [0, -0.15, -0.15], helmet);
    box(head, [0.1, 0.015, 0.018], [0, -0.13, -0.252], armor);
    const arms = [];
    for (const side of [-1, 1]) {
      const shoulder = [side * 0.23, 1.74 + upright, 0.08],
        elbow = [side * 0.36, 1.45, -0.22],
        hand = [side * 0.4, 1.3, -0.75];
      arms.push({
        side,
        upper: link(torso, shoulder, elbow, 0.075, suit, 0.085),
        lower: link(torso, elbow, hand, 0.06, trim, 0.072),
        hand: ellipsoid(torso, [0.065, 0.055, 0.08], hand, gloves),
        shoulder,
        elbow,
        grip: hand,
      });
      ellipsoid(torso, [0.09, 0.09, 0.1], shoulder, armor);
      const hip = [side * 0.18, 1.17, 0.38],
        knee = [side * 0.32, 0.84, -0.05],
        ankle = [side * 0.31, 0.52, 0.33];
      link(g, hip, knee, 0.09, trim, 0.105);
      link(g, knee, ankle, 0.075, suit, 0.09);
      ellipsoid(g, [0.075, 0.11, 0.085], knee, armor);
      ellipsoid(g, [0.08, 0.09, 0.17], [side * 0.31, 0.48, 0.24], gloves);
    }
    g.userData = { torso, head, arms };
    return g;
  }
  function poseRider(g, steer) {
    for (const arm of g.userData.arms) {
      const a = new THREE.Vector3(...arm.elbow),
        b = new THREE.Vector3(...arm.grip);
      b.x += steer * 0.07;
      b.z -= arm.side * steer * 0.08;
      arm.hand.position.copy(b);
      arm.lower.position.copy(a).lerp(b, 0.5);
      arm.lower.scale.y =
        a.distanceTo(b) /
        new THREE.Vector3(...arm.elbow).distanceTo(
          new THREE.Vector3(...arm.grip),
        );
      arm.lower.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        b.sub(a).normalize(),
      );
    }
  }
  function dispose(group) {
    const geos = new Set(),
      mats = new Set();
    group.traverse((o) => {
      if (o.geometry) geos.add(o.geometry);
      if (o.material) mats.add(o.material);
    });
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    group.removeFromParent();
  }
  return { bike, rider, poseRider, dispose };
};
