import React from 'react';
import { Item, ItemType, ItemRarity } from '../types/items';

interface StoreProps {
  onClose: () => void;
  onPurchase: (item: Item) => void;
  coins: {
    gold: number;
    silver: number;
    copper: number;
  };
}

const generateStoreItems = (playerLevel: number): Item[] => {
  const items: Item[] = [];
  
  // Generate potions
  items.push({
    id: 'store_heal_potion',
    name: 'Health Potion',
    description: 'Restores 50 HP',
    type: ItemType.POTION,
    rarity: ItemRarity.COMMON,
    value: 10,
    effect: {
      type: 'heal',
      power: 50,
    },
    stackable: true,
    quantity: 1,
  });

  items.push({
    id: 'store_strength_potion',
    name: 'Strength Potion',
    description: 'Increases strength by 5',
    type: ItemType.POTION,
    rarity: ItemRarity.COMMON,
    value: 15,
    effect: {
      type: 'strength',
      power: 5,
    },
    stackable: true,
    quantity: 1,
  });

  items.push({
    id: 'store_defense_potion',
    name: 'Defense Potion',
    description: 'Increases defense by 5',
    type: ItemType.POTION,
    rarity: ItemRarity.COMMON,
    value: 15,
    effect: {
      type: 'defense',
      power: 5,
    },
    stackable: true,
    quantity: 1,
  });

  // Generate weapons based on player level
  const weaponMaterials = ['iron', 'steel', 'golden'];
  const materialIndex = Math.min(Math.floor(playerLevel / 3), weaponMaterials.length - 1);
  const weaponPower = Math.floor(10 + (playerLevel * 2));
  
  items.push({
    id: 'store_weapon',
    name: `${weaponMaterials[materialIndex]} sword`,
    description: `A ${weaponMaterials[materialIndex]} sword that deals ${weaponPower} damage`,
    type: ItemType.WEAPON,
    rarity: ItemRarity.COMMON,
    value: 30 + (playerLevel * 10),
    effect: {
      type: 'damage',
      power: weaponPower,
    },
    stackable: false,
  });

  // Generate armor based on player level
  const armorMaterials = ['leather', 'iron', 'steel'];
  const armorMaterialIndex = Math.min(Math.floor(playerLevel / 3), armorMaterials.length - 1);
  const armorPower = Math.floor(5 + (playerLevel * 1));
  
  items.push({
    id: 'store_armor',
    name: `${armorMaterials[armorMaterialIndex]} armor`,
    description: `${armorMaterials[armorMaterialIndex]} armor that provides ${armorPower} defense`,
    type: ItemType.ARMOR,
    rarity: ItemRarity.COMMON,
    value: 25 + (playerLevel * 8),
    effect: {
      type: 'defense',
      power: armorPower,
    },
    stackable: false,
  });

  return items;
};

export const Store: React.FC<StoreProps> = ({ onClose, onPurchase, coins }) => {
  const storeItems = generateStoreItems(5); // You can pass the actual player level here

  const canAfford = (price: number) => {
    const totalCoins = coins.gold * 100 + coins.silver * 10 + coins.copper;
    return totalCoins >= price;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800/90 p-8 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-400 font-gothic">Merchant's Shop</h2>
          <div className="text-xl font-bold">
            <span className="text-yellow-500">{coins.gold}g </span>
            <span className="text-gray-400">{coins.silver}s </span>
            <span className="text-orange-500">{coins.copper}c</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/80 p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-red-400 mb-2">{item.name}</h3>
              <p className="text-gray-300 text-sm mb-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-500">{item.value} coins</span>
                <button
                  onClick={() => onPurchase(item)}
                  disabled={!canAfford(item.value)}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-bold transition-colors duration-200 ${
                    canAfford(item.value)
                      ? 'bg-red-800 hover:bg-red-700'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  {canAfford(item.value) ? 'Buy' : 'Cannot Afford'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          Close Shop
        </button>
      </div>
    </div>
  );
}; 