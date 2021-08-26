import GameMaster from './PokemonGO/GameMaster';

class PokemonGO {
  static GameMaster = GameMaster;

  constructor() {}
}

declare namespace PokemonGO {
  type GameMaster = InstanceType<typeof PokemonGO.GameMaster>;
}

export default PokemonGO;
