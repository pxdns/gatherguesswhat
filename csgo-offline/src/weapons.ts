import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r185/build/three.module.js';

export interface WeaponData {
  name: string;
  type: 'rifle' | 'pistol' | 'sniper' | 'smg' | 'shotgun' | 'knife';
  damage: number;
  fireRate: number; // rounds per second
  accuracy: number; // 0-1
  recoil: number; // vertical recoil multiplier
  magazine: number;
  reserve: number;
  price: number;
  scope: boolean;
  armor_penetration: number; // 0-1
  range: number; // meters
}

const WEAPONS_DATABASE: Record<string, WeaponData> = {
  ak47: {
    name: 'AK-47',
    type: 'rifle',
    damage: 31,
    fireRate: 10,
    accuracy: 0.65,
    recoil: 2.5,
    magazine: 30,
    reserve: 90,
    price: 2700,
    scope: false,
    armor_penetration: 0.77,
    range: 100,
  },
  m4a1: {
    name: 'M4A1',
    type: 'rifle',
    damage: 21,
    fireRate: 13.33,
    accuracy: 0.8,
    recoil: 1.8,
    magazine: 30,
    reserve: 90,
    price: 2900,
    scope: false,
    armor_penetration: 0.7,
    range: 100,
  },
  awp: {
    name: 'AWP Dragon Lore',
    type: 'sniper',
    damage: 115,
    fireRate: 1.15,
    accuracy: 0.98,
    recoil: 0.5,
    magazine: 10,
    reserve: 30,
    price: 4750,
    scope: true,
    armor_penetration: 0.86,
    range: 200,
  },
  deagle: {
    name: 'Desert Eagle',
    type: 'pistol',
    damage: 63,
    fireRate: 1.5,
    accuracy: 0.81,
    recoil: 1.5,
    magazine: 7,
    reserve: 35,
    price: 700,
    scope: false,
    armor_penetration: 0.81,
    range: 80,
  },
  glock: {
    name: 'Glock-18',
    type: 'pistol',
    damage: 18,
    fireRate: 15,
    accuracy: 0.5,
    recoil: 2.0,
    magazine: 20,
    reserve: 120,
    price: 0,
    scope: false,
    armor_penetration: 0.49,
    range: 50,
  },
  mp5: {
    name: 'MP5-SD',
    type: 'smg',
    damage: 25,
    fireRate: 15,
    accuracy: 0.65,
    recoil: 2.2,
    magazine: 30,
    reserve: 120,
    price: 1500,
    scope: false,
    armor_penetration: 0.69,
    range: 60,
  },
  ump45: {
    name: 'UMP-45',
    type: 'smg',
    damage: 35,
    fireRate: 9.1,
    accuracy: 0.7,
    recoil: 2.0,
    magazine: 25,
    reserve: 100,
    price: 1200,
    scope: false,
    armor_penetration: 0.63,
    range: 60,
  },
  xm1014: {
    name: 'XM1014',
    type: 'shotgun',
    damage: 20,
    fireRate: 2.25,
    accuracy: 0.4,
    recoil: 3.5,
    magazine: 7,
    reserve: 32,
    price: 2000,
    scope: false,
    armor_penetration: 0.3,
    range: 30,
  },
  nova: {
    name: 'Nova',
    type: 'shotgun',
    damage: 26,
    fireRate: 1.5,
    accuracy: 0.3,
    recoil: 3.0,
    magazine: 8,
    reserve: 32,
    price: 1050,
    scope: false,
    armor_penetration: 0.25,
    range: 30,
  },
  knife: {
    name: 'Knife',
    type: 'knife',
    damage: 40,
    fireRate: 1,
    accuracy: 1.0,
    recoil: 0,
    magazine: 1,
    reserve: 999,
    price: 0,
    scope: false,
    armor_penetration: 1.0,
    range: 2,
  },
};

