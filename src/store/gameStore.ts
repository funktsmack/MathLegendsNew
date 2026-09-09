import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, Monster, Equipment } from '../types/game';
import { Item, ItemType } from '../types/items';
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
  consumeItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: keyof Equipment) => void;
  sellItem: (itemId: string) => void;
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
  equipment: {},
};

const initialState: GameState = {
  player: initialPlayer,
  currentMonster: null,
  inventory: [],
};

const addItemToInventory = (inventory: Item[], item: Item): Item[] => {
  if (item.stackable) {
    const existingItemIndex = inventory.findIndex(i =>
      i.name === item.name && i.type === item.type && i.rarity === item.rarity
    );

    if (existingItemIndex >= 0) {
      const updatedInventory = [...inventory];
      const existingItem = updatedInventory[existingItemIndex];
      updatedInventory[existingItemIndex] = {
        ...existingItem,
        quantity: (existingItem.quantity || 1) + (item.quantity || 1)
      };
      return updatedInventory;
    }
  }

  return [...inventory, item];
};

const coinsToTotal = (coins: Player['coins']) =>
  coins.gold * 100 + coins.silver * 10 + coins.copper;

const totalToCoins = (total: number): Player['coins'] => ({
  gold: Math.floor(total / 100),
  silver: Math.floor((total % 100) / 10),
  copper: total % 10,
});

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
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
        set((state) => ({ inventory: addItemToInventory(state.inventory, item) })),

      removeFromInventory: (itemId) =>
        set((state) => ({
          inventory: state.inventory.filter(item => item.id !== itemId)
        })),

      consumeItem: (itemId: string) =>
        set((state) => {
          const itemIndex = state.inventory.findIndex(item => item.id === itemId);
          if (itemIndex === -1) return state;

          const item = state.inventory[itemIndex];
          // Weapons and armor are equipped, not consumed
          if (item.type === ItemType.WEAPON || item.type === ItemType.ARMOR) return state;

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

      equipItem: (itemId: string) =>
        set((state) => {
          const itemIndex = state.inventory.findIndex(item => item.id === itemId);
          if (itemIndex === -1) return state;

          const item = state.inventory[itemIndex];
          let slot: keyof Equipment;
          if (item.type === ItemType.WEAPON) slot = 'weapon';
          else if (item.type === ItemType.ARMOR) slot = 'armor';
          else return state;

          const updatedInventory = [...state.inventory];
          updatedInventory.splice(itemIndex, 1);

          const previouslyEquipped = state.player.equipment[slot];
          if (previouslyEquipped) {
            updatedInventory.push(previouslyEquipped);
          }

          return {
            inventory: updatedInventory,
            player: {
              ...state.player,
              equipment: { ...state.player.equipment, [slot]: item },
            },
          };
        }),

      unequipItem: (slot: keyof Equipment) =>
        set((state) => {
          const item = state.player.equipment[slot];
          if (!item) return state;

          const updatedEquipment = { ...state.player.equipment };
          delete updatedEquipment[slot];

          return {
            inventory: [...state.inventory, item],
            player: { ...state.player, equipment: updatedEquipment },
          };
        }),

      sellItem: (itemId: string) =>
        set((state) => {
          const itemIndex = state.inventory.findIndex(item => item.id === itemId);
          if (itemIndex === -1) return state;

          const item = state.inventory[itemIndex];
          const updatedInventory = [...state.inventory];

          if (item.stackable && item.quantity && item.quantity > 1) {
            updatedInventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
          } else {
            updatedInventory.splice(itemIndex, 1);
          }

          const newTotal = coinsToTotal(state.player.coins) + item.value;

          return {
            inventory: updatedInventory,
            player: { ...state.player, coins: totalToCoins(newTotal) },
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
        set((state) => {
          const newTotal = coinsToTotal(state.player.coins) + coinsToTotal({ gold, silver, copper });
          return {
            player: {
              ...state.player,
              coins: totalToCoins(newTotal),
            },
          };
        }),

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
          return {
            inventory: drops.reduce(addItemToInventory, state.inventory),
          };
        }),

      spendCoins: (amount: number) => {
        const state = get();
        const totalCoins = coinsToTotal(state.player.coins);

        if (totalCoins < amount) return false;

        set({
          player: {
            ...state.player,
            coins: totalToCoins(totalCoins - amount),
          },
        });

        return true;
      },
    }),
    { name: 'math-legends-save' }
  )
);
