import { count } from "drizzle-orm";
import type { Database } from "./client";
import { events, matches } from "./schema";

export async function seedIfEmpty(database: Database): Promise<void> {
  const [{ value: matchCount }] = await database
    .select({ value: count() })
    .from(matches);

  if (matchCount > 0) {
    return;
  }

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const inserted = await database
    .insert(matches)
    .values([
      {
        homeTeam: "Boca Juniors",
        awayTeam: "River Plate",
        league: "Liga Profesional",
        status: "live",
        homeScore: 1,
        awayScore: 1,
        minute: 67,
        kickoffAt: new Date(now - 1.2 * hour),
      },
      {
        homeTeam: "Racing",
        awayTeam: "Independiente",
        league: "Liga Profesional",
        status: "live",
        homeScore: 2,
        awayScore: 0,
        minute: 34,
        kickoffAt: new Date(now - 0.6 * hour),
      },
      {
        homeTeam: "Banfield",
        awayTeam: "Argentinos Juniors",
        league: "Liga Profesional",
        status: "scheduled",
        homeScore: 0,
        awayScore: 0,
        minute: 0,
        kickoffAt: new Date(now + 2 * hour),
      },
      {
        homeTeam: "Barcelona",
        awayTeam: "Real Madrid",
        league: "La Liga",
        status: "finished",
        homeScore: 3,
        awayScore: 2,
        minute: 90,
        kickoffAt: new Date(now - 5 * hour),
      },
    ])
    .returning();

  const [bocaRiver, racingIndep, , clasico] = inserted;

  await database.insert(events).values([
    {
      matchId: bocaRiver.id,
      type: "goal",
      minute: 18,
      team: "home",
      player: "Cavani",
      description: "Cabezazo tras córner",
      period: "1H",
    },
    {
      matchId: bocaRiver.id,
      type: "yellow_card",
      minute: 41,
      team: "away",
      player: "Enzo Pérez",
      description: "Falta táctica",
      period: "1H",
    },
    {
      matchId: bocaRiver.id,
      type: "goal",
      minute: 55,
      team: "away",
      player: "Colidio",
      description: "Definición cruzada",
      period: "2H",
    },
    {
      matchId: bocaRiver.id,
      type: "substitution",
      minute: 62,
      team: "home",
      player: "Zenón -> Medina",
      description: "Cambio ofensivo",
      period: "2H",
    },
    {
      matchId: racingIndep.id,
      type: "goal",
      minute: 9,
      team: "home",
      player: "Martínez",
      description: "Disparo de media distancia",
      period: "1H",
    },
    {
      matchId: racingIndep.id,
      type: "goal",
      minute: 27,
      team: "home",
      player: "Salas",
      description: "Contragolpe",
      period: "1H",
    },
    {
      matchId: racingIndep.id,
      type: "foul",
      minute: 31,
      team: "away",
      player: "Ávalos",
      description: "Entrada fuerte",
      period: "1H",
    },
    {
      matchId: clasico.id,
      type: "goal",
      minute: 12,
      team: "home",
      player: "Lewandowski",
      description: "Penal",
      period: "1H",
    },
    {
      matchId: clasico.id,
      type: "goal",
      minute: 38,
      team: "away",
      player: "Bellingham",
      description: "Remate al ángulo",
      period: "1H",
    },
    {
      matchId: clasico.id,
      type: "goal",
      minute: 61,
      team: "home",
      player: "Raphinha",
      description: "Tiro libre",
      period: "2H",
    },
    {
      matchId: clasico.id,
      type: "goal",
      minute: 77,
      team: "away",
      player: "Vinícius Jr.",
      description: "1 vs 1",
      period: "2H",
    },
    {
      matchId: clasico.id,
      type: "goal",
      minute: 89,
      team: "home",
      player: "Yamal",
      description: "Gol del triunfo",
      period: "2H",
    },
  ]);

  console.log("Seed: partidos en vivo, próximos y finalizados insertados");
}
