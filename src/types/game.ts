export interface Player {
  level: number;
  experience: number;
  maxHp: number;
  currentHp: number;
  coins: {
    gold: number;
    silver: number;
    copper: number;
  };
  equipment: Equipment;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  bonus: {
    attack?: number;
    defense?: number;
    hp?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  image: string;
  mathProblem: MathProblem;
  rewards: {
    experience: number;
    coins: {
      gold: number;
      silver: number;
      copper: number;
    };
    possibleItems: Item[];
  };
}

export interface MathProblem {
  question: string;
  answer: number;
  difficulty: number;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division';
} 