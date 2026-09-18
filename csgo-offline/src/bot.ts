import * as THREE from 'three';
import { Weapon } from './weapons';
import { WeaponSystem } from './weapons';
import { Player } from './player';

interface BotDifficultySettings {
  reactionTime: number; // seconds
  aimAccuracy: number; // 0-1
  headShotChance: number; // 0-1
  detectionRange: number; // meters
  searchRadius: number; // meters
  shootDelay: number; // seconds before taking a shot
}

const DIFFICULTY_PRESETS: Record<string, BotDifficultySettings> = {
  easy: {
    reactionTime: 1.0,
    aimAccuracy: 0.4,
    headShotChance: 0.1,
    detectionRange: 30,
    searchRadius: 50,
    shootDelay: 0.5,
  },
  medium: {
    reactionTime: 0.5,
    aimAccuracy: 0.7,
    headShotChance: 0.3,
    detectionRange: 60,
    searchRadius: 100,
    shootDelay: 0.2,
  },
  hard: {
    reactionTime: 0.2,
    aimAccuracy: 0.85,
    headShotChance: 0.5,
    detectionRange: 100,
    searchRadius: 150,
    shootDelay: 0.1,
  },
  expert: {
    reactionTime: 0.05,
    aimAccuracy: 0.95,
    headShotChance: 0.8,
    detectionRange: 150,
    searchRadius: 200,
    shootDelay: 0.05,
  },
};

export class Bot {
  private name: string;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private health = 100;
  private armor = 100;
  private difficulty: BotDifficultySettings;
  private weaponSystem: WeaponSystem;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private weapons: Weapon[] = [];
  private currentWeaponIndex = 0;
  private targetPlayer: Player | null = null;
  private lastShotTime = 0;
  private lastSearchTime = 0;
  private searchInterval = 2;
  private aimOffset: THREE.Vector3 = new THREE.Vector3();
  private reactionTimer = 0;
  private isReacting = false;
  private speed = 5;
  private group: THREE.Group;

