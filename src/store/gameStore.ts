import { create } from 'zustand';
import { Player, Monster } from '../types/game';
import { Item } from '../types/items';
import { generateMonsterDrops } from '../utils/itemGenerator';

interface GameState {
  player: Player;
  currentMonster: Monster | null;
  inventory: Item[];
}

interface GameActions {
  setPlayerName: (name: string) => void;
  setPlayer: (player: Player) => void;
  setCurrentMonster: (monster: Monster | null) => void;
  addToInventory: (item: Item) => void;
  removeFromInventory: (itemId: string) => void;
  useItem: (itemId: string) => void;
  gainExperience: (amount: number) => void;
  gainCoins: (gold: number, silver: number, copper: number) => void;
  takeDamage: (amount: number) => void;
  resetPlayer: () => void;
  collectMonsterDrops: () => void;
  spendCoins: (amount: number) => boolean;
}

const initialPlayer: Player = {
  name: '',
  level: 1,
  experience: 0,
  currentHp: 100,
  maxHp: 100,
  strength: 10,
  defense: 5,
  damage: 8,
  coins: {
    gold: 0,
    silver: 0,
    copper: 0,
  },
};

const initialState: GameState = {
  player: initialPlayer,
  currentMonster: null,
  inventory: [],
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  setPlayerName: (name: string) => 
    set((state) => ({
      player: {
        ...state.player,
        name,
      },
    })),

  setPlayer: (player) => set({ player }),
  setCurrentMonster: (monster) => set({ currentMonster: monster }),
  
  addToInventory: (item) => 
    set((state) => {
      // Check if item is stackable and already exists in inventory
      if (item.stackable) {
        const existingItemIndex = state.inventory.findIndex(i => 
          i.name === item.name && i.type === item.type && i.rarity === item.rarity
        );
        
        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          const updatedInventory = [...state.inventory];
          const existingItem = updatedInventory[existingItemIndex];
          updatedInventory[existingItemIndex] = {
            ...existingItem,
            quantity: (existingItem.quantity || 1) + (item.quantity || 1)
          };
          return { inventory: updatedInventory };
        }
      }
      
      // Add as new item
      return { inventory: [...state.inventory, item] };
    }),
    
  removeFromInventory: (itemId) =>
    set((state) => ({
      inventory: state.inventory.filter(item => item.id !== itemId)
    })),
    
  useItem: (itemId: string) => 
    set((state) => {
      const itemIndex = state.inventory.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return state;

      const item = state.inventory[itemIndex];
      const updatedPlayer = { ...state.player };
      const updatedInventory = [...state.inventory];

      // Apply item effects
      switch (item.effect.type) {
        case 'heal':
          updatedPlayer.currentHp = Math.min(
            updatedPlayer.currentHp + item.effect.power,
            updatedPlayer.maxHp
          );
          break;
        case 'strength':
          updatedPlayer.strength += item.effect.power;
          break;
        case 'defense':
          updatedPlayer.defense += item.effect.power;
          break;
        case 'damage':
          updatedPlayer.damage += item.effect.power;
          break;
        case 'experience':
          if (item.effect.value) {
            updatedPlayer.experience += item.effect.value;
          }
          break;
      }

      // Remove or decrease item quantity
      if (item.stackable && item.quantity && item.quantity > 1) {
        updatedInventory[itemIndex] = {
          ...item,
          quantity: item.quantity - 1
        };
      } else {
        updatedInventory.splice(itemIndex, 1);
      }

      return {
        player: updatedPlayer,
        inventory: updatedInventory
      };
    }),
    
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
    set((state) => ({
      ...initialState,
      player: {
        ...initialState.player,
        name: state.player.name, // Keep the player's name when resetting
      },
    })),
    
  collectMonsterDrops: () => 
    set((state) => {
      if (!state.currentMonster) return state;
      
      const drops = generateMonsterDrops(state.currentMonster.level);
      const updatedInventory = [...state.inventory];
      
      drops.forEach(item => {
        // Check if item is stackable and already exists
        if (item.stackable) {
          const existingItemIndex = updatedInventory.findIndex(i => 
            i.name === item.name && i.type === item.type && i.rarity === item.rarity
          );
          
          if (existingItemIndex >= 0) {
            // Update quantity of existing item
            const existingItem = updatedInventory[existingItemIndex];
            updatedInventory[existingItemIndex] = {
              ...existingItem,
              quantity: (existingItem.quantity || 1) + (item.quantity || 1)
            };
          } else {
            updatedInventory.push(item);
          }
        } else {
          updatedInventory.push(item);
        }
      });
      
      return { inventory: updatedInventory };
    }),

  spendCoins: (amount: number) => {
    const state = get();
    const totalCoins = state.player.coins.gold * 100 + 
                      state.player.coins.silver * 10 + 
                      state.player.coins.copper;
    
    if (totalCoins < amount) return false;
    
    const remainingCoins = totalCoins - amount;
    const gold = Math.floor(remainingCoins / 100);
    const silver = Math.floor((remainingCoins % 100) / 10);
    const copper = remainingCoins % 10;
    
    set({
      player: {
        ...state.player,
        coins: {
          gold,
          silver,
          copper,
        },
      },
    });
    
    return true;
  },
})); 