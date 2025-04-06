import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Monster, MathProblem } from '../types/game';
import { Item } from '../types/items';
import { generateMonsterDrops } from '../utils/itemGenerator';
import { Store } from './Store';

// Local image paths for monsters
const MONSTER_AVATARS = {
  'Mathling': '/images/monsters/mathling.png',
  'Number Goblin': '/images/monsters/goblin.png',
  'Equation Elemental': '/images/monsters/elemental.png',
  'Division Dragon': '/images/monsters/dragon.png',
  'Algebra Apparition': '/images/monsters/apparition.png'
};

const HERO_AVATAR = '/images/hero/hero.png';

const generateMathProblem = (level: number): MathProblem => {
  const types = ['addition', 'subtraction', 'multiplication', 'division'];
  const type = types[Math.min(Math.floor(level / 3), types.length - 1)] as MathProblem['type'];
  
  let num1: number, num2: number, answer: number, question: string;
  
  switch (type) {
    case 'addition':
      num1 = Math.floor(Math.random() * (10 * level)) + 1;
      num2 = Math.floor(Math.random() * (10 * level)) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case 'subtraction':
      num1 = Math.floor(Math.random() * (10 * level)) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
      break;
    case 'multiplication':
      num1 = Math.floor(Math.random() * (5 * level)) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;
    case 'division':
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer;
      question = `${num1} ÷ ${num2} = ?`;
      break;
  }

  return {
    question,
    answer,
    difficulty: level,
    type,
  };
};

const generateMonster = (level: number): Monster => {
  const monsters = [
    'Mathling',
    'Number Goblin',
    'Equation Elemental',
    'Division Dragon',
    'Algebra Apparition'
  ];
  
  // Progressive monster selection based on level
  const availableMonsters = Math.min(
    2 + Math.floor((level - 1) / 3),
    monsters.length
  );
  
  const monsterIndex = Math.floor(Math.random() * availableMonsters);
  const name = monsters[monsterIndex];
  
  // Restore normal HP calculation
  const monsterLevel = Math.max(1, level + Math.floor(Math.random() * 3) - 1);
  const baseHp = 50 + (monsterLevel * 10);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    level: monsterLevel,
    hp: baseHp,
    maxHp: baseHp,
    image: MONSTER_AVATARS[name as keyof typeof MONSTER_AVATARS],
    mathProblem: generateMathProblem(monsterLevel),
    rewards: {
      experience: 25 * monsterLevel,
      coins: {
        gold: Math.floor(monsterLevel / 2),
        silver: Math.floor(monsterLevel * 2),
        copper: monsterLevel * 8,
      },
      possibleItems: [],
    },
  };
};

