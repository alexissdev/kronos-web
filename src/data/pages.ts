import type { PageData } from '../types.ts';
import { buildHomePage } from '../pages/home.ts';
import { buildTimersPage } from '../pages/timers.ts';
import { buildFactionsPage } from '../pages/factions.ts';
import { buildClaimsPage } from '../pages/claims.ts';
import { buildKothPage } from '../pages/koth.ts';
import { buildPlayersPage } from '../pages/players.ts';
import { buildApiPage } from '../pages/api.ts';
import { buildEconomyPage } from '../pages/economy.ts';
import { buildClassesPage } from '../pages/classes.ts';
import { buildSpawnPage } from '../pages/spawn.ts';
import { buildScoreboardPage } from '../pages/scoreboard.ts';
import { buildCommonPage } from '../pages/common.ts';
import { buildPluginPage } from '../pages/plugin.ts';

export function getPages(): Record<string, PageData> {
  return {
    home: buildHomePage(),
    api: buildApiPage(),
    common: buildCommonPage(),
    economy: buildEconomyPage(),
    players: buildPlayersPage(),
    timers: buildTimersPage(),
    factions: buildFactionsPage(),
    claims: buildClaimsPage(),
    koth: buildKothPage(),
    classes: buildClassesPage(),
    spawn: buildSpawnPage(),
    scoreboard: buildScoreboardPage(),
    plugin: buildPluginPage(),
  };
}

export const moduleOrder: string[] = [
  'api',
  'common',
  'economy',
  'players',
  'timers',
  'factions',
  'claims',
  'koth',
  'classes',
  'spawn',
  'scoreboard',
  'plugin',
];

export const pageOrder: string[] = ['home', ...moduleOrder];
