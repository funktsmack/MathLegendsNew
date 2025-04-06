export enum ItemType {
  POTION = 'potion',
  EXPERIENCE_POTION = 'experience_potion',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  SCROLL = 'scroll',
  GEM = 'gem',
  FOOD = 'food',
  MATERIAL = 'material',
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export type EffectType = 'heal' | 'strength' | 'defense' | 'damage' | 'teleport' | 'identify' | 'bless' | 'experience';

export interface ItemEffect {
  type: EffectType;
  power: number;
  value?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  effect: ItemEffect;
  stackable: boolean;
  quantity?: number;
  image?: string;
}

export const ITEM_IMAGES = {
  // Potions
  health_potion: '/images/items/potions/health_potion.png',
  mana_potion: '/images/items/potions/mana_potion.png',
  strength_potion: '/images/items/potions/strength_potion.png',
  
  // Experience Potions
  small_exp_potion: '/images/items/experience/small_exp_potion.png',
  medium_exp_potion: '/images/items/experience/medium_exp_potion.png',
  large_exp_potion: '/images/items/experience/large_exp_potion.png',
  
  // Weapons
  rusty_sword: '/images/items/weapons/rusty_sword.png',
  iron_sword: '/images/items/weapons/iron_sword.png',
  steel_sword: '/images/items/weapons/steel_sword.png',
  
  // Armor
  leather_armor: '/images/items/armor/leather_armor.png',
  iron_armor: '/images/items/armor/iron_armor.png',
  steel_armor: '/images/items/armor/steel_armor.png',
  
  // Scrolls
  teleport_scroll: '/images/items/scrolls/teleport_scroll.png',
  identify_scroll: '/images/items/scrolls/identify_scroll.png',
  
  // Gems
  ruby: '/images/items/gems/ruby.png',
  sapphire: '/images/items/gems/sapphire.png',
  emerald: '/images/items/gems/emerald.png',
  
  // Food
  apple: '/images/items/food/apple.png',
  bread: '/images/items/food/bread.png',
  meat: '/images/items/food/meat.png',
  
  // Materials
  wood: '/images/items/materials/wood.png',
  iron_ore: '/images/items/materials/iron_ore.png',
  gold_ore: '/images/items/materials/gold_ore.png',
}; 