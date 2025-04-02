import { create } from 'zustand';
import { Player, Monster, Item } from '../types/game';

interface GameState {
  player: Player;
  currentMonster: Monster | null;
  inventory: Item[];
  setPlayer: (player: Player) => void;
  setCurrentMonster: (monster: Monster | null) => void;
  addToInventory: (item: Item) => void;
  gainExperience: (amount: number) => void;
  gainCoins: (gold: number, silver: number, copper: number) => void;
  takeDamage: (amount: number) => void;
  resetPlayer: () => void;
}

const initialPlayer: Player = {
  level: 1,
  experience: 0,
  maxHp: 100,
  currentHp: 100,
  coins: {
    gold: 0,
    silver: 0,
    copper: 0,
  },
  equipment: {},
};

export const useGameStore = create<GameState>((set) => ({
  player: initialPlayer,
  currentMonster: null,
  inventory: [],

  setPlayer: (player) => set({ player }),
  
  setCurrentMonster: (monster) => set({ currentMonster: monster }),
  
  addToInventory: (item) =>
    set((state) => ({
      inventory: [...state.inventory, item],
    })),

  gainExperience: (amount) =>
    set((state) => {
      const newExperience = state.player.experience + amount;
      const experienceToLevel = state.player.level * 100;
      
      if (newExperience >= experienceToLevel) {
        // Level up heals the player and increases max HP
        const newLevel = state.player.level + 1;
        const newMaxHp = 100 + ((newLevel - 1) * 20);
        return {
          player: {
            ...state.player,
            level: newLevel,
            experience: newExperience - experienceToLevel,
            maxHp: newMaxHp,
            currentHp: newMaxHp, // Full heal on level up
          },
        };
      }
      
      return {
        player: {
          ...state.player,
          experience: newExperience,
        },
      };
    }),

  gainCoins: (gold, silver, copper) =>
    set((state) => ({
      player: {
        ...state.player,
        coins: {
          gold: state.player.coins.gold + gold,
          silver: state.player.coins.silver + silver,
          copper: state.player.coins.copper + copper,
        },
      },
    })),

  takeDamage: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        currentHp: Math.max(0, state.player.currentHp - amount),
      },
    })),

  resetPlayer: () =>
    set({
      player: initialPlayer,
      currentMonster: null,
      inventory: [],
    }),
})); 