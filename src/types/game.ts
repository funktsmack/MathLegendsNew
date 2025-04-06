import { Item } from './items';

export interface Player {
  name: string;
  level: number;
  experience: number;
  currentHp: number;
  maxHp: number;
  strength: number;
  defense: number;
  damage: number;
  coins: {
    gold: number;
    silver: number;
    copper: number;
  };
  equipment?: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
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