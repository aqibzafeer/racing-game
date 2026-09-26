import * as THREE from "three";
import createRoadAssets from "./realism.js";
import createCarWorld from "./car-world.js";
import createCarWeather from "./car-weather.js";
import createBikeAssets from "./bike-assets.js";
import createDetailedCar from "./vehicle-assets.js";

export function startGame() {
  let disposed = false,
    frameId = 0;
  const events = new AbortController();
  function listen(target, type, handler, options = {}) {
    target.addEventListener(
      type,
      handler,
      typeof options === "boolean"
        ? { capture: options, signal: events.signal }
        : { ...options, signal: events.signal },
    );
  }

  let isBike = false;
  const bikeAssets = createBikeAssets(THREE);
  const riderSuits = [
    [0xd83740, 0x273e59],
    [0x236aba, 0xd8b456],
    [0x30363f, 0x857292],
  ];

  const $ = (s) => document.querySelector(s),
    assets = createRoadAssets(THREE);
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(
      60,
      innerWidth / innerHeight,
      0.08,
      900,
    );
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  $("#game").append(renderer.domElement);
  scene.fog = new THREE.Fog(0x93b8c5, 110, 370);
  const hemi = new THREE.HemisphereLight(0xc5e5f2, 0x455545, 2),
    sun = new THREE.DirectionalLight(0xffecc8, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -45,
    right: 45,
    top: 55,
    bottom: -55,
    near: 1,
    far: 180,
  });
  sun.shadow.normalBias = 0.02;
  scene.add(hemi, sun, sun.target);
  // A procedural sky environment gives clear-coated paint actual reflections, without downloaded models.
  const envCanvas = document.createElement("canvas");
  envCanvas.width = 512;
  envCanvas.height = 256;
  const ec = envCanvas.getContext("2d"),
    sky = ec.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, "#52758e");
  sky.addColorStop(0.47, "#e9f2f4");
  sky.addColorStop(0.51, "#879488");
  sky.addColorStop(1, "#263533");
  ec.fillStyle = sky;
  ec.fillRect(0, 0, 512, 256);
  ec.fillStyle = "#ffffff";
  ec.fillRect(80, 42, 110, 15);
  ec.fillRect(340, 64, 70, 20);
  const envTexture = new THREE.CanvasTexture(envCanvas);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  envTexture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer),
    environment = pmrem.fromEquirectangular(envTexture);
  scene.environment = environment.texture;
  envTexture.dispose();
  pmrem.dispose();
  const material = (color, roughness = 0.8, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.userData.shared = true;
    return m;
  };
  const concrete = material(0x9d9e96),
    railMat = material(0x98a6aa, 0.35, 0.65),
    white = material(0xe5e4d8),
    yellow = material(0xd8bc65),
    bark = material(0x695140),
    leaf = material(0x489b4c),
    sandRock = material(0xd6a367),
    dark = material(0x141c24, 0.45),
    metal = material(0x9fa9b0, 0.24, 0.75);
  const unit = new THREE.BoxGeometry(1, 1, 1);
  unit.userData.shared = true;
  function box(group, size, pos, mat = dark) {
    const m = new THREE.Mesh(unit, mat);
    m.scale.set(...size);
    m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  }
  const preferences = { sound: true, quality: "high", riderPreview: false };
  const settings = {
    car: 0,
    rider: 0,
    color: "#c92936",
    mode: "free",
    road: "country",
    weather: "sunny",
  };
  const vehicleCatalogue = [
    {
      id: "sport",
      name: "Sport Coupe",
      type: "car",
      kind: "sport",
      speed: 28,
      acceleration: 10,
      handling: 1.15,
      description: "Sculpted coupe / LED lighting / performance wheels",
    },
    {
      id: "sedan",
      name: "Touring Sedan",
      type: "car",
      kind: "sedan",
      speed: 26,
      acceleration: 8,
      handling: 1.05,
      description: "Four doors / panoramic glass / refined touring",
    },
    {
      id: "suv",
      name: "Adventure SUV",
      type: "car",
      kind: "suv",
      speed: 24,
      acceleration: 7,
      handling: 0.95,
      description: "Roof rails / all-terrain tires / elevated stance",
    },
    {
      id: "van",
      name: "Delivery Van",
      type: "car",
      kind: "van",
      speed: 22,
      acceleration: 6,
      handling: 0.85,
      description: "Cargo body / wide mirrors / utility explorer",
    },
    {
      id: "sport-bike",
      name: "Sport Bike",
      type: "bike",
      kind: 0,
      speed: 27,
      acceleration: 8,
      handling: 1.35,
      description: "Full fairing / rear monoshock / racing posture",
    },
    {
      id: "street-bike",
      name: "Street Bike",
      type: "bike",
      kind: 1,
      speed: 25,
      acceleration: 7.5,
      handling: 1.45,
      description: "Exposed engine / road tires / upright posture",
    },
    {
      id: "dirt-bike",
      name: "Dirt Bike",
      type: "bike",
      kind: 2,
      speed: 23,
      acceleration: 7,
      handling: 1.5,
      description: "Knobby tires / high fender / enduro suspension",
    },
    {
      id: "supercar",
      name: "Apex Supercar",
      type: "car",
      kind: "supercar",
      speed: 34,
      acceleration: 12,
      handling: 1.2,
      description: "Low cockpit / sculpted intakes / rear diffuser",
    },
    {
      id: "rally",
      name: "Rally Hatch",
      type: "car",
      kind: "rally",
      speed: 27,
      acceleration: 10.5,
      handling: 1.3,
      description: "Compact hatch / auxiliary lights / rally wheels",
    },
    {
      id: "muscle",
      name: "Heritage V8",
      type: "car",
      kind: "muscle",
      speed: 31,
      acceleration: 9,
      handling: 1,
      description: "Long hood / twin stripes / classic round lamps",
    },
    {
      id: "honda-cd70",
      name: "Honda CD 70",
      type: "bike",
      kind: 3,
      speed: 21,
      acceleration: 5.5,
      handling: 1.4,
      description:
        "Commuter recreation / horizontal engine / wire-spoke wheels",
    },
    {
      id: "honda-cg125",
      name: "Honda CG 125",
      type: "bike",
      kind: 4,
      speed: 28,
      acceleration: 8.5,
      handling: 1.3,
      description: "Commuter recreation / upright engine / chrome exhaust",
    },
  ];
  const carTypes = vehicleCatalogue
      .filter((v) => v.type === "car")
      .map((v) => v.kind),
    carNames = vehicleCatalogue.map((v) => v.name);
  const specs = vehicleCatalogue.map((v) => v.description);
  const roadNames = {
    country: "COUNTRYSIDE",
    desert: "DESERT HIGHWAY",
    suburbs: "SUBURBAN AVENUE",
    city: "CITY BOULEVARD",
    mountains: "MOUNTAIN PASS",
    forest: "FOREST TRAIL",
    canyon: "RED ROCK CANYON",
  };
  const roadProfiles = {
    country: [
      [21, 165],
      [8, 67],
    ],
    desert: [[8, 270]],
    suburbs: [
      [10, 210],
      [3, 80],
    ],
    city: [[4, 260]],
    mountains: [
      [29, 145],
      [9, 64],
    ],
    forest: [
      [17, 130],
      [5, 55],
    ],
    canyon: [
      [22, 185],
      [7, 75],
    ],
  };
  const worldDetail = createCarWorld(THREE, box, material);
  const orbit = { pitch: 0.32, zoom: 1, auto: true, pointers: new Map() };
  const heldKeys = new Set(),
    heldPointers = new Map();
  let cameraNames = isBike
    ? [
        "Chase",
        "Close follow",
        "Helmet view",
        "Front road",
        "Cinematic side",
        "Overhead",
        "Rear raised",
        "Rear high",
        "Rear birdseye",
      ]
    : [
        "Chase",
        "Close follow",
        "Driver / road only",
        "Hood",
        "Cinematic side",
        "Overhead",
        "Rear raised",
        "Rear high",
        "Rear birdseye",
      ];
  const vehiclePerformance = vehicleCatalogue.map(
    ({ speed, acceleration, handling }) => ({ speed, acceleration, handling }),
  );
  const input = {
    accel: false,
    brake: false,
    left: false,
    right: false,
    reverse: false,
    turbo: false,
  };
  let countdown = 0,
    turboCharge = 100;
  let state = "lobby",
    speed = 0,
    steer = 0,
    distance = 0,
    tripDistance = 0,
    recoverySpeed = 0,
    lateral = 0,
    elapsed = 0,
    ghostTime = 0,
    blockedTime = 0,
    autoDrive = false,
    cameraMode = 0,
    lobbyAngle = -2.35,
    noticeTime = 0;
  const player = new THREE.Group();
  scene.add(player);
  function sculptedBody(width, length, paint) {
    const profiles = [
      [-1, 0.82, 0.76],
      [-0.88, 0.94, 0.92],
      [-0.62, 1, 1.02],
      [-0.28, 1, 1.04],
      [0.05, 1, 1.01],
      [0.42, 0.99, 0.99],
      [0.75, 0.97, 0.99],
      [0.94, 0.89, 0.89],
      [1, 0.84, 0.78],
    ];
    const vertices = [],
      indices = [],
      ring = 10;
    for (const [z, spread, top] of profiles) {
      const w = width * spread;
      for (const [x, y] of [
        [-0.84, 0.46],
        [-0.98, 0.53],
        [-1, 0.75],
        [-0.94, top - 0.07],
        [-0.78, top],
        [0.78, top],
        [0.94, top - 0.07],
        [1, 0.75],
        [0.98, 0.53],
        [0.84, 0.46],
      ])
        vertices.push(x * w, y, z * length);
    }
    for (let i = 0; i < profiles.length - 1; i++)
      for (let j = 0; j < ring; j++) {
        const a = i * ring + j,
          b = i * ring + ((j + 1) % ring),
          c = a + ring,
          d = b + ring;
        indices.push(a, c, b, b, c, d);
      }
    for (let j = 1; j < ring - 1; j++) {
      indices.push(0, j, j + 1);
      const b = (profiles.length - 1) * ring;
      indices.push(b, b + j + 1, b + j);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, paint);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
  // Merge static parts by material; animated wheel groups stay independent.
  function mergeParts(root, excluded = new Set()) {
    root.updateMatrixWorld(true);
    const inverse = root.matrixWorld.clone().invert(),
      buckets = new Map();
    root.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      for (let p = o.parent; p && p !== root; p = p.parent)
        if (excluded.has(p)) return;
      if (!buckets.has(o.material)) buckets.set(o.material, []);
      buckets.get(o.material).push(o);
    });
    for (const [mat, parts] of buckets) {
      if (parts.length < 2) continue;
      const p = [],
        n = [],
        uv = [],
        indices = [],
        oldGeo = new Set();
      let offset = 0;
      for (const part of parts) {
        const matrix = new THREE.Matrix4().multiplyMatrices(
            inverse,
            part.matrixWorld,
          ),
          normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix),
          a = part.geometry.attributes,
          v = new THREE.Vector3();
        for (let i = 0; i < a.position.count; i++) {
          v.fromBufferAttribute(a.position, i).applyMatrix4(matrix);
          p.push(v.x, v.y, v.z);
          v.fromBufferAttribute(a.normal, i)
            .applyMatrix3(normalMatrix)
            .normalize();
          n.push(v.x, v.y, v.z);
          uv.push(a.uv ? a.uv.getX(i) : 0, a.uv ? a.uv.getY(i) : 0);
        }
        if (part.geometry.index)
          for (const i of part.geometry.index.array) indices.push(offset + i);
        else
          for (let i = 0; i < a.position.count; i++) indices.push(offset + i);
        offset += a.position.count;
        if (!part.geometry.userData.shared) oldGeo.add(part.geometry);
        part.removeFromParent();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
      geo.setAttribute("normal", new THREE.Float32BufferAttribute(n, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(indices);
      geo.computeBoundingSphere();
      const combined = new THREE.Mesh(geo, mat);
      combined.castShadow = true;
      combined.receiveShadow = true;
      root.add(combined);
      oldGeo.forEach((g) => g.dispose());
    }
  }
  function seatVehicle(model) {
    model.position.y = -new THREE.Box3().setFromObject(model).min.y;
    const root = new THREE.Group();
    root.add(model);
    root.userData = model.userData;
    return root;
  }
  function makeCar(kind, color) {
    const g = createDetailedCar(THREE, kind, color);
    mergeParts(g, new Set([...g.userData.wheels, ...g.userData.frontWheels]));
    for (const wheel of g.userData.wheels) mergeParts(wheel);
    return seatVehicle(g);
  }
  function makeMotorcycle(type, color, riderIndex = 0) {
    const group = new THREE.Group(),
      motorcycle = bikeAssets.bike(type, color),
      suit = riderSuits[riderIndex],
      rider = bikeAssets.rider(suit[0], suit[1], type);
    group.add(motorcycle, rider);
    const parts = motorcycle.userData;
    mergeParts(motorcycle, new Set([parts.frontAssembly, parts.rearWheel]));
    mergeParts(parts.frontAssembly, new Set([parts.frontWheel]));
    mergeParts(parts.frontWheel);
    mergeParts(parts.rearWheel);
    group.userData = {
      motorcycle,
      rider,
      paint: motorcycle.userData.paint,
      halfWidth: 0.48,
      halfLength: type === 2 ? 1.5 : 1.42,
    };
    return seatVehicle(group);
  }
  function animateMotorcycle(group, velocity, turn, braking, dt) {
    const { motorcycle, rider } = group.userData,
      data = motorcycle.userData;
    data.frontAssembly.rotation.y = turn * 0.22;
    data.frontWheel.rotation.x -= (velocity * dt) / data.radius;
    data.rearWheel.rotation.x -= (velocity * dt) / data.radius;
    data.brakeMat.emissiveIntensity = braking ? 3 : 0.35;
    bikeAssets.poseRider(rider, turn);
  }
  function makePlayer() {
    const vehicle = vehicleCatalogue[settings.car];
    if (vehicle.type === "car") return makeCar(vehicle.kind, settings.color);
    return makeMotorcycle(vehicle.kind, settings.color, settings.rider);
  }
  function animatePlayer(dt) {
    if (!isBike) {
      assets.animateCar(playerCar, speed, -steer, input.brake, dt);
      return;
    }
    animateMotorcycle(playerCar, speed, steer, input.brake, dt);
  }
  let playerCar = makePlayer();
  player.add(playerCar);
  const headlights = new THREE.Group();
  player.add(headlights);
  for (const side of isBike ? [0] : [-1, 1]) {
    const light = new THREE.SpotLight(0xe8f3ff, 85, 75, 0.5, 0.65, 1);
    light.position.set(
      side * 0.65,
      isBike ? 1.15 : 0.95,
      -(playerCar.userData.halfLength + 0.06),
    );
    light.target.position.set(side * 0.65, 0.2, -30);
    headlights.add(light, light.target);
  }
  // Reuse a fixed light budget as roads and traffic stream past.
  const roadLights = Array.from({ length: 4 }, () => {
    const light = new THREE.SpotLight(0xffd99a, 95, 30, 1.05, 0.7, 1);
    light.intensity = 0;
    scene.add(light, light.target);
    return light;
  });
  const trafficLights = Array.from({ length: 2 }, () => {
    const light = new THREE.SpotLight(0xe8f3ff, 0, 55, 0.48, 0.7, 1);
    scene.add(light, light.target);
    return light;
  });
  function updateRoadLights() {
    const darkWeather =
      settings.weather === "night" || settings.weather === "rain";
    if (!darkWeather) {
      for (const light of [...roadLights, ...trafficLights])
        light.intensity = 0;
      return;
    }
    const nearby = [];
    for (const chunk of chunks.values())
      for (const lamp of chunk.userData.streetLamps || []) {
        const position = lamp.localToWorld(new THREE.Vector3(1.45, 6.1, 0));
        nearby.push({
          position,
          distance: position.distanceTo(player.position),
        });
      }
    nearby.sort((a, b) => a.distance - b.distance);
    roadLights.forEach((light, i) => {
      const lamp = nearby[i];
      light.intensity = lamp
        ? 95 * THREE.MathUtils.clamp((95 - lamp.distance) / 30, 0, 1)
        : 0;
      if (!lamp) return;
      light.position.copy(lamp.position);
      // Aim inward from the lamp arm to cast a broad pool across the driving lane.
      const d = -lamp.position.z,
        center = point(d);
      light.target.position.set(
        THREE.MathUtils.lerp(lamp.position.x, center.x, 0.5),
        roadHeight(d) + 0.05,
        lamp.position.z,
      );
    });
    const traffic = actors
      .map((a) => ({
        a,
        distance: a.mesh.position.distanceTo(player.position),
      }))
      .sort((a, b) => a.distance - b.distance);
    trafficLights.forEach((light, i) => {
      const entry = traffic[i];
      light.intensity = entry
        ? 55 * THREE.MathUtils.clamp((80 - entry.distance) / 25, 0, 1)
        : 0;
      if (!entry) return;
      const mesh = entry.a.mesh;
      light.position.copy(
        mesh.localToWorld(
          new THREE.Vector3(0, 0.85, -(mesh.userData.halfLength || 2.2)),
        ),
      );
      light.target.position.copy(
        mesh.localToWorld(new THREE.Vector3(0, 0.05, -24)),
      );
    });
  }
  function rebuildCar() {
    isBike = vehicleCatalogue[settings.car].type === "bike";
    cameraNames = [
      "Chase",
      "Close follow",
      isBike ? "Helmet view" : "Driver / road only",
      isBike ? "Front road" : "Hood",
      "Cinematic side",
      "Overhead",
      "Rear raised",
      "Rear high",
      "Rear birdseye",
    ];
    assets.dispose(playerCar);
    playerCar = makePlayer();
    player.add(playerCar);
    headlights.children
      .filter((o) => o.isSpotLight)
      .forEach((light, i) => {
        light.visible = !isBike || i === 0;
        light.position.set(
          isBike ? 0 : i === 0 ? -0.65 : 0.65,
          isBike ? 1.15 : 0.95,
          -(playerCar.userData.halfLength + 0.06),
        );
        light.target.position.x = isBike ? 0 : i === 0 ? -0.65 : 0.65;
      });
    $("#carName").textContent = carNames[settings.car];
    $("#carSpec").textContent = specs[settings.car];
    document.dispatchEvent(new Event("vehiclechange"));
  }
  function setPaint(color, label) {
    settings.color = color;
    playerCar.userData.paint.color.set(color);
    $("#paintName").textContent = label;
    $("#customColor").value = color;
    document.querySelectorAll("[data-color]").forEach((b) => {
      b.classList.toggle("active", b.dataset.color === color);
      b.setAttribute("aria-pressed", String(b.dataset.color === color));
    });
  }
  const groundMat = material(0x7b9165),
    ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1800, 160, 160),
      groundMat,
    );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(5.4, 5.7, 0.25, 80),
    material(0x526475, 0.32, 0.38),
  );
  platform.position.y = -0.12;
  platform.receiveShadow = true;
  platform.visible = false;
  const platformRing = new THREE.Mesh(
    new THREE.TorusGeometry(5.3, 0.022, 6, 90),
    new THREE.MeshBasicMaterial({ color: 0x16bdff }),
  );
  platformRing.rotation.x = Math.PI / 2;
  platformRing.position.y = 0.02;
  platformRing.visible = false;
  scene.add(platform, platformRing);
  const chunks = new Map(),
    actors = [];
  const CHUNK = 100;
  function roadX(d) {
    return roadProfiles[settings.road].reduce(
      (x, [a, w]) => x + a * Math.sin(d / w),
      0,
    );
  }
  function slope(d) {
    return roadProfiles[settings.road].reduce(
      (x, [a, w]) => x + (a / w) * Math.cos(d / w),
      0,
    );
  }
  function roadHeight(d) {
    return settings.road === "mountains"
      ? 5 * Math.sin(d / 160) + 3 * Math.sin(d / 75)
      : 0;
  }
  let terrainRoad = "",
    terrainZ = Infinity,
    terrainX = Infinity;
  function updateTerrain() {
    if (
      terrainRoad === settings.road &&
      Math.abs(player.position.z - terrainZ) < 20 &&
      Math.abs(player.position.x - terrainX) < 20
    )
      return;
    terrainRoad = settings.road;
    terrainZ = player.position.z;
    terrainX = player.position.x;
    ground.position.set(player.position.x, -0.015, player.position.z - 100);
    const a = ground.geometry.attributes.position;
    for (let i = 0; i < a.count; i++)
      a.setZ(i, roadHeight(-(ground.position.z - a.getY(i))));
    a.needsUpdate = true;
    ground.geometry.computeVertexNormals();
    ground.geometry.computeBoundingSphere();
  }
  function elevateChunk(g) {
    if (settings.road !== "mountains") return;
    for (const o of g.children) {
      if (
        o.geometry &&
        o.geometry.type === "BufferGeometry" &&
        o.position.lengthSq() === 0
      ) {
        const a = o.geometry.attributes.position;
        for (let i = 0; i < a.count; i++)
          a.setY(i, a.getY(i) + roadHeight(-a.getZ(i)));
        a.needsUpdate = true;
        o.geometry.computeVertexNormals();
        o.geometry.computeBoundingSphere();
      } else o.position.y += roadHeight(-o.position.z);
    }
  }
  function point(d) {
    return new THREE.Vector3(roadX(d), 0.05, -d);
  }
  function tangent(d) {
    return new THREE.Vector3(slope(d), 0, -1).normalize();
  }
  function roadFrame(d, lane = 0) {
    const p = point(d),
      t = tangent(d);
    return p.addScaledVector(new THREE.Vector3(-t.z, 0, t.x), lane);
  }
  function trackPlayer() {
    let d = -player.position.z;
    for (let i = 0; i < 4; i++) {
      const delta = player.position.clone().sub(point(d));
      d += delta.dot(tangent(d)) / Math.sqrt(1 + slope(d) ** 2);
    }
    distance = d;
    const t = tangent(d);
    lateral = player.position
      .clone()
      .sub(point(d))
      .dot(new THREE.Vector3(-t.z, 0, t.x));
  }
  function batchLocal(group) {
    group.updateMatrixWorld(true);
    const buckets = new Map(),
      inverse = group.matrixWorld.clone().invert();
    group.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || !o.geometry.userData.shared) return;
      const key = o.material.uuid + "/" + o.geometry.uuid;
      if (!buckets.has(key))
        buckets.set(key, {
          material: o.material,
          geometry: o.geometry,
          meshes: [],
        });
      buckets.get(key).meshes.push(o);
    });
    for (const { material, geometry, meshes } of buckets.values()) {
      const b = new THREE.InstancedMesh(geometry, material, meshes.length);
      meshes.forEach((o, i) => {
        b.setMatrixAt(
          i,
          new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld),
        );
        o.removeFromParent();
      });
      b.castShadow = true;
      b.receiveShadow = true;
      group.add(b);
    }
  }
  const crownGeometry = new THREE.IcosahedronGeometry(1, 1),
    rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  crownGeometry.userData.shared = rockGeometry.userData.shared = true;
  function buildChunk(index) {
    const g = new THREE.Group(),
      from = index * CHUNK,
      to = from + CHUNK;
    g.userData.barriers = 0;
    assets.roadside(g, point, tangent, from, to, index);
    if (
      ["desert", "mountains", "forest", "canyon", "city"].includes(
        settings.road,
      )
    ) {
      for (const h of g.userData.houses || []) assets.dispose(h);
      g.userData.houses = [];
    }
    if (settings.road === "suburbs")
      for (const side of [-1, 1]) {
        const h = assets.house(Math.abs(index + 3));
        h.position.copy(roadFrame(from + 12, side * 26));
        h.position.y = 0;
        const n = tangent(from + 12);
        h.rotation.y = Math.atan2(-n.z * side, n.x * side);
        g.add(h);
        g.userData.houses.push(h);
      }
    for (let d = from; d < to; d += 10) {
      const dash = box(g, [0.16, 0.025, 4], [0, 0, 0], yellow);
      dash.position.copy(point(d + 2));
      dash.position.y = 0.068;
      const t = tangent(d + 2);
      dash.rotation.y = Math.atan2(-t.x, -t.z);
    }
    if (settings.mode !== "roam")
      for (let d = from; d < to; d += 5)
        for (const side of [-1, 1]) {
          const t = tangent(d + 2.5),
            p = roadFrame(d + 2.5, side * 10.6),
            rail = box(g, [0.16, 0.35, 5.12], [p.x, 0.85, p.z], railMat);
          rail.rotation.y = Math.atan2(-t.x, -t.z);
          box(g, [0.12, 0.95, 0.15], [p.x, 0.48, p.z], railMat);
          g.userData.barriers++;
        }
    if (["suburbs", "city"].includes(settings.road) && index % 3 === 0)
      for (let x = -8; x <= 8; x += 1.4) {
        const p = roadFrame(from + 72, x);
        const m = box(g, [0.7, 0.02, 3], [p.x, 0.07, p.z], white);
        m.rotation.y = Math.atan2(-tangent(from + 72).x, -tangent(from + 72).z);
      }
    for (let i = 0; i < 14; i++) {
      const seed = Math.abs(Math.sin(index * 71 + i * 17.83)),
        side = i % 2 ? 1 : -1,
        d = from + i * 7,
        p = roadFrame(d, side * (34 + seed * 110));
      if (settings.road === "desert") {
        const rock = new THREE.Mesh(rockGeometry, sandRock);
        rock.position.set(p.x, 0.45, p.z);
        rock.scale.setScalar(1 + seed * 2);
        rock.scale.y *= 0.55;
        rock.castShadow = true;
        g.add(rock);
      } else {
        box(g, [0.28, 2.6, 0.28], [p.x, 1.3, p.z], bark);
        const crown = new THREE.Mesh(crownGeometry, leaf);
        crown.position.set(p.x, 3.4, p.z);
        crown.scale.setScalar(1.5 + seed);
        crown.scale.y *= 1.25;
        crown.castShadow = true;
        g.add(crown);
      }
    }
    worldDetail.decorate(g, index, settings.road, point, roadFrame);
    elevateChunk(g);
    assets.batchBoxes(g);
    batchLocal(g);
    scene.add(g);
    chunks.set(index, g);
  }
  function streamRoad() {
    const index = Math.floor(distance / CHUNK);
    for (const [key, g] of chunks)
      if (key < index - 3 || key > index + 5) {
        assets.dispose(g);
        chunks.delete(key);
      }
    for (let key = index - 3; key <= index + 5; key++)
      if (!chunks.has(key)) buildChunk(key);
    updateTerrain();
  }
  let lobbyPreviewKey = "";
  function updateLobbyPreview() {
    if (state !== "lobby") return;
    const key = settings.road + "/" + settings.weather + "/" + settings.mode;
    if (key === lobbyPreviewKey && chunks.size) return;
    const rebuild =
      lobbyPreviewKey.split("/")[0] !== settings.road ||
      lobbyPreviewKey.split("/")[2] !== settings.mode ||
      !chunks.size;
    if (rebuild) {
      clearWorld();
      distance = 0;
      terrainRoad = "";
      terrainZ = terrainX = Infinity;
      player.position.set(0, 0.055, 0);
      streamRoad();
    }
    applyWeather();
    updateWeather(0);
    lobbyPreviewKey = key;
  }
  function clearWorld() {
    lobbyPreviewKey = "";
    chunks.forEach((g) => assets.dispose(g));
    chunks.clear();
    actors.forEach((a) => assets.dispose(a.mesh));
    actors.length = 0;
  }
  function syncActor(a) {
    a.mesh.position.copy(roadFrame(a.d, a.lane));
    a.mesh.position.y += roadHeight(-a.mesh.position.z);
    const t = tangent(a.d);
    a.mesh.rotation.y = Math.atan2(-t.x, -t.z) + (a.dir < 0 ? Math.PI : 0);
  }
  function spawnActors() {
    const race = settings.mode === "race",
      colors = ["#3a77b5", "#dcb14c", "#dadcdb", "#3a594b", "#736b91"];
    for (let i = 0; i < (race ? 4 : 16); i++) {
      const a = {
        mesh:
          race && isBike
            ? makeMotorcycle(
                (i + vehicleCatalogue[settings.car].kind) % 5,
                colors[i % 5],
                i % 3,
              )
            : makeCar(
                carTypes[(i + settings.car) % carTypes.length],
                colors[i % 5],
              ),
        name: ["Atlas", "Nova", "Blaze", "Vega"][i % 4],
        d: race ? 8 + Math.floor(i / 2) * 9 : 32 + i * 28,
        lane: race ? (i % 2 ? 5.8 : 1.9) : i % 2 ? -3.8 : 3.8,
        dir: race ? 1 : i % 2 ? -1 : 1,
        speed: 0,
        cruise: race
          ? vehiclePerformance[settings.car].speed * 0.72 + i * 0.5
          : 9 + (i % 4) * 1.8,
      };
      if (!race) a.d += distance;
      a.startD = a.d;
      scene.add(a.mesh);
      syncActor(a);
      actors.push(a);
    }
  }
  // Separating-axis test for oriented car rectangles, including their full length.
  function overlaps(a, aw, al, b, bw, bl) {
    const pa = a.getWorldPosition(new THREE.Vector3()),
      pb = b.getWorldPosition(new THREE.Vector3()),
      aa = new THREE.Euler().setFromQuaternion(
        a.getWorldQuaternion(new THREE.Quaternion()),
        "YXZ",
      ).y,
      ba = new THREE.Euler().setFromQuaternion(
        b.getWorldQuaternion(new THREE.Quaternion()),
        "YXZ",
      ).y,
      axes = [
        new THREE.Vector2(Math.cos(aa), -Math.sin(aa)),
        new THREE.Vector2(Math.sin(aa), Math.cos(aa)),
        new THREE.Vector2(Math.cos(ba), -Math.sin(ba)),
        new THREE.Vector2(Math.sin(ba), Math.cos(ba)),
      ],
      delta = new THREE.Vector2(pb.x - pa.x, pb.z - pa.z);
    for (const axis of axes) {
      const ra =
          aw * Math.abs(axis.dot(axes[0])) + al * Math.abs(axis.dot(axes[1])),
        rb =
          bw * Math.abs(axis.dot(axes[2])) + bl * Math.abs(axis.dot(axes[3]));
      if (Math.abs(delta.dot(axis)) >= ra + rb) return false;
    }
    return true;
  }
  function carOverlap(a, b) {
    return overlaps(
      a,
      a === player ? playerCar.userData.halfWidth : a.userData.halfWidth,
      a === player ? playerCar.userData.halfLength : a.userData.halfLength,
      b,
      b.userData.halfWidth,
      b.userData.halfLength,
    );
  }
  function updateActors(dt) {
    for (const a of actors) {
      let target = a.cruise;
      const leader = actors.find(
        (b) =>
          b !== a &&
          Math.abs(b.lane - a.lane) < 1.5 &&
          b.dir === a.dir &&
          (b.d - a.d) * a.dir > 0 &&
          (b.d - a.d) * a.dir < 12,
      );
      if (leader) target = Math.min(target, Math.max(0, leader.speed - 2));
      a.speed = THREE.MathUtils.lerp(a.speed, target, 1 - Math.exp(-2 * dt));
      const previous = a.d;
      a.d += (a.dir * a.speed * dt) / Math.sqrt(1 + slope(a.d) ** 2);
      syncActor(a);
      if (ghostTime <= 0 && carOverlap(player, a.mesh)) {
        beginCollision();
        a.d = previous;
        a.speed = 0;
        syncActor(a);
      }
      if (settings.mode !== "race") {
        if (a.d < distance - 120) a.d = distance + 440;
        if (a.d > distance + 470) a.d = distance - 110;
        syncActor(a);
      }
      if (a.mesh.userData.motorcycle)
        animateMotorcycle(a.mesh, a.speed, 0, a.speed < a.cruise - 1, dt);
      else assets.animateCar(a.mesh, a.speed, 0, a.speed < a.cruise - 1, dt);
    }
  }
  const weatherSystem = createCarWeather(THREE, scene, renderer);
  const terrainColors = {
    country: 0x70b64b,
    desert: 0xe2b478,
    suburbs: 0x7bbb57,
    city: 0x92b692,
    mountains: 0x7fac70,
    forest: 0x4c9751,
    canyon: 0xd69363,
  };
  const sunnyTerrainColors = {
    country: 0x62bd36,
    desert: 0xf0bb66,
    suburbs: 0x6bc447,
    city: 0x78b978,
    mountains: 0x69ad49,
    forest: 0x349746,
    canyon: 0xdf864b,
  };
  function applyWeather() {
    stopThunder();
    const w = settings.weather,
      night = w === "night",
      rain = w === "rain",
      snow = w === "snow",
      sunny = w === "sunny";
    const color = night
      ? 0x050a16
      : rain
        ? 0x263747
        : snow
          ? 0xdceaf2
          : 0x89d7fa;
    scene.background = new THREE.Color(color);
    scene.fog.color.set(color);
    scene.fog.near = rain ? 55 : night ? 60 : sunny ? 145 : 110;
    scene.fog.far = night ? 210 : rain ? 230 : snow ? 270 : 510;
    hemi.intensity = night ? 0.18 : rain ? 0.55 : snow ? 2 : 1.85;
    hemi.color.set(sunny ? 0xc4eaff : 0xc5e5f2);
    hemi.groundColor.set(sunny ? 0x59763e : 0x455545);
    sun.color.set(sunny ? 0xffe3a6 : 0xffecc8);
    leaf.color.set(sunny ? 0x30a842 : 0x489b4c);
    yellow.color.set(sunny ? 0xffd343 : 0xd8bc65);
    renderer.toneMappingExposure = sunny ? 1.08 : 1.18;
    sun.intensity = night ? 0.07 : rain ? 0.18 : snow ? 1.7 : 3.2;
    groundMat.color.set(
      snow
        ? 0xd9e0df
        : (sunny ? sunnyTerrainColors : terrainColors)[settings.road],
    );
    assets.asphalt.roughness = rain ? 0.25 : 0.96;
    assets.asphalt.metalness = rain ? 0.15 : 0;
    assets.asphalt.color.set(
      snow ? 0xd3d6d8 : rain ? 0x747b81 : sunny ? 0x858e98 : 0xb0b0b0,
    );
    headlights.visible = night || rain;
    scene.environmentIntensity = night ? 0.15 : rain ? 0.4 : 1;
    assets.streetGlow.emissiveIntensity = night || rain ? 2.5 : 0;
    worldDetail.setWeather(w);
    weatherSystem.setMode(w);
    $("#sceneLabel").textContent =
      roadNames[settings.road] +
      " / " +
      (rain ? "RAIN + STORM" : w.toUpperCase());
    document.querySelectorAll("[data-scene]").forEach((b) => {
      b.classList.toggle("active", b.dataset.scene === w);
      b.setAttribute("aria-pressed", String(b.dataset.scene === w));
    });
  }
  function updateWeather(dt) {
    weatherSystem.update(dt, player.position);
    updateRoadLights();
  }
  const thunderVoices = new Set();
  function stopThunder() {
    for (const voice of thunderVoices)
      try {
        voice.stop();
      } catch {}
    thunderVoices.clear();
  }
  function playThunder() {
    if (
      state !== "play" ||
      !preferences.sound ||
      settings.weather !== "rain" ||
      !audioContext
    )
      return;
    const buffer = audioContext.createBuffer(
        1,
        audioContext.sampleRate * 2.4,
        audioContext.sampleRate,
      ),
      data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp((-i / data.length) * 3);
    const source = audioContext.createBufferSource(),
      filter = audioContext.createBiquadFilter(),
      gain = audioContext.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = 220;
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.3,
      audioContext.currentTime + 0.12,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 2.3,
    );
    source.connect(filter).connect(gain).connect(audioContext.destination);
    thunderVoices.add(source);
    source.onended = () => {
      thunderVoices.delete(source);
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    source.start();
  }
  weatherSystem.onThunder(playThunder);
  let audioContext, engine, engineGain, rainGain;
  function ensureAudio() {
    try {
      if (audioContext) {
        audioContext.resume();
        return;
      }
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      engine = audioContext.createOscillator();
      engine.type = "sawtooth";
      engineGain = audioContext.createGain();
      engineGain.gain.value = 0;
      engine.connect(engineGain).connect(audioContext.destination);
      engine.start();
      const buffer = audioContext.createBuffer(
          1,
          audioContext.sampleRate * 2,
          audioContext.sampleRate,
        ),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * 0.15;
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      rainGain = audioContext.createGain();
      rainGain.gain.value = 0;
      noise.connect(rainGain).connect(audioContext.destination);
      noise.start();
    } catch {
      /* Audio is optional; driving still works. */
    }
  }
  function updateAudio() {
    if (!engineGain) return;
    const t = audioContext.currentTime;
    engine.frequency.setTargetAtTime(45 + Math.abs(speed) * 6, t, 0.08);
    engineGain.gain.setTargetAtTime(
      state === "play" && preferences.sound
        ? 0.009 + Math.abs(speed) * 0.0005
        : 0,
      t,
      0.1,
    );
    rainGain.gain.setTargetAtTime(
      state === "play" && preferences.sound && settings.weather === "rain"
        ? 0.12
        : 0,
      t,
      0.1,
    );
  }
  function horn() {
    if (!preferences.sound) return;
    ensureAudio();
    if (!audioContext) return;
    const o = audioContext.createOscillator(),
      g = audioContext.createGain();
    o.frequency.value = 390;
    g.gain.setValueAtTime(0.08, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    o.connect(g).connect(audioContext.destination);
    o.start();
    o.stop(audioContext.currentTime + 0.32);
  }
  function clearInput() {
    heldKeys.clear();
    heldPointers.clear();
    Object.keys(input).forEach((k) => (input[k] = false));
    document
      .querySelectorAll(".control")
      .forEach((b) => b.classList.remove("active"));
  }
  function setAuto(on) {
    autoDrive = on;
    $("#auto").classList.toggle("active", on);
    $("#auto").setAttribute("aria-pressed", String(on));
    $("#auto").textContent = "AUTO DRIVE: " + (on ? "ON" : "OFF");
  }
  function flash(text) {
    $("#status").textContent = text;
    $("#status").classList.add("show");
    noticeTime = 2.5;
  }
  function cameraPose(dt, snap = false) {
    const driver = cameraMode === 2,
      hood = cameraMode === 3;
    playerCar.visible =
      (!driver || isBike) &&
      (ghostTime <= 0 || Math.floor(ghostTime * 10) % 2 === 0);
    if (isBike) playerCar.userData.rider.visible = !driver && !hood;
    const height = isBike
      ? 1.98
      : vehicleCatalogue[settings.car].kind === "van"
        ? 2
        : vehicleCatalogue[settings.car].kind === "suv"
          ? 1.85
          : 1.45;
    const offsets = isBike
      ? [
          [0, 2.9, 6],
          [0, 2.1, 4],
          [0, 1.98, -0.25],
          [0, 1.6, -1.7],
          [4.5, 2.7, 4],
          [0, 19, 3],
          [0, 6, 7],
          [0, 10, 7],
          [0, 14, 5],
        ]
      : [
          [0, 4.3, 8.4],
          [0, 2.6, 5.8],
          [0, height, -0.5],
          [0, 1.3, -1.2],
          [7, 3.2, 5],
          [0, 23, 4],
          [0, 7.5, 10],
          [0, 12, 10],
          [0, 17, 7],
        ];
    const off = new THREE.Vector3(...offsets[cameraMode]).applyQuaternion(
        player.quaternion,
      ),
      look = new THREE.Vector3(
        0,
        driver ? height : hood ? 1.25 : 1,
        -(driver || hood ? 35 : 7),
      ).applyQuaternion(player.quaternion);
    camera.position.lerp(
      player.position.clone().add(off),
      snap || driver || hood ? 1 : 1 - Math.exp(-6 * dt),
    );
    camera.lookAt(player.position.clone().add(look));
    $("#cameraBtn").textContent = "Camera: " + cameraNames[cameraMode];
    $("#cameraBtn").setAttribute(
      "aria-label",
      "Camera: " + cameraNames[cameraMode],
    );
  }
  function setCamera(index) {
    cameraMode = index % cameraNames.length;
    cameraPose(0, true);
    flash(cameraNames[cameraMode]);
  }
  function cycleWeather() {
    if (state !== "play") return;
    const all = ["sunny", "rain", "snow", "night"];
    settings.weather = all[(all.indexOf(settings.weather) + 1) % 4];
    applyWeather();
    flash("Weather: " + settings.weather);
    document.dispatchEvent(new Event("journeychange"));
  }
  function changeLiveMap(road) {
    if (
      state !== "play" ||
      settings.mode !== "free" ||
      !Object.hasOwn(roadNames, road) ||
      road === settings.road
    )
      return;
    settings.road = road;
    clearWorld();
    terrainRoad = "";
    terrainZ = terrainX = Infinity;
    player.position.copy(roadFrame(distance, lateral));
    player.position.y = 0.05 + roadHeight(distance);
    const t = tangent(distance);
    player.rotation.set(0, Math.atan2(-t.x, -t.z), 0);
    steer = 0;
    playerCar.rotation.set(0, 0, 0);
    ghostTime = 1;
    blockedTime = 0;
    applyWeather();
    updateWeather(0);
    sun.position.copy(player.position).add(new THREE.Vector3(35, 60, 30));
    sun.target.position.copy(player.position);
    streamRoad();
    spawnActors();
    cameraPose(0, true);
    updateHUD();
    clock.getDelta();
    flash("Now driving: " + roadNames[road]);
    document.dispatchEvent(new Event("journeychange"));
  }
  function centerCar() {
    if (state !== "play") return;
    speed = 0;
    steer = 0;
    blockedTime = 0;
    ghostTime = 0;
    clearInput();
    setAuto(false);
    player.position.copy(point(distance));
    player.position.y += roadHeight(distance);
    player.rotation.set(
      0,
      Math.atan2(-tangent(distance).x, -tangent(distance).z),
      0,
    );
    lateral = 0;
    playerCar.rotation.z = 0;
    animatePlayer(0);
    cameraPose(0, true);
    flash("Centered. Hold DRIVE to continue.");
    updateHUD();
  }
  function startGame() {
    ensureAudio();
    stopThunder();
    clock.getDelta();
    camera.clearViewOffset();
    orbit.pointers.clear();
    clearWorld();
    clearInput();
    setAuto(false);
    state = "play";
    countdown = settings.mode === "race" ? 3 : 0;
    turboCharge = 100;
    speed = 0;
    steer = 0;
    distance = 0;
    tripDistance = 0;
    lateral = 0;
    elapsed = 0;
    ghostTime = 0;
    blockedTime = 0;
    noticeTime = 0;
    player.position.copy(point(0));
    player.rotation.set(0, Math.atan2(-tangent(0).x, -tangent(0).z), 0);
    playerCar.rotation.z = 0;
    animatePlayer(0);
    platform.visible = platformRing.visible = false;
    $("#lobby").hidden = true;
    $("#results").hidden = true;
    $("#pauseOverlay").hidden = true;
    $("#hud").hidden = false;
    applyWeather();
    updateWeather(0);
    sun.position.copy(player.position).add(new THREE.Vector3(35, 60, 30));
    sun.target.position.copy(player.position);
    streamRoad();
    spawnActors();
    cameraPose(0, true);
    updateHUD();
    flash(
      settings.mode === "race"
        ? "Get ready. Hold accelerate for the start."
        : "Arrows to drive. Ctrl for turbo. W changes weather.",
    );
    clock.getDelta();
  }
  function returnLobby() {
    state = "lobby";
    countdown = 0;
    $("#countdown").hidden = true;
    weatherSystem.hide();
    stopThunder();
    orbit.pointers.clear();
    terrainRoad = "";
    terrainZ = terrainX = Infinity;
    const ga = ground.geometry.attributes.position;
    for (let i = 0; i < ga.count; i++) ga.setZ(i, 0);
    ga.needsUpdate = true;
    ground.geometry.computeVertexNormals();
    ground.geometry.computeBoundingSphere();
    clearInput();
    setAuto(false);
    speed = 0;
    ghostTime = 0;
    blockedTime = 0;
    clearWorld();
    player.position.set(0, 0.005, 0);
    player.rotation.set(0, 0, 0);
    playerCar.rotation.z = 0;
    playerCar.visible = true;
    if (isBike) {
      playerCar.rotation.x = 0;
      steer = 0;
      animatePlayer(0);
      playerCar.userData.rider.visible = true;
    }
    platform.visible = platformRing.visible = true;
    ground.position.set(0, -0.015, 0);
    $("#lobby").hidden = false;
    $("#hud").hidden = true;
    $("#results").hidden = true;
    $("#pauseOverlay").hidden = true;
    $("#ghost").hidden = true;
    scene.background = new THREE.Color(0xbce9fb);
    scene.fog.color.set(0xbce9fb);
    groundMat.color.set(0xcde9ef);
    hemi.intensity = 2.5;
    sun.intensity = 3.2;
    headlights.visible = false;
    updateAudio();
    updateLobbyPreview();
  }
  function rankings() {
    return [
      { name: "You", d: distance, you: true },
      ...actors.map((a) => ({ name: a.name, d: a.d })),
    ].sort((a, b) => b.d - a.d);
  }
  function finishRace() {
    state = "results";
    weatherSystem.cancelFlash();
    stopThunder();
    speed = 0;
    clearInput();
    setAuto(false);
    ghostTime = 0;
    playerCar.visible = isBike || cameraMode !== 2;
    $("#ghost").hidden = true;
    const rows = rankings(),
      rank = rows.findIndex((r) => r.you) + 1;
    $("#resultTitle").textContent =
      rank === 1 ? "You take the win!" : "Finished " + rank + " / 5";
    $("#resultSummary").textContent =
      "30 seconds complete. You reached " +
      Math.max(0, Math.round(distance)) +
      " m along the road.";
    $("#standings").replaceChildren(
      ...rows.map((r, i) => {
        const li = document.createElement("li");
        if (r.you) li.className = "you";
        const label = document.createElement("span"),
          metres = document.createElement("span");
        label.textContent = i + 1 + ". " + r.name;
        metres.textContent = Math.round(r.d) + " m";
        li.append(label, metres);
        return li;
      }),
    );
    $("#results").hidden = false;
    updateAudio();
  }
  function beginCollision() {
    if (ghostTime > 0 || blockedTime > 0) return;
    recoverySpeed =
      Math.sign(speed || 1) * Math.max(5, Math.min(Math.abs(speed), 14));
    blockedTime = 0.5;
    speed = 0;
    flash("Recovering...");
  }
  function physicsStep(dt) {
    if (blockedTime > 0) {
      blockedTime = Math.max(0, blockedTime - dt);
      if (blockedTime > 1e-8) {
        updateActors(dt);
        return;
      }
      blockedTime = 0;
      ghostTime = 2;
      speed = input.brake ? 0 : recoverySpeed;
      flash("Ghost protection: keep driving.");
    }
    ghostTime = Math.max(0, ghostTime - dt);
    const old = player.position.clone(),
      oldYaw = player.rotation.y;
    const grip =
        settings.weather === "snow"
          ? 0.8
          : settings.weather === "rain"
            ? 0.9
            : 1,
      performance = vehiclePerformance[settings.car],
      boost = input.turbo && turboCharge > 0 && !input.brake && !input.reverse,
      throttle = input.accel || autoDrive || boost,
      limit = performance.speed * (boost ? 1.45 : 1),
      zero = (amount) =>
        Math.sign(speed) * Math.max(0, Math.abs(speed) - amount);
    turboCharge = THREE.MathUtils.clamp(
      turboCharge + (boost ? -25 : !input.turbo ? 15 : 0) * dt,
      0,
      100,
    );
    if (input.brake) speed = zero(24 * grip * dt);
    else if (input.reverse)
      speed =
        speed > 0
          ? Math.max(0, speed - 20 * dt)
          : Math.max(-9, speed - 10 * dt);
    else if (throttle)
      speed =
        speed < 0
          ? Math.min(0, speed + 20 * dt)
          : speed > limit
            ? Math.max(limit, speed - 5 * dt)
            : Math.min(
                limit,
                speed + performance.acceleration * (boost ? 1.8 : 1) * dt,
              );
    else speed = zero(3.5 * dt);
    steer = THREE.MathUtils.lerp(
      steer,
      (input.left ? 1 : 0) - (input.right ? 1 : 0),
      1 - Math.exp(-5 * dt),
    );
    player.rotation.y +=
      (steer * performance.handling * grip * (speed / 28) * dt) /
      (1 + Math.max(0, speed - performance.speed) * 0.035);
    player.position.addScaledVector(
      new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion),
      speed * dt,
    );
    trackPlayer();
    if (settings.mode !== "roam") {
      const t = tangent(distance),
        angle = player.rotation.y - Math.atan2(-t.x, -t.z),
        extent =
          Math.abs(Math.cos(angle)) * playerCar.userData.halfWidth +
          Math.abs(Math.sin(angle)) * playerCar.userData.halfLength,
        limit = 10.35 - extent;
      const clamped = THREE.MathUtils.clamp(lateral, -limit, limit);
      if (clamped !== lateral) {
        player.position.addScaledVector(
          new THREE.Vector3(-t.z, 0, t.x),
          clamped - lateral,
        );
        lateral = clamped;
        // Slide along the rail without repeatedly destroying forward speed.
        const roadYaw = Math.atan2(-t.x, -t.z);
        const travelYaw = roadYaw + (Math.cos(angle) < 0 ? Math.PI : 0);
        player.rotation.y = travelYaw;
        steer *= Math.exp(-12 * dt);
      }
    } else if (Math.abs(lateral) > 11) speed *= Math.exp(-0.28 * dt);
    let blocked = false;
    if (ghostTime <= 0) {
      blocked = actors.some((a) => carOverlap(player, a.mesh));
      if (!blocked)
        for (const chunk of chunks.values())
          for (const h of [
            ...(chunk.userData.houses || []),
            ...(chunk.userData.buildings || []),
          ])
            if (
              overlaps(
                player,
                playerCar.userData.halfWidth,
                playerCar.userData.halfLength,
                h,
                h.userData.halfWidth || 3.8,
                h.userData.halfLength || 3.3,
              )
            )
              blocked = true;
      if (blocked) {
        player.position.copy(old);
        player.rotation.y = oldYaw;
        beginCollision();
        trackPlayer();
      }
    }

    player.position.y = 0.05 + roadHeight(-player.position.z);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
        player.quaternion,
      ),
      grade =
        roadHeight(-(player.position.z + forward.z)) -
        roadHeight(-player.position.z);
    playerCar.rotation.x = -Math.atan(grade);
    tripDistance += Math.hypot(
      player.position.x - old.x,
      player.position.z - old.z,
    );
    updateActors(dt);
    animatePlayer(dt);
    playerCar.rotation.z = THREE.MathUtils.lerp(
      playerCar.rotation.z,
      steer * (speed / 28) * (isBike ? 0.42 : -0.035),
      1 - Math.exp(-6 * dt),
    );
  }
  function updateHUD() {
    $("#countdown").hidden = countdown <= 0;
    $("#countdownValue").textContent = Math.ceil(countdown);
    $("#turboFill").style.width = turboCharge + "%";
    $("#turboCharge").textContent = Math.round(turboCharge) + "%";
    $("#turboMeter").setAttribute(
      "aria-valuenow",
      String(Math.round(turboCharge)),
    );
    $("#liveMapControl").hidden = true;
    $("#raceBox").hidden = settings.mode !== "race";
    $("#liveMapSelect").value = settings.road;
    $("#turbo").classList.toggle(
      "active",
      input.turbo && turboCharge > 0 && !input.brake && !input.reverse,
    );
    $("#turboStatus").hidden = !(
      input.turbo &&
      turboCharge > 0 &&
      !input.brake &&
      !input.reverse
    );
    $("#speed").textContent = Math.round(Math.abs(speed) * 3.6);
    $("#tripDistance").textContent =
      tripDistance < 1000
        ? Math.floor(tripDistance) + " m"
        : (tripDistance / 1000).toFixed(2) + " km";
    $("#modeLabel").textContent =
      settings.mode === "race"
        ? "30-SECOND RACE"
        : settings.mode === "roam"
          ? "OPEN ROAM"
          : "FREE RIDE";
    $("#timer").textContent =
      settings.mode === "race"
        ? Math.max(0, 30 - elapsed).toFixed(1) + "s"
        : (Math.abs(distance) / 1000).toFixed(2) + " km";
    $("#position").textContent =
      settings.mode === "race"
        ? "POSITION " + (rankings().findIndex((r) => r.you) + 1) + " / 5"
        : settings.mode === "roam"
          ? "NO BARRIERS / EXPLORE FREELY"
          : "ENDLESS ROAD / TWO-WAY TRAFFIC";
    $("#ghost").hidden = ghostTime <= 0;
    $("#ghost b").textContent = ghostTime.toFixed(1) + "s";
  }
  function updateGame(dt) {
    if (state !== "play") return;
    if (countdown > 0) {
      countdown = Math.max(0, countdown - dt);
      updateHUD();
      cameraPose(Math.min(dt, 0.1));
      if (countdown === 0) {
        flash("GO!");
        clock.getDelta();
      }
      return;
    }
    const active = settings.mode === "race" ? Math.min(dt, 30 - elapsed) : dt;
    // Small simulation steps prevent fast cars from skipping through one another.
    const simulation = Math.min(active, 0.24),
      steps = Math.max(1, Math.ceil(simulation / 0.008));
    for (let i = 0; i < steps; i++) physicsStep(simulation / steps);
    elapsed += active;
    noticeTime = Math.max(0, noticeTime - active);
    if (!noticeTime) $("#status").classList.remove("show");
    streamRoad();
    updateWeather(active);
    cameraPose(simulation);
    sun.position.copy(player.position).add(new THREE.Vector3(35, 60, 30));
    sun.target.position.copy(player.position);
    updateHUD();
    updateAudio();
    if (settings.mode === "race" && elapsed >= 30 - 1e-8) finishRace();
  }
  function pauseGame() {
    if (state !== "play") return;
    state = "paused";
    weatherSystem.cancelFlash();
    stopThunder();
    clearInput();
    setAuto(false);
    $("#pauseOverlay").hidden = false;
    updateAudio();
  }
  function syncAction(action) {
    input[action] =
      [...heldKeys].some((code) => keys[code] === action) ||
      [...heldPointers.values()].includes(action);
    $("#" + action).classList.toggle("active", input[action]);
  }
  function bindHold(id, key) {
    const b = $(id);
    listen(b, "pointerdown", (e) => {
      if (state !== "play") return;
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      ensureAudio();
      heldPointers.set(e.pointerId, key);
      syncAction(key);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
      listen(b, type, (e) => {
        heldPointers.delete(e.pointerId);
        syncAction(key);
      });
  }
  for (const key of Object.keys(input)) bindHold("#" + key, key);
  const keys = {
    ArrowUp: "accel",
    ArrowDown: "reverse",
    Space: "brake",
    ArrowLeft: "left",
    ArrowRight: "right",
    ControlLeft: "turbo",
    ControlRight: "turbo",
  };
  listen(window, "keydown", (e) => {
    if (state !== "play" || e.target.closest("input,select")) return;
    if (e.code === "Backspace") {
      e.preventDefault();
      if (!e.repeat) centerCar();
      return;
    }
    if (keys[e.code]) {
      e.preventDefault();
      ensureAudio();
      heldKeys.add(e.code);
      syncAction(keys[e.code]);
    }
    if (e.repeat) return;
    if (e.code === "KeyC") setCamera((cameraMode + 1) % cameraNames.length);
    if (/^Digit[1-9]$/.test(e.code)) setCamera(Number(e.code.slice(-1)) - 1);
    if (e.code === "KeyR") {
      e.preventDefault();
      centerCar();
    }
    if (e.code === "KeyW") {
      e.preventDefault();
      cycleWeather();
    }
    if (e.code === "KeyH") horn();
    if (e.code === "Escape") pauseGame();
  });
  listen(window, "keyup", (e) => {
    if (keys[e.code]) {
      heldKeys.delete(e.code);
      syncAction(keys[e.code]);
    }
  });
  listen(window, "blur", () => {
    pauseGame();
    orbit.pointers.clear();
    renderer.domElement.classList.remove("dragging");
  });
  listen(document, "visibilitychange", () => {
    if (document.hidden) pauseGame();
  });
  function resetGarageView() {
    lobbyAngle = -2.35;
    orbit.pitch = 0.32;
    orbit.zoom = 1;
    orbit.auto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    orbit.pointers.clear();
  }
  function pointerGap() {
    const p = [...orbit.pointers.values()];
    return p.length === 2 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
  }
  listen(renderer.domElement, "pointerdown", (e) => {
    if (state !== "lobby" || (e.pointerType === "mouse" && e.button !== 0))
      return;
    e.preventDefault();
    renderer.domElement.setPointerCapture(e.pointerId);
    orbit.auto = false;
    orbit.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    renderer.domElement.classList.add("dragging");
  });
  listen(renderer.domElement, "pointermove", (e) => {
    if (state !== "lobby" || !orbit.pointers.has(e.pointerId)) return;
    const before = orbit.pointers.get(e.pointerId),
      gap = pointerGap();
    orbit.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (orbit.pointers.size === 1) {
      lobbyAngle -= (e.clientX - before.x) * 0.008;
      orbit.pitch = THREE.MathUtils.clamp(
        orbit.pitch + (e.clientY - before.y) * 0.006,
        0.06,
        1.15,
      );
    } else if (gap > 0) {
      orbit.zoom = THREE.MathUtils.clamp(
        (orbit.zoom * gap) / Math.max(1, pointerGap()),
        0.7,
        1.65,
      );
    }
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    listen(renderer.domElement, type, (e) => {
      orbit.pointers.delete(e.pointerId);
      if (!orbit.pointers.size)
        renderer.domElement.classList.remove("dragging");
    });
  listen(
    renderer.domElement,
    "wheel",
    (e) => {
      if (state !== "lobby") return;
      e.preventDefault();
      orbit.auto = false;
      orbit.zoom = THREE.MathUtils.clamp(
        orbit.zoom * Math.exp(e.deltaY * 0.001),
        0.7,
        1.65,
      );
    },
    { passive: false },
  );
  listen(renderer.domElement, "dblclick", () => {
    if (state === "lobby") resetGarageView();
  });
  $("#garageReset").onclick = resetGarageView;
  function markButtons(selector, property, value) {
    document.querySelectorAll(selector).forEach((b) => {
      const active = b.dataset[property] === String(value);
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  }
  document.querySelectorAll("[data-car]").forEach(
    (b) =>
      (b.onclick = () => {
        settings.car = Number(b.dataset.car);
        markButtons("[data-car]", "car", settings.car);
        rebuildCar();
      }),
  );
  document.querySelectorAll("[data-rider]").forEach(
    (b) =>
      (b.onclick = () => {
        settings.rider = Number(b.dataset.rider);
        markButtons("[data-rider]", "rider", settings.rider);
        rebuildCar();
      }),
  );
  document
    .querySelectorAll("[data-color]")
    .forEach(
      (b) => (b.onclick = () => setPaint(b.dataset.color, b.dataset.name)),
    );
  listen($("#customColor"), "input", (e) =>
    setPaint(e.target.value, "Custom finish"),
  );
  document.querySelectorAll("[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        settings.mode = b.dataset.mode;
        markButtons("[data-mode]", "mode", settings.mode);
        $("#startBtn").textContent =
          settings.mode === "race"
            ? "START 30-SECOND RACE ↗"
            : settings.mode === "roam"
              ? "START OPEN ROAM ↗"
              : "START FREE RIDE ↗";
      }),
  );
  document.querySelectorAll("[data-road]").forEach(
    (b) =>
      (b.onclick = () => {
        settings.road = b.dataset.road;
        markButtons("[data-road]", "road", settings.road);
      }),
  );
  document.querySelectorAll("[data-scene]").forEach(
    (b) =>
      (b.onclick = () => {
        settings.weather = b.dataset.scene;
        markButtons("[data-scene]", "scene", settings.weather);
      }),
  );
  $("#startBtn").onclick = startGame;
  $("#lobbyBtn").onclick = returnLobby;
  $("#resultGarageBtn").onclick = returnLobby;
  $("#againBtn").onclick = startGame;
  $("#cameraBtn").onclick = () =>
    setCamera((cameraMode + 1) % cameraNames.length);
  $("#sceneBtn").onclick = cycleWeather;
  $("#resetBtn").onclick = centerCar;
  $("#horn").onclick = horn;
  $("#auto").onclick = () => {
    if (state === "play") setAuto(!autoDrive);
  };
  const clock = new THREE.Clock();
  $("#resumeBtn").onclick = () => {
    clock.getDelta();
    state = "play";
    $("#pauseOverlay").hidden = true;
    ensureAudio();
  };
  function resize() {
    if (matchMedia("(orientation: portrait) and (max-width: 1024px)").matches) {
      clearInput();
      pauseGame();
    }
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, preferences.quality === "low" ? 1 : 1.75),
    );
    renderer.shadowMap.enabled = preferences.quality === "high";
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  listen(window, "resize", resize);
  function animate() {
    if (disposed) return;
    frameId = window.requestAnimationFrame(animate);
    const dt = clock.getDelta();
    if (state === "lobby") {
      updateWeather(Math.min(dt, 0.05));
      if (isBike) playerCar.userData.rider.visible = preferences.riderPreview;
      if (orbit.auto) lobbyAngle += Math.min(dt, 0.05) * 0.12;
      const expanded = document.body.classList.contains("previewExpanded"),
        showcase = ["home", "vehicle"].includes(
          document.body.dataset.page || "home",
        ),
        compact = innerWidth <= 760;
      const stageBottom = !expanded
        ? $("#vehicleCaption").getBoundingClientRect().top - 8
        : innerHeight;
      const stageTop = expanded ? 0 : innerHeight < 600 ? 55 : 105,
        stageHeight = Math.max(100, stageBottom - stageTop),
        center = stageTop + stageHeight * 0.5;
      const radius =
        7.5 *
        orbit.zoom *
        (isBike ? (preferences.riderPreview ? 0.76 : 0.66) : 1) *
        (expanded ? 1 : Math.max(1, (innerHeight / stageHeight) * 0.45));
      camera.position.set(
        Math.sin(lobbyAngle) * radius * Math.cos(orbit.pitch),
        0.9 + Math.sin(orbit.pitch) * radius,
        Math.cos(lobbyAngle) * radius * Math.cos(orbit.pitch),
      );
      camera.lookAt(0, 0.9, 0);
      camera.setViewOffset(
        innerWidth,
        innerHeight,
        expanded
          ? 0
          : -($("#lobbyPanel").getBoundingClientRect().right + 16) / 2,
        expanded ? 0 : innerHeight * 0.5 - center,
        innerWidth,
        innerHeight,
      );
      sun.position.set(10, 15, 8);
      sun.target.position.set(0, 0, 0);
    } else {
      camera.clearViewOffset();
      if (state === "play") updateGame(dt);
    }
    renderer.render(scene, camera);
  }
  returnLobby();
  $("#loading").hidden = true;

  listen(renderer.domElement, "webglcontextlost", (e) => {
    e.preventDefault();
    pauseGame();
    $("#graphicsNotice").hidden = false;
  });
  listen(renderer.domElement, "webglcontextrestored", () => {
    $("#graphicsNotice").hidden = true;
    resize();
  });

  // Shared journey navigation; opening settings never rebuilds the current drive.
  let pageName = "home",
    expandedPreview = false,
    settingsReturnFocus = null;
  const pageOrder = ["home", "vehicle", "maps", "weather", "mode", "ready"];
  const roadDetails = {
    country: ["Countryside", "Rolling fields and sweeping country bends."],
    desert: [
      "Desert highway",
      "Wide horizons and a gentle, sun-baked highway.",
    ],
    suburbs: ["Suburban avenue", "Tree-lined streets, houses and crossings."],
    city: ["City boulevard", "A city drive through towers and busy avenues."],
    mountains: ["Mountain pass", "Climb an elevated road with winding turns."],
    forest: ["Forest trail", "A twisting route through deep green woodland."],
    canyon: [
      "Red rock canyon",
      "Follow the curves between warm red rock formations.",
    ],
  };
  const weatherDetails = {
    sunny: ["\u2600 Sunny day", "Clear skies and long views."],
    rain: ["\u2602 Rain + storm", "Wet roads, rainfall and lightning."],
    snow: ["\u2744 Snowy day", "Falling snow and a white landscape."],
    night: ["\u263e Night drive", "Stars above. Headlights on."],
  };
  const modeNames = {
    free: "Free ride",
    race: "30-second race",
    roam: "Open roam",
  };
  const roadKeys = Object.keys(roadDetails),
    weatherKeys = Object.keys(weatherDetails),
    modeKeys = Object.keys(modeNames);
  function showPage(name) {
    if (state !== "lobby") return;
    pageName = pageOrder.includes(name) ? name : "home";
    document.body.dataset.page = pageName;
    const step = pageOrder.indexOf(pageName);
    $("#stepLabel").textContent = step
      ? "BUILD YOUR JOURNEY / " + String(step).padStart(2, "0") + " OF 05"
      : "ROAD CLUB / YOUR LOBBY";
    document
      .querySelectorAll("[data-page]")
      .forEach((b) =>
        b.classList.toggle(
          "complete",
          pageOrder.indexOf(b.dataset.page) < step,
        ),
      );
    $("#nextHint").textContent = {
      home: "YOUR VEHICLE. YOUR ROAD. YOUR RULES.",
      vehicle: "UP NEXT / CHOOSE YOUR ROAD",
      maps: "UP NEXT / SET THE WEATHER",
      weather: "UP NEXT / FIND YOUR GAME MODE",
      mode: "UP NEXT / REVIEW YOUR JOURNEY",
      ready: "ALL SET / YOUR SELECTED JOURNEY IS READY",
    }[pageName];
    document
      .querySelectorAll("[data-screen]")
      .forEach((el) => (el.hidden = el.dataset.screen !== pageName));
    document.querySelectorAll("[data-page]").forEach((el) => {
      el.classList.toggle("active", el.dataset.page === pageName);
      if (el.dataset.page === pageName) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });
    $("#backBtn").hidden = pageName === "home";
    $("#nextBtn").hidden = pageName === "ready";
    $("#startBtn").hidden = pageName !== "ready";
    $("#nextBtn").textContent =
      pageName === "home" ? "START GAME \u2192" : "NEXT \u2192";
    $(".formOptions").scrollTop = 0;
    syncJourney();
    const heading = document.querySelector(
      '[data-screen="' + pageName + '"] h2',
    );
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  function syncJourney() {
    $("#lobbyMapValue").textContent = roadDetails[settings.road][0];
    $("#lobbyWeatherValue").textContent = weatherDetails[settings.weather][0];
    $("#lobbyModeValue").textContent = modeNames[settings.mode];
    for (const [id, label, value] of [
      ["mapsBtn", "map", roadDetails[settings.road][0]],
      ["lobbyWeatherBtn", "weather", weatherDetails[settings.weather][0]],
      ["lobbyModeBtn", "game mode", modeNames[settings.mode]],
    ])
      $("#" + id).setAttribute(
        "aria-label",
        "Next " + label + ". Current: " + value,
      );
    updateLobbyPreview();
    $("#homeVehicle").textContent = carNames[settings.car];
    $("#homeSummary").textContent =
      roadDetails[settings.road][0] +
      " \u00b7 " +
      weatherDetails[settings.weather][0] +
      " \u00b7 " +
      modeNames[settings.mode];
    $("#vehicleCount").textContent =
      settings.car +
      1 +
      " / " +
      carNames.length +
      " / " +
      vehicleCatalogue[settings.car].type.toUpperCase() +
      " / IN-GAME PERFORMANCE";
    $("#riderOptions").hidden = !isBike;
    $("#roadTitle").textContent = roadDetails[settings.road][0];
    $("#roadCount").textContent =
      roadKeys.indexOf(settings.road) + 1 + " / 7 roads";
    $("#roadDescription").textContent = roadDetails[settings.road][1];
    $("#weatherTitle").textContent = weatherDetails[settings.weather][0];
    $("#weatherDescription").textContent = weatherDetails[settings.weather][1];
    document.querySelectorAll(".mapPreview").forEach((preview) => {
      preview.dataset.road = settings.road;
      preview.dataset.weather = settings.weather;
      preview.setAttribute(
        "aria-label",
        roadDetails[settings.road][0] +
          " with " +
          weatherDetails[settings.weather][0],
      );
    });
    $("#weatherMapBadge").textContent = roadDetails[settings.road][0];
    $("#mapPreview").setAttribute(
      "aria-label",
      roadDetails[settings.road][0] +
        " with " +
        weatherDetails[settings.weather][0],
    );
    $("#mapBadge").textContent = roadDetails[settings.road][0];
    const summary = $("#journeySummary");
    summary.replaceChildren();
    for (const [label, value] of [
      ["Vehicle", carNames[settings.car]],
      ["Road", roadDetails[settings.road][0]],
      ["Weather", weatherDetails[settings.weather][0]],
      ["Game mode", modeNames[settings.mode]],
    ]) {
      const row = document.createElement("p"),
        key = document.createElement("span"),
        val = document.createElement("strong");
      key.textContent = label;
      val.textContent = value;
      const edit = document.createElement("button");
      edit.className = "summaryEdit";
      edit.textContent = "Edit";
      edit.setAttribute("aria-label", "Edit " + label.toLowerCase());
      edit.onclick = () =>
        showPage(
          {
            Vehicle: "vehicle",
            Road: "maps",
            Weather: "weather",
            "Game mode": "mode",
          }[label],
        );
      row.append(key, val, edit);
      summary.append(row);
    }
    $("#startBtn").textContent = "GO \u2192";
    syncExperience();
  }
  function selectVehicle(index) {
    if (state !== "lobby") return;
    settings.car = (index + carNames.length) % carNames.length;
    markButtons("[data-car]", "car", settings.car);
    rebuildCar();
    resetGarageView();
    syncJourney();
  }
  function cycle(property, values, delta) {
    settings[property] =
      values[
        (values.indexOf(settings[property]) + delta + values.length) %
          values.length
      ];
    syncJourney();
  }
  function setExpanded(value) {
    expandedPreview = value;
    document.body.classList.toggle("previewExpanded", value);
    $("#expandPreview").textContent = value
      ? "\u2199 Close full screen"
      : "\u26f6 Full screen";
    $("#expandPreview").setAttribute("aria-pressed", String(value));
    $("#expandPreview").setAttribute(
      "aria-label",
      value ? "Close full screen preview" : "Expand vehicle preview",
    );
    orbit.pointers.clear();
  }
  $("#expandPreview").onclick = () => setExpanded(!expandedPreview);
  $("#rotateLeft").onclick = () => {
    orbit.auto = false;
    lobbyAngle -= Math.PI / 6;
  };
  $("#rotateRight").onclick = () => {
    orbit.auto = false;
    lobbyAngle += Math.PI / 6;
  };
  $("#zoomIn").onclick = () => {
    orbit.zoom = Math.max(0.7, orbit.zoom - 0.15);
  };
  $("#zoomOut").onclick = () => {
    orbit.zoom = Math.min(1.65, orbit.zoom + 0.15);
  };
  $("#prevVehicle").onclick = () => selectVehicle(settings.car - 1);
  $("#nextVehicle").onclick = () => selectVehicle(settings.car + 1);
  $("#prevRoad").onclick = () => cycle("road", roadKeys, -1);
  $("#nextRoad").onclick = () => cycle("road", roadKeys, 1);
  $("#prevWeather").onclick = () => cycle("weather", weatherKeys, -1);
  $("#nextWeather").onclick = () => cycle("weather", weatherKeys, 1);
  $("#selectVehicleBtn").onclick = () => showPage("vehicle");
  $("#mapsBtn").onclick = () => cycle("road", roadKeys, 1);
  $("#lobbyWeatherBtn").onclick = () => cycle("weather", weatherKeys, 1);
  $("#lobbyModeBtn").onclick = () => cycle("mode", modeKeys, 1);
  $("#nextBtn").onclick = () =>
    showPage(pageOrder[pageOrder.indexOf(pageName) + 1]);
  $("#backBtn").onclick = () =>
    showPage(pageOrder[pageOrder.indexOf(pageName) - 1]);
  document
    .querySelectorAll("[data-page]")
    .forEach((b) => (b.onclick = () => showPage(b.dataset.page)));
  document
    .querySelectorAll("[data-car]")
    .forEach((b) => (b.onclick = () => selectVehicle(Number(b.dataset.car))));
  document.querySelectorAll("[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        settings.mode = b.dataset.mode;
        markButtons("[data-mode]", "mode", settings.mode);
        syncJourney();
      }),
  );
  listen(document, "vehiclechange", syncJourney);
  listen(document, "journeychange", syncJourney);
  function goHome() {
    setExpanded(false);
    $("#settingsOverlay").hidden = true;
    returnLobby();
    showPage("home");
    queueMicrotask(() => $("#selectVehicleBtn").focus());
  }
  function beginDrive() {
    setExpanded(false);
    $("#settingsOverlay").hidden = true;
    startGame();
    document.activeElement?.blur();
  }
  function resumeDrive() {
    if (state !== "paused" || !$("#settingsOverlay").hidden) return;
    clock.getDelta();
    state = "play";
    $("#pauseOverlay").hidden = true;
    ensureAudio();
    document.activeElement?.blur();
  }
  $("#startBtn").onclick = beginDrive;
  $("#againBtn").onclick = beginDrive;
  $("#restartBtn").onclick = beginDrive;
  $("#lobbyBtn").onclick = pauseGame;
  $("#resumeBtn").onclick = resumeDrive;
  $("#pauseHomeBtn").onclick = goHome;
  $("#resultGarageBtn").onclick = goHome;
  function openSettings() {
    if (state !== "lobby" && state !== "paused") return;
    settingsReturnFocus = document.activeElement;
    $("#settingsContext").textContent =
      state === "paused"
        ? "Your drive stays paused. Save to return to the pause menu, then resume from the same place."
        : "Set up your sound, camera and graphics.";
    $("#soundSetting").checked = preferences.sound;
    $("#qualitySetting").value = preferences.quality;
    $("#cameraSetting").replaceChildren(
      ...cameraNames.map((name, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = name;
        return option;
      }),
    );
    $("#cameraSetting").value = cameraMode;
    $("#settingsOverlay").hidden = false;
    $("#soundSetting").focus();
  }
  function closeSettings() {
    preferences.sound = $("#soundSetting").checked;
    preferences.quality = $("#qualitySetting").value;
    cameraMode = Number($("#cameraSetting").value);
    resize();
    if (state === "paused") cameraPose(0, true);
    updateAudio();
    $("#settingsOverlay").hidden = true;
    queueMicrotask(() => settingsReturnFocus?.focus());
    saveJourney();
  }
  $("#pauseSettingsBtn").onclick = openSettings;
  $("#homeSettingsBtn").onclick = openSettings;
  $("#closeSettingsBtn").onclick = closeSettings;
  listen(window, "keydown", (e) => {
    if (!$("#settingsOverlay").hidden) {
      if (e.code === "Escape") {
        e.preventDefault();
        closeSettings();
      }
      if (e.code === "Tab") {
        const controls = [
          ...$("#settingsOverlay").querySelectorAll("input,select,button"),
        ];
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (e.code === "Escape" && state === "lobby") {
      e.preventDefault();
      if (expandedPreview) setExpanded(false);
      else if (pageName !== "home")
        showPage(pageOrder[pageOrder.indexOf(pageName) - 1]);
    }
  });
  // Small interface helpers keep the game engine independent from the menu.
  const storageKey = "road-club-journey-v1";
  let savedJourney = null;
  try {
    savedJourney = JSON.parse(localStorage.getItem(storageKey));
  } catch {
    /* Offline storage is optional. */
  }
  const routeArt = {
    country: "M110 260C80 200 370 180 270 115L239 80",
    desert: "M200 260L250 80",
    suburbs: "M180 260L180 180Q180 160 220 160L260 160L260 80",
    city: "M230 260L230 80",
    mountains: "M130 260C40 190 410 210 300 155S140 130 250 80",
    forest: "M140 260C320 220 90 180 270 145S310 105 250 80",
    canyon: "M140 260C90 190 365 200 310 145S210 115 250 80",
  };
  function saveJourney() {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ settings, preferences, cameraMode }),
      );
    } catch {
      /* Private browsing can disable local storage. */
    }
  }
  for (const road of roadKeys) {
    const b = document.createElement("button");
    b.className = "pick";
    b.dataset.roadChoice = road;
    b.textContent = roadDetails[road][0];
    b.onclick = () => {
      settings.road = road;
      syncJourney();
    };
    $("#roadChoices").append(b);
  }
  const weatherTags = {
    sunny: "CLEAR SKIES",
    rain: "RAIN & LIGHTNING",
    snow: "WINTER SCENERY",
    night: "STARS & HEADLIGHTS",
  };
  for (const [weather, details] of Object.entries(weatherDetails)) {
    const b = document.createElement("button");
    b.className = "pick";
    b.dataset.weatherChoice = weather;
    const icon = document.createElement("span"),
      text = document.createElement("span"),
      title = document.createElement("strong"),
      tag = document.createElement("small");
    icon.className = "weatherIcon";
    icon.textContent = details[0].split(" ")[0];
    icon.setAttribute("aria-hidden", "true");
    title.textContent = details[0].substring(2);
    tag.textContent = weatherTags[weather];
    text.append(title, tag);
    b.append(icon, text);
    b.onclick = () => {
      settings.weather = weather;
      syncJourney();
    };
    $("#weatherChoices").append(b);
  }
  function syncExperience() {
    $("#riderPreview").hidden = !isBike;
    $("#riderPreview").setAttribute(
      "aria-pressed",
      String(preferences.riderPreview),
    );
    const stats = $("#vehicleStats");
    stats.replaceChildren();
    $("#carSpec").textContent = specs[settings.car];
    for (const [label, value] of [
      [
        "TOP SPEED",
        Math.round(vehiclePerformance[settings.car].speed * 3.6) + " KM/H",
      ],
      [
        "ACCELERATION",
        vehiclePerformance[settings.car].acceleration + " M/S\u00b2",
      ],
      [
        "HANDLING",
        vehiclePerformance[settings.car].handling >= 1.3
          ? "Agile"
          : vehiclePerformance[settings.car].handling >= 1.05
            ? "Balanced"
            : "Steady",
      ],
      [
        "TURBO",
        Math.round(vehiclePerformance[settings.car].speed * 1.45 * 3.6) +
          " KM/H",
      ],
    ]) {
      const item = document.createElement("div"),
        small = document.createElement("small"),
        strong = document.createElement("strong");
      small.textContent = label;
      strong.textContent = value;
      item.append(small, strong);
      stats.append(item);
    }
    markButtons("[data-road-choice]", "roadChoice", settings.road);
    markButtons("[data-weather-choice]", "weatherChoice", settings.weather);
    document
      .querySelectorAll(".mapPreview svg > path[stroke]")
      .forEach((path) => path.setAttribute("d", routeArt[settings.road]));
    $("#autoRotate").setAttribute("aria-pressed", String(orbit.auto));
    saveJourney();
  }
  $("#riderPreview").onclick = () => {
    preferences.riderPreview = !preferences.riderPreview;
    $("#riderPreview").setAttribute(
      "aria-pressed",
      String(preferences.riderPreview),
    );
    saveJourney();
  };
  $("#quickDriveBtn").onclick = () => showPage("ready");
  for (const road of roadKeys) {
    const option = document.createElement("option");
    option.value = road;
    option.textContent = roadDetails[road][0];
    $("#liveMapSelect").append(option);
  }
  $("#liveMapSelect").onchange = (e) => {
    changeLiveMap(e.target.value);
    e.target.blur();
  };
  $("#autoRotate").onclick = () => {
    orbit.auto = !orbit.auto;
    $("#autoRotate").setAttribute("aria-pressed", String(orbit.auto));
  };
  for (const name of ["pointerdown", "wheel"])
    listen(renderer.domElement, name, () =>
      $("#autoRotate").setAttribute("aria-pressed", String(orbit.auto)),
    );
  for (const id of ["rotateLeft", "rotateRight", "garageReset"])
    listen($("#" + id), "click", () =>
      $("#autoRotate").setAttribute("aria-pressed", String(orbit.auto)),
    );
  listen(document, "input", (e) => {
    if (e.target.id === "customColor") saveJourney();
  });
  listen(document, "click", (e) => {
    if (e.target.closest("[data-color],[data-rider]")) saveJourney();
  });
  function activeDialog() {
    return !$("#settingsOverlay").hidden
      ? $("#settingsOverlay")
      : !$("#results").hidden
        ? $("#results")
        : !$("#pauseOverlay").hidden
          ? $("#pauseOverlay")
          : null;
  }
  function syncDialogs() {
    const dialog = activeDialog();
    $("#lobby").inert = Boolean(dialog);
    $("#hud").inert = Boolean(dialog);
    $("#pauseOverlay").inert = Boolean(dialog && dialog !== $("#pauseOverlay"));
    $("#results").inert = Boolean(dialog && dialog !== $("#results"));
    if (!$("#pauseOverlay").hidden)
      $("#pauseSummary").textContent =
        carNames[settings.car] +
        " / " +
        roadDetails[settings.road][0] +
        " / " +
        modeNames[settings.mode];
    if (dialog && !dialog.contains(document.activeElement))
      dialog.querySelector("input,select,button")?.focus();
  }
  const dialogObserver = new MutationObserver(syncDialogs);
  for (const id of ["pauseOverlay", "settingsOverlay", "results"])
    dialogObserver.observe($("#" + id), {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  listen(
    window,
    "keydown",
    (e) => {
      const dialog = activeDialog();
      if (dialog && e.code === "Tab") {
        const nodes = [
          ...dialog.querySelectorAll("input,select,button"),
        ].filter((el) => !el.disabled && !el.hidden);
        const first = nodes[0],
          last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          e.stopImmediatePropagation();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          e.stopImmediatePropagation();
          first.focus();
        }
        return;
      }
      if (dialog === $("#pauseOverlay") && e.code === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        resumeDrive();
        return;
      }
      if (
        state !== "lobby" ||
        dialog ||
        expandedPreview ||
        e.repeat ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      )
        return;
      if (e.target.closest("input,select,button,a")) return;
      if (e.code === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (pageName === "ready") beginDrive();
        else showPage(pageOrder[pageOrder.indexOf(pageName) + 1]);
        return;
      }
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        const delta = e.code === "ArrowLeft" ? -1 : 1;
        if (pageName === "vehicle") selectVehicle(settings.car + delta);
        else if (pageName === "maps") cycle("road", roadKeys, delta);
        else if (pageName === "weather") cycle("weather", weatherKeys, delta);
        else if (pageName === "mode") {
          cycle("mode", modeKeys, delta);
          markButtons("[data-mode]", "mode", settings.mode);
        } else return;
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  if (savedJourney && typeof savedJourney === "object") {
    const saved = savedJourney.settings || {};
    if (
      Number.isInteger(saved.car) &&
      saved.car >= 0 &&
      saved.car < vehicleCatalogue.length
    )
      settings.car = saved.car;
    if (Number.isInteger(saved.rider) && saved.rider >= 0 && saved.rider < 3)
      settings.rider = saved.rider;
    if (/^#[0-9a-f]{6}$/i.test(saved.color)) settings.color = saved.color;
    if (Object.hasOwn(roadDetails, saved.road)) settings.road = saved.road;
    if (Object.hasOwn(weatherDetails, saved.weather))
      settings.weather = saved.weather;
    if (Object.hasOwn(modeNames, saved.mode)) settings.mode = saved.mode;
    if (typeof savedJourney.preferences?.riderPreview === "boolean")
      preferences.riderPreview = savedJourney.preferences.riderPreview;
    if (typeof savedJourney.preferences?.sound === "boolean")
      preferences.sound = savedJourney.preferences.sound;
    if (["high", "low"].includes(savedJourney.preferences?.quality))
      preferences.quality = savedJourney.preferences.quality;
    if (
      Number.isInteger(savedJourney.cameraMode) &&
      savedJourney.cameraMode >= 0 &&
      savedJourney.cameraMode < cameraNames.length
    )
      cameraMode = savedJourney.cameraMode;
  }
  const entryVehicle = new URLSearchParams(location.search).get("vehicle");
  if (entryVehicle === "bike") settings.car = 4;
  else if (entryVehicle === "car") settings.car = 0;
  rebuildCar();
  resize();
  setPaint(
    settings.color,
    document.querySelector('[data-color="' + settings.color + '"]')?.dataset
      .name || "Custom finish",
  );
  orbit.auto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const [selector, property] of [
    ["[data-car]", "car"],
    ["[data-mode]", "mode"],
    ["[data-rider]", "rider"],
  ])
    markButtons(selector, property, settings[property]);

  showPage("home");

  // Compact icons use Unicode escapes so source encoding cannot corrupt them.
  for (const [id, icon, label] of [
    ["cameraBtn", "\u25c9", "Change camera"],
    ["sceneBtn", "\u2600", "Change weather"],
    ["resetBtn", "\u2316", "Center vehicle"],
    ["lobbyBtn", "\u2161", "Pause"],
    ["horn", "\u266a", "Horn"],
    ["auto", "A", "Automatic drive"],
    ["turbo", "\u03df", "Hold turbo"],
    ["reverse", "\u2193", "Reverse"],
    ["brake", "\u25a0", "Brake"],
    ["accel", "\u2191", "Accelerate"],
    ["expandPreview", "\u26f6", "Expand preview"],
    ["garageReset", "\u21ba", "Reset view"],
    ["autoRotate", "\u27f3", "Automatic rotation"],
    ["riderPreview", "\u265f", "Show rider"],
  ]) {
    const el = document.getElementById(id);
    el.dataset.icon = icon;
    el.setAttribute("aria-label", label);
    el.title = label;
  }
  for (const el of document.querySelectorAll("#steps button")) {
    el.dataset.icon = {
      home: "\u2302",
      vehicle: "\u25b0",
      maps: "\u2316",
      weather: "\u2600",
      mode: "\u2691",
      ready: "\u2713",
    }[el.dataset.page];
    el.setAttribute("aria-label", el.textContent.trim());
    el.title = el.textContent.trim();
  }

  animate();
  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    events.abort();
    dialogObserver.disconnect();
    clearInput();
    stopThunder();
    if (audioContext) void audioContext.close().catch(() => {});
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    scene.traverse((node) => {
      if (node.geometry) geometries.add(node.geometry);
      for (const material of Array.isArray(node.material)
        ? node.material
        : node.material
          ? [node.material]
          : []) {
        materials.add(material);
        for (const value of Object.values(material))
          if (value?.isTexture) textures.add(value);
      }
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    delete window.__roadPlateMaterial;
    delete window.__commuterBadges;
    document.body.classList.remove("previewExpanded");
    delete document.body.dataset.page;
  };
}