export const Game: React.FC = () => {
  const {
    player,
    currentMonster,
    inventory,
    setPlayerName,
    setCurrentMonster,
    addToInventory,
    removeFromInventory,
    useItem,
    takeDamage,
    resetPlayer,
    collectMonsterDrops,
    gainExperience,
    gainCoins,
    spendCoins,
  } = useGameStore();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [isDefending, setIsDefending] = useState(false);
  const [defenseProblem, setDefenseProblem] = useState<MathProblem | null>(null);
  const [isHeroAttacking, setIsHeroAttacking] = useState(false);
  const [isMonsterAttacking, setIsMonsterAttacking] = useState(false);
  const [showShield, setShowShield] = useState(false);
  const [heroName, setHeroName] = useState('');
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [itemEffectMessage, setItemEffectMessage] = useState<string | null>(null);
  const [monstersDefeated, setMonstersDefeated] = useState(0);
  const [showStore, setShowStore] = useState(false);

  // Calculate damage based on player level and monster level
  const calculateDamage = () => {
    const baseDamage = 10 + (player.level * 2) + player.strength + player.damage;
    const monsterLevel = currentMonster?.level || player.level;
    const levelDifference = monsterLevel - player.level;
    
    // Adjust damage based on level difference
    const damageMultiplier = levelDifference > 0 ? 1.2 : levelDifference < 0 ? 0.8 : 1;
    
    return Math.floor(baseDamage * damageMultiplier);
  };

  // Handle monster defeat and progression
  const handleMonsterDefeat = () => {
    if (!currentMonster) return;
    
    const { experience, coins } = currentMonster.rewards;
    gainExperience(experience);
    gainCoins(coins.gold, coins.silver, coins.copper);
    
    // Collect items and show feedback
    const drops = generateMonsterDrops(currentMonster.level);
    if (drops.length > 0) {
      drops.forEach((item: Item) => {
        addToInventory(item);
        setMessage(prev => prev + `\nYou found a ${item.name}!`);
      });
    }
    
    // Increment monsters defeated counter
    const newMonstersDefeated = monstersDefeated + 1;
    setMonstersDefeated(newMonstersDefeated);
    
    // Show store every 5 monsters
    if (newMonstersDefeated % 5 === 0) {
      setShowStore(true);
      setCurrentMonster(null);
      return;
    }
    
    // Random chance to spawn a new monster of higher level
    const shouldLevelUp = Math.random() < 0.3;
    const newMonsterLevel = shouldLevelUp ? currentMonster.level + 1 : currentMonster.level;
    const newMonster = generateMonster(newMonsterLevel);
    
    setCurrentMonster(newMonster);
    setMessage(
      `You defeated the ${currentMonster.name}! ` +
      (shouldLevelUp 
        ? `A stronger ${newMonster.name} appears! (Level ${newMonster.level})`
        : `A new ${newMonster.name} appears! (Level ${newMonster.level})`)
    );
    setIsDefending(false);
    setDefenseProblem(null);
    setAnswer('');
  };

  // Check for game over
  useEffect(() => {
    if (player.currentHp <= 0) {
      setMessage('Game Over! Your hero has fallen...');
      setCurrentMonster(null);
    }
  }, [player.currentHp, setCurrentMonster]);

  const handleSpawnMonster = () => {
    if (player.currentHp <= 0) {
      resetPlayer();
      setMessage('');
    }
    setCurrentMonster(generateMonster(player.level));
    setMessage('');
    setAnswer('');
    setIsDefending(false);
    setDefenseProblem(null);
  };

  const startMonsterTurn = () => {
    if (currentMonster && currentMonster.hp > 0) {
      setIsDefending(true);
      setDefenseProblem(generateMathProblem(currentMonster.level));
      setIsMonsterAttacking(true);
      setTimeout(() => setIsMonsterAttacking(false), 1000);
      
      // Calculate monster damage based on level difference and player defense
      const baseMonsterDamage = Math.floor(15 + (currentMonster.level * 2));
      const damageReduction = Math.floor(player.defense * 0.5); // Each point of defense reduces damage by 0.5
      const monsterDamage = Math.max(1, baseMonsterDamage - damageReduction); // Minimum 1 damage
      
      setMessage(`The monster is attacking! Solve the problem to defend yourself! (${monsterDamage} damage)`);
      setAnswer('');
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentMonster) return;

    // Get the correct math problem based on whether we're defending or attacking
    const currentProblem = isDefending ? defenseProblem : currentMonster.mathProblem;
    if (!currentProblem) return;

    const isCorrect = parseInt(answer) === currentProblem.answer;
    
    if (isCorrect) {
      if (isDefending) {
        setMessage(`You successfully defended against ${currentMonster.name}'s attack!`);
        setShowShield(true);
        setTimeout(() => setShowShield(false), 1000);
        setDefenseProblem(null);
        setIsDefending(false);
        setIsMonsterAttacking(false);
      } else {
        setIsHeroAttacking(true);
        setTimeout(() => setIsHeroAttacking(false), 1000);
        const damage = calculateDamage();
        const updatedMonster = { ...currentMonster, hp: currentMonster.hp - damage };
        setCurrentMonster(updatedMonster);
        setMessage(`You dealt ${damage} damage to ${currentMonster.name}!`);
        
        if (updatedMonster.hp <= 0) {
          handleMonsterDefeat();
        } else {
          // Start monster's turn after successful attack
          startMonsterTurn();
        }
      }
    } else {
      if (isDefending) {
        // Calculate monster damage based on level difference and player defense
        const baseMonsterDamage = Math.floor(15 + (currentMonster.level * 2));
        const damageReduction = Math.floor(player.defense * 0.5); // Each point of defense reduces damage by 0.5
        const monsterDamage = Math.max(1, baseMonsterDamage - damageReduction); // Minimum 1 damage
    
        takeDamage(monsterDamage);
        setMessage(`You failed to defend! ${currentMonster.name} dealt ${monsterDamage} damage!`);
        setDefenseProblem(null);
        setIsDefending(false);
        setIsMonsterAttacking(false);
      } else {
        takeDamage(10);
        setMessage(`Wrong answer! You take 10 damage!`);
        // Start monster's turn after failed attack
        startMonsterTurn();
      }
    }
    
    setAnswer('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroName.trim()) {
      setPlayerName(heroName.trim());
      setIsNameSubmitted(true);
    }
  };

  const handleUseItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    useItem(itemId);
    
    // Show effect message based on item type
    let effectMessage = '';
    switch (item.effect.type) {
      case 'heal':
        effectMessage = `Restored ${item.effect.power} HP!`;
        break;
      case 'strength':
        effectMessage = `Gained ${item.effect.power} strength!`;
        break;
      case 'defense':
        effectMessage = `Gained ${item.effect.power} defense!`;
        break;
      case 'damage':
        effectMessage = `Increased damage by ${item.effect.power}!`;
        break;
      case 'teleport':
        effectMessage = 'Teleported to safety!';
        break;
      case 'identify':
        effectMessage = 'Item identified!';
        break;
      case 'bless':
        effectMessage = 'Blessed with good fortune!';
        break;
    }
    
    setItemEffectMessage(effectMessage);
    setTimeout(() => setItemEffectMessage(null), 2000); // Clear message after 2 seconds
  };

  const handlePurchase = (item: Item) => {
    if (spendCoins(item.value)) {
      addToInventory(item);
      setMessage(`You purchased a ${item.name}!`);
    } else {
      setMessage("You don't have enough coins!");
    }
  };

  const handleCloseStore = () => {
    setShowStore(false);
    // Spawn a new monster after closing the store
    const newMonster = generateMonster(player.level);
    setCurrentMonster(newMonster);
    setMessage(`A new ${newMonster.name} appears! (Level ${newMonster.level})`);
  };

  const renderInventory = () => {
    if (inventory.length === 0) {
      return (
        <div className="text-gray-400 text-center py-4">
          Your inventory is empty. Defeat monsters to collect items!
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-red-400">{item.name}</h3>
              {item.quantity && item.quantity > 1 && (
                <span className="text-gray-400">x{item.quantity}</span>
              )}
            </div>
            <p className="text-gray-300 text-sm mb-2">{item.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-yellow-500">{item.value} coins</span>
              <button
                onClick={() => handleUseItem(item.id)}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-bold rounded-lg 
                         transition-colors duration-200 shadow-lg hover:shadow-red-900/50 border border-red-900"
              >
                Use
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isNameSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl shadow-2xl p-8 mb-6 text-gray-200 border border-gray-700">
            <h1 className="text-5xl font-bold mb-8 text-center text-red-500 drop-shadow-lg font-gothic">
              Math Legends
            </h1>
            <form onSubmit={handleNameSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <label htmlFor="heroName" className="block text-xl font-semibold mb-2 text-red-400">
                  Enter Your Hero's Name
                </label>
                <input
                  type="text"
                  id="heroName"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white text-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your hero's name"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 bg-red-800 hover:bg-red-700 text-white text-xl font-bold rounded-lg 
                         transition-colors duration-200 shadow-lg hover:shadow-red-900/50 border border-red-900"
              >
                Begin Adventure
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl shadow-2xl p-8 mb-6 text-gray-200 border border-gray-700">
          <h1 className="text-5xl font-bold mb-8 text-center text-red-500 drop-shadow-lg font-gothic">
            Math Legends
          </h1>
          
          {/* Game Arena - Hero and Monster Side by Side */}
          <div className="mb-8 grid grid-cols-2 gap-8">
            {/* Hero Section */}
            <div className="p-6 bg-gray-800/80 rounded-xl border border-gray-700 shadow-inner">
              <div className="flex h-full">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-red-400 font-gothic">
                    {player.name || 'Hero'}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Level:</span>
                      <span className="text-xl font-bold text-red-400">{player.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Experience:</span>
                      <span className="text-xl font-bold text-purple-400">{player.experience}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Coins:</span>
                      <span className="text-xl font-bold">
                        <span className="text-yellow-500">{player.coins.gold}g </span>
                        <span className="text-gray-400">{player.coins.silver}s </span>
                        <span className="text-orange-500">{player.coins.copper}c</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">HP:</span>
                      <div className="flex-1 ml-2">
                        <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                          <div 
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ 
                              width: `${(player.currentHp / player.maxHp) * 100}%`,
                              backgroundColor: player.currentHp < player.maxHp * 0.3 ? '#7f1d1d' : 
                                            player.currentHp < player.maxHp * 0.6 ? '#b91c1c' : '#dc2626'
                            }}
                          />
                        </div>
                        <div className="text-sm text-center mt-1 text-gray-300">
                          {player.currentHp}/{player.maxHp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Strength:</span>
                      <span className="text-xl font-bold text-orange-400">{player.strength}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Defense:</span>
                      <span className="text-xl font-bold text-blue-400">{player.defense}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Damage:</span>
                      <span className="text-xl font-bold text-red-500">{player.damage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Base Attack:</span>
                      <span className="text-xl font-bold text-red-500">{calculateDamage()}</span>
                    </div>
                  </div>
                </div>
                <div className={`w-40 h-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-700 ml-6 transition-transform duration-500 relative ${
                  isHeroAttacking ? 'translate-x-8' : ''
                }`}>
                  <img 
                    src={HERO_AVATAR} 
                    alt="Hero" 
                    className="w-full h-full object-cover"
                  />
                  {showShield && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-shield w-24 h-24">
                        <img 
                          src="/images/shield/shield.png" 
                          alt="Shield" 
                          className="w-full h-full object-contain drop-shadow-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monster Section */}
            {player.currentHp <= 0 ? (
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-6 font-gothic">Game Over!</div>
                  <button
                    onClick={handleSpawnMonster}
                    className="px-8 py-4 bg-red-800 hover:bg-red-700 text-white text-xl font-bold rounded-lg 
                             transition-colors duration-200 shadow-lg hover:shadow-red-900/50 border border-red-900"
                  >
                    Start New Game
                  </button>
                </div>
              </div>
            ) : currentMonster ? (
              <div className="p-6 bg-gray-800/80 rounded-xl border border-gray-700 shadow-inner">
                <div className="flex h-full">
                  <div className={`w-40 h-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-700 mr-6 transition-transform duration-500 ${
                    isMonsterAttacking ? '-translate-x-8' : ''
                  }`}>
                    <img 
                      src={currentMonster.image} 
                      alt={currentMonster.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-4 text-red-400 font-gothic">
                      {currentMonster.name} <span className="text-lg">(Level {currentMonster.level})</span>
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">HP:</span>
                        <div className="flex-1 ml-2">
                          <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                            <div 
                              className="h-full bg-red-600 transition-all duration-300"
                              style={{ 
                                width: `${(currentMonster.hp / currentMonster.maxHp) * 100}%`,
                                backgroundColor: currentMonster.hp < currentMonster.maxHp * 0.3 ? '#7f1d1d' : 
                                              currentMonster.hp < currentMonster.maxHp * 0.6 ? '#b91c1c' : '#dc2626'
                              }}
                            />
                          </div>
                          <div className="text-sm text-center mt-1 text-gray-300">
                            {currentMonster.hp}/{currentMonster.maxHp}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <button
                  onClick={handleSpawnMonster}
                  className="px-8 py-4 bg-red-800 hover:bg-red-700 text-white text-xl font-bold rounded-lg 
                           transition-colors duration-200 shadow-lg hover:shadow-red-900/50 border border-red-900"
                >
                  Find Monster
                </button>
              </div>
            )}
          </div>

          {/* Inventory Section */}
          <div className="p-6 bg-gray-800/80 rounded-xl border border-gray-700 shadow-inner mb-6">
            <h2 className="text-2xl font-gothic text-purple-400 mb-4">Inventory</h2>
            {renderInventory()}
          </div>

          {/* Combat Interface */}
          {currentMonster && player.currentHp > 0 && (
            <div className="p-6 bg-gray-800/80 rounded-xl border border-gray-700 shadow-inner">
              <div className="text-lg text-center mb-4">
                <span className={isDefending ? "text-blue-400" : "text-red-400"}>
                  {isDefending ? "Defend against the monster's attack!" : "Attack the monster!"}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-200 text-center mb-4 font-gothic">
                {isDefending && defenseProblem 
                  ? defenseProblem.question 
                  : currentMonster.mathProblem.question}
              </div>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-gray-900 border border-gray-700 p-3 rounded-lg text-white text-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your answer"
                />
                <button
                  onClick={handleSubmitAnswer}
                  className={`px-8 py-3 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg border
                            ${isDefending 
                              ? 'bg-blue-900 hover:bg-blue-800 hover:shadow-blue-900/50 border-blue-800' 
                              : 'bg-red-900 hover:bg-red-800 hover:shadow-red-900/50 border-red-800'}`}
                >
                  {isDefending ? 'Defend!' : 'Attack!'}
                </button>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center text-lg font-semibold ${
              message.includes('Correct') || message.includes('successfully')
                ? 'bg-green-900/50 border border-green-800 text-green-300'
                : message.includes('Game Over')
                ? 'bg-red-900/50 border border-red-800 text-red-300'
                : 'bg-yellow-900/50 border border-yellow-800 text-yellow-300'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Item Effect Message */}
      {itemEffectMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-green-900/90 text-white px-6 py-3 rounded-lg text-xl font-bold 
                        animate-fade-in-out z-50">
          {itemEffectMessage}
        </div>
      )}

      {/* Store Modal */}
      {showStore && (
        <Store
          onClose={handleCloseStore}
          onPurchase={handlePurchase}
          coins={player.coins}
        />
      )}
    </div>
  );
}; 