export class Weapon {
  private data: WeaponData;
  private magazine: number;
  private reserve: number;
  private isFiring = false;
  private isReloading = false;
  private isScoped = false;
  private timeSinceLastShot = 0;
  private recoilAccumulation = 0;
  private isEquipped = false;
  private inspecting = false;
  private inspectTime = 0;

  constructor(weaponId: string) {
    this.data = WEAPONS_DATABASE[weaponId];
    if (!this.data) {
      throw new Error(`Weapon not found: ${weaponId}`);
    }
    this.magazine = this.data.magazine;
    this.reserve = this.data.reserve;
  }

  public update(delta: number, isCrouching: boolean, isSprinting: boolean) {
    this.timeSinceLastShot += delta;

    if (this.isReloading) {
      // Reload is handled by reload() method completion
    }

    if (this.inspecting) {
      this.inspectTime += delta;
      if (this.inspectTime > 2) {
        this.inspecting = false;
      }
    }

    // Reduce recoil over time
    this.recoilAccumulation *= 0.95;
  }

  public fire(): boolean {
    if (!this.canFire()) return false;

    const fireInterval = 1 / this.data.fireRate;
    if (this.timeSinceLastShot < fireInterval) return false;

    this.magazine--;
    this.timeSinceLastShot = 0;

    // Accumulate recoil
    this.recoilAccumulation += this.data.recoil * 0.1;

    return true;
  }

  public canFire(): boolean {
    return this.magazine > 0 && !this.isReloading && this.isEquipped;
  }

  public reload() {
    if (this.isReloading || this.magazine === this.data.magazine) return;

    this.isReloading = true;

    // Simulate reload time
    const reloadTime = this.data.type === 'sniper' ? 3 : this.data.type === 'shotgun' ? 0.5 : 2.5;

    setTimeout(() => {
      const ammoNeeded = this.data.magazine - this.magazine;
      const ammoAvailable = Math.min(ammoNeeded, this.reserve);

      this.magazine += ammoAvailable;
      this.reserve -= ammoAvailable;
      this.isReloading = false;
    }, reloadTime * 1000);
  }

  public toggleScope() {
    if (this.data.scope) {
      this.isScoped = !this.isScoped;
    }
  }

  public isWeaponScoped(): boolean {
    return this.isScoped;
  }

  public startFiring() {
    this.isFiring = true;
  }

  public stopFiring() {
    this.isFiring = false;
  }

  public equip() {
    this.isEquipped = true;
  }

  public holster() {
    this.isEquipped = false;
    this.stopFiring();
    this.isScoped = false;
  }

  public inspect() {
    this.inspecting = true;
    this.inspectTime = 0;
  }

  public getDamage(): number {
    return this.data.damage;
  }

  public getAccuracy(): number {
    // Reduce accuracy when firing
    if (this.isFiring) {
      return this.data.accuracy * (1 - this.recoilAccumulation * 0.5);
    }
    return this.data.accuracy;
  }

  public getRecoil(): number {
    return this.recoilAccumulation;
  }

  public getAmmoCount() {
    return { magazine: this.magazine, reserve: this.reserve };
  }

  public getWeaponData(): WeaponData {
    return this.data;
  }

  public getName(): string {
    return this.data.name;
  }

  public isFiringNow(): boolean {
    return this.isFiring && this.canFire();
  }

  public isReloadingNow(): boolean {
    return this.isReloading;
  }

  public isScoped(): boolean {
    return this.isScoped && this.data.scope;
  }

  public getPrice(): number {
    return this.data.price;
  }
}

export class WeaponSystem {
  public createWeapon(weaponId: string): Weapon {
    return new Weapon(weaponId);
  }

  public getAllWeapons(): string[] {
    return Object.keys(WEAPONS_DATABASE);
  }

  public getWeaponData(weaponId: string): WeaponData | null {
    return WEAPONS_DATABASE[weaponId] || null;
  }
}
