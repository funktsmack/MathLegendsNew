import { assetUrl } from '../utils/assetUrl';

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
  health_potion: assetUrl('images/items/potions/health_potion.png'),
  mana_potion: assetUrl('images/items/potions/mana_potion.png'),
  strength_potion: assetUrl('images/items/potions/strength_potion.png'),

  // Experience Potions
  small_exp_potion: assetUrl('images/items/experience/small_exp_potion.png'),
  medium_exp_potion: assetUrl('images/items/experience/medium_exp_potion.png'),
  large_exp_potion: assetUrl('images/items/experience/large_exp_potion.png'),

  // Weapons
  rusty_sword: assetUrl('images/items/weapons/rusty_sword.png'),
  iron_sword: assetUrl('images/items/weapons/iron_sword.png'),
  steel_sword: assetUrl('images/items/weapons/steel_sword.png'),

  // Armor
  leather_armor: assetUrl('images/items/armor/leather_armor.png'),
  iron_armor: assetUrl('images/items/armor/iron_armor.png'),
  steel_armor: assetUrl('images/items/armor/steel_armor.png'),

  // Scrolls
  teleport_scroll: assetUrl('images/items/scrolls/teleport_scroll.png'),
  identify_scroll: assetUrl('images/items/scrolls/identify_scroll.png'),

  // Gems
  ruby: assetUrl('images/items/gems/ruby.png'),
  sapphire: assetUrl('images/items/gems/sapphire.png'),
  emerald: assetUrl('images/items/gems/emerald.png'),

  // Food
  apple: assetUrl('images/items/food/apple.png'),
  bread: assetUrl('images/items/food/bread.png'),
  meat: assetUrl('images/items/food/meat.png'),

  // Materials
  wood: assetUrl('images/items/materials/wood.png'),
  iron_ore: assetUrl('images/items/materials/iron_ore.png'),
  gold_ore: assetUrl('images/items/materials/gold_ore.png'),
};
