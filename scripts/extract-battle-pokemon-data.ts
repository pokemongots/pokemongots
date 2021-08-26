import PokemonGO from '../src/PokemonGO';

import gameMasterArray from '../data/GAME_MASTER.json';

const gameMaster: PokemonGO.GameMaster = new PokemonGO.GameMaster(
  gameMasterArray,
);

console.log(
  JSON.stringify(
    gameMaster.getBattlePokemonData(),
    (key, value) => (value instanceof Set ? Array.from(value) : value),
    2,
  ),
);
