import { Item, ItemType, ItemRarity, ITEM_IMAGES } from '../types/items';
import { Monster } from '../types/game';

// Helper function to generate a random ID
const generateRandomId = () => Math.random().toString(36).substr(2, 9);

// Helper function to get rarity based on monster level
const getRarityFromMonsterLevel = (monsterLevel: number): ItemRarity => {
  const rarityRoll = Math.random() * 100;
  
  // Higher level monsters have better chances for rare items
  if (monsterLevel >= 10) {
    if (rarityRoll < 1) return ItemRarity.LEGENDARY;
    if (rarityRoll < 5) return ItemRarity.EPIC;
    if (rarityRoll < 15) return ItemRarity.RARE;
    if (rarityRoll < 40) return ItemRarity.UNCOMMON;
    return ItemRarity.COMMON;
  } else if (monsterLevel >= 5) {
    if (rarityRoll < 0.5) return ItemRarity.LEGENDARY;
    if (rarityRoll < 3) return ItemRarity.EPIC;
    if (rarityRoll < 10) return ItemRarity.RARE;
    if (rarityRoll < 30) return ItemRarity.UNCOMMON;
    return ItemRarity.COMMON;
  } else {
    if (rarityRoll < 0.1) return ItemRarity.LEGENDARY;
    if (rarityRoll < 1) return ItemRarity.EPIC;
    if (rarityRoll < 5) return ItemRarity.RARE;
    if (rarityRoll < 20) return ItemRarity.UNCOMMON;
    return ItemRarity.COMMON;
  }
};

// Generate a random item based on monster level
export const generateRandomItem = (monsterLevel: number): Item | null => {
  // 70% chance to drop an item
  if (Math.random() > 0.7) return null;
  
  const rarity = getRarityFromMonsterLevel(monsterLevel);
  
  // Determine item type based on monster level and rarity
  let itemType: ItemType;
  const typeRoll = Math.random() * 100;
  
  if (monsterLevel < 3) {
    // Low level monsters drop more basic items
    if (typeRoll < 40) itemType = ItemType.FOOD;
    else if (typeRoll < 70) itemType = ItemType.MATERIAL;
    else if (typeRoll < 85) itemType = ItemType.POTION;
    else itemType = ItemType.SCROLL;
  } else if (monsterLevel < 7) {
    // Mid level monsters drop more varied items
    if (typeRoll < 30) itemType = ItemType.POTION;
    else if (typeRoll < 50) itemType = ItemType.FOOD;
    else if (typeRoll < 70) itemType = ItemType.MATERIAL;
    else if (typeRoll < 85) itemType = ItemType.SCROLL;
    else itemType = ItemType.GEM;
  } else {
    // High level monsters drop better items
    if (typeRoll < 25) itemType = ItemType.POTION;
    else if (typeRoll < 40) itemType = ItemType.EXPERIENCE_POTION;
    else if (typeRoll < 60) itemType = ItemType.WEAPON;
    else if (typeRoll < 80) itemType = ItemType.ARMOR;
    else itemType = ItemType.GEM;
  }
  
  // Generate item based on type and rarity
  switch (itemType) {
    case ItemType.POTION:
      return generatePotion(monsterLevel);
    case ItemType.EXPERIENCE_POTION:
      return generateExperiencePotion(rarity, monsterLevel);
    case ItemType.WEAPON:
      return generateWeapon(monsterLevel);
    case ItemType.ARMOR:
      return generateArmor(monsterLevel);
    case ItemType.SCROLL:
      return generateScroll(monsterLevel);
    case ItemType.GEM:
      return generateGem(rarity, monsterLevel);
    case ItemType.FOOD:
      return generateFood(rarity, monsterLevel);
    case ItemType.MATERIAL:
      return generateMaterial(rarity, monsterLevel);
    default:
      return null;
  }
};

