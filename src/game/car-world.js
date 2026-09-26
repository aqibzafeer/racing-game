// Additional route scenery. All assets are local and procedurally generated.
export default function createCarWorld(THREE, box, material) {
  const stone = material(0x767c79),
    sandstone = material(0xcf8156),
    pine = material(0x27844e),
    trunk = material(0x675242),
    snowcap = material(0xdce4e5);
  const facades = [material(0x8fc9dc), material(0xe5bf8a), material(0x6aabc8)];
  const windows = material(0x314c5f, 0.18, 0.35),
    lamp = material(0xe5e8d8, 0.3);
  const mountainGeometry = new THREE.ConeGeometry(1, 1, 7);
  mountainGeometry.userData.shared = true;
  const crownGeometry = new THREE.ConeGeometry(1, 1, 8);
  crownGeometry.userData.shared = true;
  function peak(group, x, z, r, h, m) {
    const mesh = new THREE.Mesh(mountainGeometry, m);
    mesh.position.set(x, h / 2 - 1, z);
    mesh.scale.set(r, h, r * 0.85);
    mesh.rotation.y = z * 0.017;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }
  function decorate(g, index, road, point, frame) {
    const from = index * 100;
    if (road === "city")
      for (const side of [-1, 1])
        for (let i = 0; i < 3; i++) {
          const p = frame(from + 16 + i * 32, side * (29 + (i % 2) * 9)),
            h = 12 + (Math.abs(index * 7 + i * 3) % 6) * 4,
            building = new THREE.Group();
          building.position.set(p.x, 0, p.z);
          g.add(building);
          box(
            building,
            [12, h, 16],
            [0, h / 2, 0],
            facades[(Math.abs(index) + i) % 3],
          );
          box(building, [12.7, 0.4, 16.7], [0, 0.2, 0], facades[0]);
          box(building, [4, 2, 5], [1, h + 1, 1], facades[2]);
          for (let y = 3; y < h - 1; y += 3)
            for (const z of [-5, 0, 5])
              box(building, [0.05, 1.55, 2.1], [-side * 6.025, y, z], windows);
          for (let y = 3; y < h - 1; y += 3)
            for (const x of [-3.8, 0, 3.8])
              box(building, [1.7, 1.55, 0.05], [x, y, -8.025], windows);
          building.userData.halfWidth = 6;
          building.userData.halfLength = 8;
          (g.userData.buildings ||= []).push(building);
        }
    if (road === "mountains")
      for (const side of [-1, 1])
        for (let i = 0; i < 3; i++) {
          const d = from + i * 35,
            p = frame(d, side * (85 + (i % 2) * 45)),
            h = 45 + (Math.abs(index * 13 + i * 19) % 45),
            r = 36 + (i % 2) * 13;
          peak(g, p.x, p.z, r, h, stone);
          const cap = peak(g, p.x, p.z, r * 0.36, h * 0.32, snowcap);
          cap.position.y = h * 0.84 - 1;
        }
    if (road === "canyon")
      for (const side of [-1, 1])
        for (let i = 0; i < 4; i++) {
          const p = frame(from + i * 25, side * (48 + (i % 2) * 9)),
            h = 22 + Math.abs(Math.sin(index + i)) * 20;
          box(g, [21, h, 27], [p.x, h / 2 - 1, p.z], sandstone);
          box(g, [24, 2, 28], [p.x, h * 0.65, p.z], facades[1]);
        }
    if (road === "forest" || road === "mountains")
      for (let i = 0; i < (road === "forest" ? 32 : 10); i++) {
        const d = from + ((i * 13) % 100),
          side = i % 2 ? 1 : -1,
          p = frame(
            d,
            side * (23 + Math.abs(Math.sin(index * 9 + i * 31)) * 90),
          ),
          h = 6 + Math.abs(Math.sin(i + index)) * 4;
        box(g, [0.34, h * 0.5, 0.34], [p.x, h * 0.25, p.z], trunk);
        for (let tier = 0; tier < 2; tier++) {
          const m = new THREE.Mesh(crownGeometry, pine);
          m.position.set(p.x, h * 0.6 + tier * 1.6, p.z);
          m.scale.set(2.2 - tier * 0.5, h * 0.7, 2.2 - tier * 0.5);
          m.castShadow = true;
          g.add(m);
        }
      }
  }
  function setWeather(weather) {
    const sunny = weather === "sunny";
    const colors = sunny
      ? [0x57c5e3, 0xffcb78, 0x73afd8]
      : [0x8fc9dc, 0xe5bf8a, 0x6aabc8];
    facades.forEach((facade, i) => facade.color.set(colors[i]));
    pine.color.set(sunny ? 0x178c42 : 0x27844e);
    sandstone.color.set(sunny ? 0xe78a48 : 0xcf8156);
    windows.emissive.set(weather === "night" ? 0xffc77b : 0x000000);
    windows.emissiveIntensity = weather === "night" ? 0.65 : 0;
    lamp.emissive.set(weather === "night" ? 0xffe9b5 : 0x000000);
  }
  return { decorate, setWeather };
}
