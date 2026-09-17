import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r185/build/three.module.js';

export class Map {
  private scene: THREE.Scene;
  private botSpawnPoints: THREE.Vector3[] = [];
  private playerSpawnPoint: THREE.Vector3;
  private environment: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.environment = new THREE.Group();
    this.playerSpawnPoint = new THREE.Vector3(0, 1.6, -10);

    // Initialize spawn points for bots (positioned around the map)
    this.botSpawnPoints = [
      new THREE.Vector3(-20, 1, 20),
      new THREE.Vector3(20, 1, 20),
      new THREE.Vector3(-20, 1, -20),
      new THREE.Vector3(20, 1, -20),
      new THREE.Vector3(0, 1, 30),
      new THREE.Vector3(0, 1, -30),
      new THREE.Vector3(-30, 1, 0),
      new THREE.Vector3(30, 1, 0),
    ];

    this.buildDustII();
    this.scene.add(this.environment);
  }

  private buildDustII() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8b8b6f });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.environment.add(ground);

    // Walls and structures
    this.createWalls();

    // Sky
    this.createSky();

    // Lighting details
    this.createLights();
  }

  private createWalls() {
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xa0a080 });
    const wallMaterialDark = new THREE.MeshLambertMaterial({ color: 0x5a5a4a });

    // A site wall
    const wallA = new THREE.Mesh(
      new THREE.BoxGeometry(40, 5, 1),
      wallMaterial
    );
    wallA.position.set(-40, 2.5, 0);
    wallA.castShadow = true;
    wallA.receiveShadow = true;
    this.environment.add(wallA);

    // B site wall
    const wallB = new THREE.Mesh(
      new THREE.BoxGeometry(40, 5, 1),
      wallMaterial
    );
    wallB.position.set(40, 2.5, 0);
    wallB.castShadow = true;
    wallB.receiveShadow = true;
    this.environment.add(wallB);

    // Center cover boxes
    for (let i = -2; i <= 2; i++) {
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(8, 3, 8),
        wallMaterialDark
      );
      cover.position.set(i * 15, 1.5, 5);
      cover.castShadow = true;
      cover.receiveShadow = true;
      this.environment.add(cover);
    }

    // Pillars for additional cover
    for (let x = -30; x <= 30; x += 20) {
      for (let z = -30; z <= 30; z += 20) {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(1, 1, 6, 8),
          wallMaterialDark
        );
        pillar.position.set(x, 3, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        this.environment.add(pillar);
      }
    }

    // Boundaries (invisible walls to keep players in map)
    const boundaryMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });

    const boundaryWalls = [
      { pos: new THREE.Vector3(0, 25, -80), size: new THREE.Vector3(200, 50, 10) },
      { pos: new THREE.Vector3(0, 25, 80), size: new THREE.Vector3(200, 50, 10) },
      { pos: new THREE.Vector3(-80, 25, 0), size: new THREE.Vector3(10, 50, 200) },
      { pos: new THREE.Vector3(80, 25, 0), size: new THREE.Vector3(10, 50, 200) },
    ];

    boundaryWalls.forEach((wall) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(wall.size.x, wall.size.y, wall.size.z),
        boundaryMaterial
      );
      mesh.position.copy(wall.pos);
      mesh.receiveShadow = true;
      this.environment.add(mesh);
    });
  }

  private createSky() {
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.environment.add(sky);
  }

  private createLights() {
    // Additional point lights for atmosphere
    const lights = [
      new THREE.Vector3(-30, 20, -30),
      new THREE.Vector3(30, 20, 30),
      new THREE.Vector3(-30, 20, 30),
      new THREE.Vector3(30, 20, -30),
    ];

    lights.forEach((pos) => {
      const light = new THREE.PointLight(0xffaa66, 0.3, 100);
      light.position.copy(pos);
      this.environment.add(light);
    });
  }

  public getBotSpawnPoints(): THREE.Vector3[] {
    return this.botSpawnPoints.map((p) => p.clone());
  }

  public getPlayerSpawnPoint(): THREE.Vector3 {
    return this.playerSpawnPoint.clone();
  }

  public getEnvironment(): THREE.Group {
    return this.environment;
  }
}
