import * as THREE from 'three';
import { Weapon } from './weapons';
import { WeaponSystem } from './weapons';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private group: THREE.Group;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private speed = 7; // meters per second
  private sprintSpeed = 12;
  private crouchSpeed = 3.5;
  private health = 100;
  private armor = 100;
  private keys: Record<string, boolean> = {};
  private weaponSystem: WeaponSystem;
  private currentWeaponIndex = 0;
  private weapons: Weapon[] = [];
  private isSprinting = false;
  private isCrouching = false;
  private mouseX = 0;
  private mouseY = 0;
  private yaw = 0;
  private pitch = 0;
  private sensitivity = 0.005;
  private groundLevel = 0;
  private isGrounded = true;
  private gravity = 25;
  private jumpPower = 8;
  private lastJumpTime = 0;
  private jumpCooldown = 0.5;

  constructor(camera: THREE.PerspectiveCamera, weaponSystem: WeaponSystem) {
    this.camera = camera;
    this.weaponSystem = weaponSystem;
    this.group = new THREE.Group();
    this.group.add(camera);

    // Initialize weapons
    this.weapons = [
      this.weaponSystem.createWeapon('ak47'),
      this.weaponSystem.createWeapon('deagle'),
      this.weaponSystem.createWeapon('knife'),
    ];

    // Equip first weapon
    this.equip(0);

    // Lock pointer on click
    document.addEventListener('click', () => {
      document.body.requestPointerLock =
        (document.body as any).requestPointerLock || (document.body as any).mozRequestPointerLock;
      document.body.requestPointerLock();
    });

    // Handle pointer lock change
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement) {
        console.log('Pointer lock lost');
      }
    });

    // Mouse move listener for aiming
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (document.pointerLockElement) {
        this.yaw -= e.movementX * this.sensitivity;
        this.pitch -= e.movementY * this.sensitivity;

        // Clamp pitch to prevent looking too far up/down
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.updateCameraRotation();
      }
    });
  }

  private updateCameraRotation() {
    // Apply yaw (left/right)
    this.group.rotation.y = this.yaw;

    // Apply pitch (up/down) to camera only
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  public handleKeyDown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    this.keys[key] = true;

    // Weapon switching
    if (key === '1') this.equip(0);
    if (key === '2') this.equip(1);
    if (key === '3') this.equip(2);

    // Sprint
    if (key === 'shift') this.isSprinting = true;

    // Crouch
    if (key === 'control' || key === 'c') {
      this.isCrouching = !this.isCrouching;
    }

    // Jump
    if (key === ' ' || key === 'arrowright') {
      const now = Date.now() / 1000;
      if (this.isGrounded && now - this.lastJumpTime > this.jumpCooldown) {
        this.velocity.y = this.jumpPower;
        this.isGrounded = false;
        this.lastJumpTime = now;
      }
    }

    // Reload
    if (key === 'r') {
      if (this.currentWeapon) {
        this.currentWeapon.reload();
      }
    }

    // Inspect weapon
    if (key === 'f') {
      if (this.currentWeapon) {
        this.currentWeapon.inspect();
      }
    }
  }

  public handleKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    this.keys[key] = false;

    // Sprint
    if (key === 'shift') this.isSprinting = false;
  }

  public handleMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  public handleMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      // Left click - fire
      if (this.currentWeapon) {
        this.currentWeapon.startFiring();
      }
    } else if (e.button === 2) {
      // Right click - scope/alt fire
      if (this.currentWeapon) {
        this.currentWeapon.toggleScope();
      }
    }
  }

  public handleMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      if (this.currentWeapon) {
        this.currentWeapon.stopFiring();
      }
    }
  }

  public handleWheel(e: WheelEvent) {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Scroll up
      this.equip((this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length);
    } else {
      // Scroll down
      this.equip((this.currentWeaponIndex + 1) % this.weapons.length);
    }
  }

  public update(delta: number) {
    // Movement
    const moveDirection = new THREE.Vector3();

    if (this.keys['w']) moveDirection.z += 1;
    if (this.keys['s']) moveDirection.z -= 1;
    if (this.keys['a']) moveDirection.x -= 1;
    if (this.keys['d']) moveDirection.x += 1;

    moveDirection.normalize();

    // Apply movement direction relative to player rotation
    const rotatedMovement = new THREE.Vector3();
    rotatedMovement.setFromMatrixColumn(this.group.matrix, 0).multiplyScalar(moveDirection.x);
    rotatedMovement.addScaledVector(
      new THREE.Vector3(0, 0, 0),
      moveDirection.z * Math.cos(this.yaw) - moveDirection.x * Math.sin(this.yaw)
    );
    rotatedMovement.y = 0;

    // Determine movement speed
    let currentSpeed = this.speed;
    if (this.isSprinting && moveDirection.length() > 0) {
      currentSpeed = this.sprintSpeed;
    }
    if (this.isCrouching) {
      currentSpeed = this.crouchSpeed;
    }

    // Apply movement
    this.velocity.x = moveDirection.x * currentSpeed * Math.cos(this.yaw) - moveDirection.z * currentSpeed * Math.sin(this.yaw);
    this.velocity.z = moveDirection.x * currentSpeed * Math.sin(this.yaw) + moveDirection.z * currentSpeed * Math.cos(this.yaw);

    // Apply gravity
    this.velocity.y -= this.gravity * delta;

    // Update position
    this.group.position.add(this.velocity.clone().multiplyScalar(delta));

    // Ground collision
    if (this.group.position.y <= this.groundLevel) {
      this.group.position.y = this.groundLevel;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Update weapon
    if (this.currentWeapon) {
      this.currentWeapon.update(delta, this.isCrouching, this.isSprinting);
    }

    // Update camera FOV for scope
    if (this.currentWeapon && this.currentWeapon.isScoped()) {
      this.camera.fov = 30;
    } else {
      this.camera.fov = 75;
    }
    this.camera.updateProjectionMatrix();
  }

  public equip(index: number) {
    if (index >= 0 && index < this.weapons.length) {
      if (this.currentWeapon) {
        this.currentWeapon.holster();
      }
      this.currentWeaponIndex = index;
      this.currentWeapon = this.weapons[index];
      this.currentWeapon.equip();
    }
  }

  get currentWeapon(): Weapon | null {
    return this.weapons[this.currentWeaponIndex];
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

  public heal(amount: number) {
    this.health = Math.min(100, this.health + amount);
  }

  public resetHealth() {
    this.health = 100;
    this.armor = 100;
  }

  public getHealth(): number {
    return this.health;
  }

  public getArmor(): number {
    return this.armor;
  }

  public isDead(): boolean {
    return this.health <= 0;
  }

  public getCurrentWeapon(): Weapon | null {
    return this.currentWeapon;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position;
  }

  public getDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    return direction;
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public setSensitivity(sens: number) {
    this.sensitivity = sens * 0.001;
  }
}
