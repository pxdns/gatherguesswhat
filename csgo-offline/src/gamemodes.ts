export interface GameMode {
  name: string;
  botCount: number;
  roundTime: number;
  teamBased: boolean;
  respawnTime: number;
  objective: string;
  weaponRotation?: string[];
  unlimitedAmmo: boolean;
  healthRegen: boolean;
  winCondition: 'kills' | 'rounds' | 'time';
  targetKills?: number;
  targetRounds?: number;
}

export const GAMEMODES: Record<string, GameMode> = {
  freeForAll: {
    name: 'Free-For-All',
    botCount: 4,
    roundTime: 300, // 5 minutes
    teamBased: false,
    respawnTime: 5,
    objective: 'Get the most kills',
    unlimitedAmmo: true,
    healthRegen: false,
    winCondition: 'kills',
    targetKills: 30,
  },
  teamDeathmatch: {
    name: 'Team Deathmatch',
    botCount: 4,
    roundTime: 600, // 10 minutes
    teamBased: true,
    respawnTime: 3,
    objective: 'Eliminate the enemy team',
    unlimitedAmmo: true,
    healthRegen: true,
    winCondition: 'kills',
    targetKills: 50,
  },
  gunGame: {
    name: 'Gun Game',
    botCount: 3,
    roundTime: 1800, // 30 minutes
    teamBased: false,
    respawnTime: 0, // Instant respawn
    objective: 'Progress through all weapons to knife',
    weaponRotation: [
      'glock',
      'mp5',
      'ump45',
      'xm1014',
      'nova',
      'ak47',
      'm4a1',
      'awp',
      'deagle',
      'knife',
    ],
    unlimitedAmmo: true,
    healthRegen: false,
    winCondition: 'kills',
    targetKills: 10,
  },
  aimArena: {
    name: 'Aim Arena',
    botCount: 8,
    roundTime: 600, // 10 minutes
    teamBased: false,
    respawnTime: 2,
    objective: 'Test your aim against multiple bots',
    unlimitedAmmo: true,
    healthRegen: false,
    winCondition: 'time',
    targetKills: 100,
  },
  weaponMastery: {
    name: 'Weapon Mastery',
    botCount: 4,
    roundTime: 300,
    teamBased: false,
    respawnTime: 3,
    objective: 'Master each weapon type',
    weaponRotation: ['ak47', 'm4a1', 'awp', 'deagle'],
    unlimitedAmmo: true,
    healthRegen: false,
    winCondition: 'kills',
    targetKills: 25,
  },
  sprayControl: {
    name: 'Spray Control',
    botCount: 1,
    roundTime: 120, // 2 minutes
    teamBased: false,
    respawnTime: 5,
    objective: 'Practice spray control patterns',
    unlimitedAmmo: true,
    healthRegen: true,
    winCondition: 'kills',
    targetKills: 5,
  },
  nerfedBots: {
    name: 'Nerfed Bots (Practice)',
    botCount: 6,
    roundTime: 600,
    teamBased: false,
    respawnTime: 3,
    objective: 'Practice against weaker bots',
    unlimitedAmmo: true,
    healthRegen: false,
    winCondition: 'kills',
    targetKills: 50,
  },
  survivalMode: {
    name: 'Survival Mode',
    botCount: 6,
    roundTime: 900, // 15 minutes, but endless waves
    teamBased: false,
    respawnTime: 0,
    objective: 'Survive as many rounds as possible',
    unlimitedAmmo: true,
    healthRegen: true,
    winCondition: 'time',
    targetKills: 999,
  },
};

export class GameModeManager {
  public static getGameMode(modeId: string): GameMode | null {
    return GAMEMODES[modeId] || null;
  }

  public static getAllModes(): string[] {
    return Object.keys(GAMEMODES);
  }

  public static getModeDescription(modeId: string): string {
    const mode = this.getGameMode(modeId);
    if (!mode) return 'Unknown gamemode';

    return `${mode.name} - ${mode.objective}
Bots: ${mode.botCount} | Time: ${Math.floor(mode.roundTime / 60)}m
${mode.unlimitedAmmo ? '✓ Unlimited Ammo' : '✗ Limited Ammo'}
${mode.healthRegen ? '✓ Health Regen' : '✗ No Regen'}
${mode.teamBased ? '✓ Team-based' : '✗ Free-for-all'}`;
  }
}
