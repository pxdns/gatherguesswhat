import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r185/build/three.module.js';
import { Player } from './player';
import { Bot } from './bot';
import { WeaponSystem } from './weapons';
import { Map } from './map';
import { GameMode } from './gamemodes';

export interface GameState {
  players: Player[];
  bots: Bot[];
  round: number;
  time: number;
  gamemode: GameMode;
  isPaused: boolean;
  stats: GameStats;
}

export interface GameStats {
  kills: number;
  deaths: number;
  headshots: number;
  accuracy: number;
  shots: number;
  hits: number;
}

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private state: GameState;
  private player: Player;
  private map: Map;
  private weaponSystem: WeaponSystem;
  private clock: THREE.Clock;
  private animationId: number | null = null;

  constructor(
    canvasElement: HTMLCanvasElement,
    gamemode: GameMode,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ) {
    // Three.js setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);
    this.scene.fog = new THREE.Fog(0x1a1a1a, 100, 500);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Game initialization
    this.map = new Map(this.scene);
    this.weaponSystem = new WeaponSystem();
    this.clock = new THREE.Clock();

    this.player = new Player(this.camera, this.weaponSystem);
    this.scene.add(this.player.getGroup());

    this.state = {
      players: [this.player],
      bots: this.createBots(gamemode.botCount, difficulty),
      round: 1,
      time: gamemode.roundTime,
      gamemode,
      isPaused: false,
      stats: {
        kills: 0,
        deaths: 0,
        headshots: 0,
        accuracy: 0,
        shots: 0,
        hits: 0,
      },
    };

    // Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('keydown', (e) => this.player.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.player.handleKeyUp(e));
    window.addEventListener('mousemove', (e) => this.player.handleMouseMove(e));
    window.addEventListener('mousedown', (e) => this.player.handleMouseDown(e));
    window.addEventListener('mouseup', (e) => this.player.handleMouseUp(e));
    window.addEventListener('wheel', (e) => this.player.handleWheel(e));

    this.start();
  }

  private createBots(count: number, difficulty: 'easy' | 'medium' | 'hard' | 'expert'): Bot[] {
    const bots: Bot[] = [];
    const spawnPoints = this.map.getBotSpawnPoints();

    for (let i = 0; i < count && i < spawnPoints.length; i++) {
      const bot = new Bot(
        `Bot_${i}`,
        spawnPoints[i],
        difficulty,
        this.weaponSystem,
        this.scene,
        this.camera
      );
      bots.push(bot);
    }

    return bots;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    if (!this.state.isPaused) {
      const delta = this.clock.getDelta();

      // Update player
      this.player.update(delta);

      // Update bots
      this.state.bots.forEach((bot) => {
        bot.update(delta, this.player, this.state.bots);
      });

      // Update game time
      this.state.time -= delta;
      if (this.state.time <= 0) {
        this.roundEnd();
      }

      // Update HUD
      this.updateHUD();
    }

    this.renderer.render(this.scene, this.camera);
  };

  private updateHUD() {
    const kills = document.querySelector('.session-score div:nth-child(1) b');
    const accuracy = document.querySelector('.session-score div:nth-child(2) b');
    const headshots = document.querySelector('.session-score div:nth-child(3) b');
    const timer = document.querySelector('.hud-timer');
    const health = document.querySelector('.health-block b');
    const ammo = document.querySelector('.ammo-block div b');
    const healthBar = document.querySelector('.health-bar i') as HTMLElement;

    if (kills) kills.textContent = String(this.state.stats.kills);
    if (accuracy) {
      const accuracyPercent = this.state.stats.shots > 0 ? 
        Math.round((this.state.stats.hits / this.state.stats.shots) * 100) : 0;
      accuracy.innerHTML = `${accuracyPercent}<i>%</i>`;
    }
    if (headshots) headshots.textContent = String(this.state.stats.headshots);
    if (timer) timer.textContent = `${Math.floor(this.state.time / 60)}:${String(Math.floor(this.state.time % 60)).padStart(2, '0')}`;
    if (health) health.textContent = String(Math.max(0, this.player.getHealth()));
    if (healthBar && this.player.getHealth() > 0) {
      healthBar.style.width = `${(this.player.getHealth() / 100) * 100}%`;
    }

    const currentWeapon = this.player.getCurrentWeapon();
    if (ammo && currentWeapon) {
      const ammoData = currentWeapon.getAmmoCount();
      ammo.textContent = String(ammoData.magazine);
    }
  }

  private roundEnd() {
    this.state.isPaused = true;
    console.log('Round ended');
    // TODO: Show round end screen, restart countdown
  }

  private start() {
    this.animate();
  }

  public pause() {
    this.state.isPaused = true;
  }

  public resume() {
    this.state.isPaused = false;
  }

  public restart() {
    this.state.time = this.state.gamemode.roundTime;
    this.state.round += 1;
    this.state.isPaused = false;
    this.player.resetHealth();
    this.state.bots.forEach((bot) => bot.reset());
  }

  private onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public getState(): GameState {
    return this.state;
  }

  public addKill(isHeadshot: boolean = false) {
    this.state.stats.kills++;
    if (isHeadshot) this.state.stats.headshots++;
  }

  public recordShot(hit: boolean) {
    this.state.stats.shots++;
    if (hit) this.state.stats.hits++;
  }

  public dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
  }
}