// Generate monster drops based on monster level
export const generateMonsterDrops = (monsterLevel: number): Item[] => {
  const drops: Item[] = [];
  
  // 30% chance to drop an item
  if (Math.random() < 0.3) {
    const itemTypes = ['potion', 'weapon', 'armor', 'scroll'];
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    
    switch (randomType) {
      case 'potion':
        drops.push(generatePotion(monsterLevel));
        break;
      case 'weapon':
        drops.push(generateWeapon(monsterLevel));
        break;
      case 'armor':
        drops.push(generateArmor(monsterLevel));
        break;
      case 'scroll':
        drops.push(generateScroll(monsterLevel));
        break;
    }
  }
  
  return drops;
};

// Helper functions to generate specific item types
const generatePotion = (level: number): Item => {
  const effects = ['heal', 'strength', 'defense'] as const;
  const effect = effects[Math.floor(Math.random() * effects.length)];
  const power = Math.floor(10 + (level * 5));
  
  return {
    id: generateRandomId(),
    name: `${effect} potion`,
    description: `Restores ${power} ${effect}`,
    type: ItemType.POTION,
    rarity: ItemRarity.COMMON,
    value: Math.floor(10 + (level * 5)),
    effect: {
      type: effect,
      power,
    },
    stackable: true,
    quantity: 1,
  };
};

const generateExperiencePotion = (rarity: ItemRarity, monsterLevel: number): Item => {
  const expValues = {
    [ItemRarity.COMMON]: 50,
    [ItemRarity.UNCOMMON]: 100,
    [ItemRarity.RARE]: 250,
    [ItemRarity.EPIC]: 500,
    [ItemRarity.LEGENDARY]: 1000
  };
  
  const baseExp = expValues[rarity];
  const expValue = Math.floor(baseExp * (1 + (monsterLevel * 0.2)));
  
  const potionSize = rarity === ItemRarity.LEGENDARY ? 'large' : 
                    rarity === ItemRarity.EPIC || rarity === ItemRarity.RARE ? 'medium' : 'small';
  
  return {
    id: generateRandomId(),
    name: `${getRarityPrefix(rarity)} ${potionSize.charAt(0).toUpperCase() + potionSize.slice(1)} Experience Potion`,
    description: `Grants ${expValue} experience points when consumed.`,
    type: ItemType.EXPERIENCE_POTION,
    rarity,
    value: Math.floor(expValue / 10),
    effect: {
      type: 'experience',
      power: expValue,
      value: expValue
    },
    image: ITEM_IMAGES[`${potionSize}_exp_potion` as keyof typeof ITEM_IMAGES],
    stackable: true,
    quantity: 1
  };
};

const generateWeapon = (level: number): Item => {
  const materials = ['rusty', 'iron', 'steel', 'golden'];
  const material = materials[Math.min(Math.floor(level / 3), materials.length - 1)];
  const power = Math.floor(10 + (level * 2));
  
  return {
    id: generateRandomId(),
    name: `${material} sword`,
    description: `A ${material} sword that deals ${power} damage`,
    type: ItemType.WEAPON,
    rarity: ItemRarity.COMMON,
    value: Math.floor(30 + (level * 15)),
    effect: {
      type: 'damage',
      power,
    },
    stackable: false,
  };
};

const generateArmor = (level: number): Item => {
  const materials = ['leather', 'iron', 'steel', 'golden'];
  const material = materials[Math.min(Math.floor(level / 3), materials.length - 1)];
  const power = Math.floor(5 + (level * 1));
  
  return {
    id: generateRandomId(),
    name: `${material} armor`,
    description: `${material} armor that provides ${power} defense`,
    type: ItemType.ARMOR,
    rarity: ItemRarity.COMMON,
    value: Math.floor(25 + (level * 12)),
    effect: {
      type: 'defense',
      power,
    },
    stackable: false,
  };
};

const generateScroll = (level: number): Item => {
  const effects = ['teleport', 'identify', 'bless'] as const;
  const effect = effects[Math.floor(Math.random() * effects.length)];
  const power = Math.floor(5 + (level * 2));
  
  return {
    id: generateRandomId(),
    name: `${effect} scroll`,
    description: `A scroll with ${effect} magic`,
    type: ItemType.SCROLL,
    rarity: ItemRarity.UNCOMMON,
    value: Math.floor(20 + (level * 10)),
    effect: {
      type: effect,
      power,
    },
    stackable: true,
    quantity: 1,
  };
};

