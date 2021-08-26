import util from 'util';

type GameMasterArray = Array<{ [key: string]: any }>;

export default class GameMaster {
  array: GameMasterArray;

  constructor(array: GameMasterArray) {
    this.array = array;
  }

  // The content of GAME_MASTER.json is an array of objects called "templates" that contain various information
  // (uniquely identified by the `templateId' property value).
  //
  // The Pokémon data is stored in the objects whose `templateId' property value starts with "Vxxxx_POKEMON_" (xxxx is
  // the corresponding four-digit National Pokédex number padded with leading zeros). These objects have a `templateId'
  // property and a `data' property, and the `data.pokemonSettings' property contains substantial Pokémon information.
  //
  // The `getPokemonData' method extracts the Pokémon data and reconstructs it into an object with the `templateId'
  // property value as the key and the `data.pokemonSettings' property value as the value, and returns it.
  getPokemonData(): { [key: string]: any } {
    return Object.fromEntries(
      this.array
        .filter(
          ({ templateId, data }) =>
            /^V\d+_POKEMON_/.test(templateId) &&
            // Exclude objects that do not have a `pokemonSettings' property in the `data' property. This will exclude
            // "_HOME_REVERSION" things.
            'pokemonSettings' in data,
        )
        .map(({ templateId, data }) => [templateId, data.pokemonSettings]),
    );
  }

  // For battle simulation purposes, Pokémon of the same species (number) with the same type, stats, and moveset (such
  // as different Deerling forms) should be considered identical.
  //
  // The `getBattlePokemonData' method extracts the number, type, stats, and moveset from the object returned by the
  // `getPokemonData' method, and returns a reconstructed object with the `pokemonId' property value as a key. If there
  // are other entries with the same data, only one of them is preserved. If there are other entries with the same
  // `pokemonId' property value but different data, the `form' property value is used as a key.
  getBattlePokemonData() {
    const pokemonData: { [key: string]: any } = {};

    Object.entries(this.getPokemonData()).forEach(
      ([
        templateId,
        {
          pokemonId,
          form,
          type,
          type2,
          stats,
          quickMoves,
          eliteQuickMove,
          cinematicMoves,
          eliteCinematicMove,
        },
      ]) => {
        const matches = templateId.match(/^V(\d+)_POKEMON_/);

        const entry: { [key: string]: any } = {
          // @ts-ignore: Object is possibly 'null'.
          number: Number(matches[1]),
          type: new Set(
            [type, type2]
              .filter((x) => x != null)
              .map((x: string) =>
                x.replace(/^POKEMON_TYPE_/, '').toLowerCase(),
              ),
          ),
          ...stats,
          fastMoves: new Set(
            []
              .concat(quickMoves, eliteQuickMove)
              .filter((x) => x != null)
              .map((x: string) => x.replace(/_FAST$/, '')),
          ),
          chargeMoves: new Set(
            []
              .concat(cinematicMoves, eliteCinematicMove)
              .filter((x) => x != null),
          ),
        };

        if (pokemonId in pokemonData) {
          if (!util.isDeepStrictEqual(pokemonData[pokemonId], entry)) {
            pokemonData[form] = entry;
          }
        } else {
          pokemonData[pokemonId] = entry;
        }
      },
    );

    return pokemonData;
  }
}
