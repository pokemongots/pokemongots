import util from 'util';

type GameMasterArray = Array<{ [key: string]: any }>;

export default class GameMaster {
  array: GameMasterArray;

  constructor(array: GameMasterArray) {
    this.array = array;
  }

  static normalizeType(type: string) {
    return type.replace(/^POKEMON_TYPE_/, '').toLowerCase();
  }

  static normalizeFastMove(move: string) {
    return move.replace(/_FAST$/, '');
  }

  // The content of GAME_MASTER.json is an array of objects called "templates" that contain various information
  // (uniquely identified by the `templateId' property value).
  //
  // The Pokémon data is stored in the objects whose `templateId' property value starts with "Vxxxx_POKEMON_" (xxxx is
  // the corresponding four-digit National Pokédex number padded with leading zeros). These objects have a `templateId'
  // property and a `data' property, and the `data.pokemonSettings' property contains substantial Pokémon information.
  //
  // For battle simulation purposes, Pokémon of the same species (number) with the same type, stats, and moveset (such
  // as different Deerling forms) should be considered identical.
  //
  // The `getAllPokemon' method returns an object with the `pokemonId' property value as keys and an object containing
  // the above information as values.
  //
  // If there are other entries with the same data, only one of them is preserved.
  //
  // If there are other entries with the same `pokemonId' property value but different data, the `form' property value
  // is used as a key.
  getAllPokemon() {
    const allPokemon: { [key: string]: any } = {};

    this.array.forEach(({ templateId, data }) => {
      const matches = templateId.match(/^V(\d+)_POKEMON_/);

      // Exclude objects that do not have a `pokemonSettings' property in the `data' property. This will exclude
      // "_HOME_REVERSION" things.
      if (matches && 'pokemonSettings' in data) {
        const {
          pokemonId,
          form,
          type,
          type2,
          stats,
          quickMoves,
          eliteQuickMove,
          cinematicMoves,
          eliteCinematicMove,
        } = data.pokemonSettings;

        const entry: { [key: string]: any } = {
          // @ts-ignore: Object is possibly 'null'.
          number: Number(matches[1]),
          type: new Set(
            [type, type2]
              .filter((x) => x != null)
              .map(GameMaster.normalizeType),
          ),
          ...stats,
          fastMoves: new Set(
            []
              .concat(quickMoves, eliteQuickMove)
              .filter((x) => x != null)
              .map(GameMaster.normalizeFastMove),
          ),
          chargeMoves: new Set(
            []
              .concat(cinematicMoves, eliteCinematicMove)
              .filter((x) => x != null),
          ),
        };

        if (pokemonId in allPokemon) {
          // If there is a template with the same `pokemonId' but different from the existing data, the `form' property
          // value is used as a key. If it is equal to the existing data, discard it.
          if (!util.isDeepStrictEqual(allPokemon[pokemonId], entry)) {
            allPokemon[form] = entry;
          }
        } else {
          allPokemon[pokemonId] = entry;
        }
      }
    });

    return allPokemon;
  }

  getAllMoves() {
    return Object.fromEntries(
      this.array
        .filter(({ templateId }) => /^COMBAT_V\d+_MOVE_/.test(templateId))
        .map(({ data }) => {
          const { uniqueId, type, power, durationTurns, energyDelta, buffs } =
            data.combatMove;

          return [
            GameMaster.normalizeFastMove(uniqueId),
            {
              type: GameMaster.normalizeType(type),
              power,
              durationTurns,
              energyDelta,
              ...buffs,
            },
          ];
        }),
    );
  }
}