const generateGem = (rarity: ItemRarity, monsterLevel: number): Item => {
  const gemTypes = [
    { name: 'Ruby', image: ITEM_IMAGES.ruby },
    { name: 'Sapphire', image: ITEM_IMAGES.sapphire },
    { name: 'Emerald', image: ITEM_IMAGES.emerald }
  ];
  
  const gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)];
  const value = Math.floor(monsterLevel * 10 * getRarityMultiplier(rarity));
  
  return {
    id: generateRandomId(),
    name: `${getRarityPrefix(rarity)} ${gemType.name}`,
    description: `A precious gem that can be sold for a high price.`,
    type: ItemType.GEM,
    rarity,
    value,
    effect: {
      type: 'bless',
      power: Math.floor(value / 10)
    },
    image: gemType.image,
    stackable: true,
    quantity: 1
  };
};

const generateFood = (rarity: ItemRarity, monsterLevel: number): Item => {
  const foodTypes = [
    { name: 'Apple', image: ITEM_IMAGES.apple, baseHeal: 10 },
    { name: 'Bread', image: ITEM_IMAGES.bread, baseHeal: 15 },
    { name: 'Meat', image: ITEM_IMAGES.meat, baseHeal: 20 }
  ];
  
  const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
  const healValue = Math.floor(foodType.baseHeal * getRarityMultiplier(rarity));
  const value = Math.floor(healValue * 2);
  
  return {
    id: generateRandomId(),
    name: `${getRarityPrefix(rarity)} ${foodType.name}`,
    description: `Restores ${healValue} health when consumed.`,
    type: ItemType.FOOD,
    rarity,
    value,
    effect: {
      type: 'heal',
      power: healValue
    },
    image: foodType.image,
    stackable: true,
    quantity: 1
  };
};

const generateMaterial = (rarity: ItemRarity, monsterLevel: number): Item => {
  const materialTypes = [
    { name: 'Wood', image: ITEM_IMAGES.wood },
    { name: 'Iron Ore', image: ITEM_IMAGES.iron_ore },
    { name: 'Gold Ore', image: ITEM_IMAGES.gold_ore }
  ];
  
  const materialType = materialTypes[Math.floor(Math.random() * materialTypes.length)];
  const value = Math.floor(monsterLevel * 5 * getRarityMultiplier(rarity));
  
  return {
    id: generateRandomId(),
    name: `${getRarityPrefix(rarity)} ${materialType.name}`,
    description: `A crafting material used to create items.`,
    type: ItemType.MATERIAL,
    rarity,
    value,
    effect: {
      type: 'bless',
      power: Math.floor(value / 20)
    },
    image: materialType.image,
    stackable: true,
    quantity: Math.floor(Math.random() * 3) + 1
  };
};

// Helper functions
const getRarityPrefix = (rarity: ItemRarity): string => {
  switch (rarity) {
    case ItemRarity.COMMON: return 'Common';
    case ItemRarity.UNCOMMON: return 'Uncommon';
    case ItemRarity.RARE: return 'Rare';
    case ItemRarity.EPIC: return 'Epic';
    case ItemRarity.LEGENDARY: return 'Legendary';
    default: return '';
  }
};

const getRarityMultiplier = (rarity: ItemRarity): number => {
  switch (rarity) {
    case ItemRarity.COMMON: return 1;
    case ItemRarity.UNCOMMON: return 1.5;
    case ItemRarity.RARE: return 2;
    case ItemRarity.EPIC: return 3;
    case ItemRarity.LEGENDARY: return 5;
    default: return 1;
  }
};

const calculateItemValue = (rarity: ItemRarity, monsterLevel: number): { gold: number; silver: number; copper: number } => {
  const baseValue = monsterLevel * 10 * getRarityMultiplier(rarity);
  
  return {
    gold: Math.floor(baseValue / 100),
    silver: Math.floor((baseValue % 100) / 10),
    copper: Math.floor(baseValue % 10)
  };
}; 