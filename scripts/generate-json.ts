import fs from 'fs';

import PokemonGO from '../src/PokemonGO';

import gameMasterArray from '../data/GAME_MASTER.json';

const gameMaster: PokemonGO.GameMaster = new PokemonGO.GameMaster(
  gameMasterArray,
);

const replacer = (key: string, value: any) =>
  value instanceof Set ? Array.from(value) : value;

fs.writeFile(
  '../data/pokemon.json',
  JSON.stringify(gameMaster.getAllPokemon(), replacer, 2),
  () => {},
);

fs.writeFile(
  '../data/moves.json',
  JSON.stringify(gameMaster.getAllMoves(), replacer, 2),
  () => {},
);