  constructor(
    name: string,
    spawnPosition: THREE.Vector3,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    weaponSystem: WeaponSystem,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    this.name = name;
    this.position = spawnPosition.clone();
    this.difficulty = DIFFICULTY_PRESETS[difficulty];
    this.weaponSystem = weaponSystem;
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // Initialize weapons
    const weaponList = ['ak47', 'deagle', 'awp', 'knife'];
    this.weapons = weaponList.map((w) => this.weaponSystem.createWeapon(w));
    this.equip(0);

    // Add simple bot visual (red cube for now, can replace with model later)
    const botMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.8, 0.5),
      new THREE.MeshPhongMaterial({ color: 0xff4444 })
    );
    botMesh.position.y = 0.9;
    botMesh.castShadow = true;
    this.group.add(botMesh);

    this.scene.add(this.group);
  }

  public update(delta: number, player: Player, otherBots: Bot[]) {
    // Search for player
    if (Date.now() / 1000 - this.lastSearchTime > this.searchInterval) {
      this.searchForTarget(player, otherBots);
      this.lastSearchTime = Date.now() / 1000;
    }

    // Handle reaction time
    if (this.isReacting) {
      this.reactionTimer -= delta;
      if (this.reactionTimer <= 0) {
        this.isReacting = false;
      }
    }

    if (this.targetPlayer && !this.isReacting) {
      const distance = this.position.distanceTo(this.targetPlayer.getPosition());

      // If target is within range, aim and shoot
      if (distance < this.difficulty.detectionRange) {
        this.aimAtTarget(player);
        this.shootAtTarget(player);
      } else {
        this.moveTowardTarget(player);
      }
    } else {
      // Patrol or stand idle
      this.patrol();
    }

    // Update position
    this.group.position.copy(this.position);
  }

  private searchForTarget(player: Player, otherBots: Bot[]) {
    const playerDistance = this.position.distanceTo(player.getPosition());

    if (playerDistance < this.difficulty.detectionRange) {
      // Line of sight check
      if (this.hasLineOfSight(player.getPosition())) {
        this.targetPlayer = player;
        this.isReacting = true;
        this.reactionTimer = this.difficulty.reactionTime;
      }
    } else {
      this.targetPlayer = null;
    }
  }

  private hasLineOfSight(targetPos: THREE.Vector3): boolean {
    // Simplified line of sight - in real implementation would do raycasting
    const direction = targetPos.clone().sub(this.position);
    const distance = direction.length();
    direction.normalize();

    // Check if target is roughly in front of bot
    const forward = new THREE.Vector3(0, 0, -1);
    const dot = forward.dot(direction);

    return dot > 0.3 && distance < this.difficulty.detectionRange;
  }

  private aimAtTarget(player: Player) {
    if (!this.targetPlayer) return;

    const targetPos = player.getPosition();
    const botToTarget = targetPos.clone().sub(this.position);

    // Add aim error based on difficulty
    const aimError = (1 - this.difficulty.aimAccuracy) * 2;
    this.aimOffset.x = (Math.random() - 0.5) * aimError;
    this.aimOffset.y = (Math.random() - 0.5) * aimError + 0.2; // Slight upward bias for headshots
    this.aimOffset.z = (Math.random() - 0.5) * aimError;

    botToTarget.add(this.aimOffset);
  }

  private shootAtTarget(player: Player) {
    const now = Date.now() / 1000;
    const timeSinceLastShot = now - this.lastShotTime;

    if (timeSinceLastShot > this.difficulty.shootDelay) {
      const weapon = this.weapons[this.currentWeaponIndex];
      if (weapon) {
        // Simulate shooting with weapon recoil and accuracy
        const canShoot = Math.random() > 0.3; // Bot doesn't always hit

        if (canShoot && weapon.canFire()) {
          weapon.fire();
          this.lastShotTime = now;

          // Simulate damage to player
          const distance = this.position.distanceTo(player.getPosition());
          if (distance < 100) {
            const damage = weapon.getDamage() / (1 + distance * 0.05);
            const isHeadshot = Math.random() < this.difficulty.headShotChance;
            player.takeDamage(damage, isHeadshot);
          }
        }
      }
    }
  }

  private moveTowardTarget(player: Player) {
    if (!this.targetPlayer) return;

    const targetPos = player.getPosition();
    const direction = targetPos.clone().sub(this.position);
    direction.y = 0; // Only move horizontally
    direction.normalize();

    this.velocity = direction.multiplyScalar(this.speed);
    this.position.add(this.velocity.clone().multiplyScalar(1 / 60)); // Assuming 60 FPS
  }

  private patrol() {
    // Simple idle behavior - stand and look around
    if (Math.random() < 0.01) {
      // Occasionally walk
      const randomDirection = new THREE.Vector3(
        Math.random() - 0.5,
        0,
        Math.random() - 0.5
      );
      randomDirection.normalize();
      this.velocity = randomDirection.multiplyScalar(this.speed * 0.5);
    } else {
      this.velocity.multiplyScalar(0.95); // Decelerate
    }

    this.position.add(this.velocity.clone().multiplyScalar(1 / 60));
  }

  private equip(index: number) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
    }
  }

  public takeDamage(damage: number, isHeadshot: boolean = false) {
    const finalDamage = isHeadshot ? damage * 2 : damage;

    if (this.armor > 0) {
      const armorReduction = finalDamage * 0.75;
      this.armor -= armorReduction;
      this.health -= finalDamage * 0.25;
    } else {
      this.health -= finalDamage;
    }

    this.health = Math.max(0, this.health);
  }

  public getHealth(): number {
    return this.health;
  }

  public getPosition(): THREE.Vector3 {
    return this.position;
  }

  public getName(): string {
    return this.name;
  }

  public isDead(): boolean {
    return this.health <= 0;
  }

  public reset() {
    this.health = 100;
    this.armor = 100;
    this.targetPlayer = null;
    this.aimOffset.set(0, 0, 0);
  }

  public dispose() {
    this.scene.remove(this.group);
    this.group.clear();
  }
}
