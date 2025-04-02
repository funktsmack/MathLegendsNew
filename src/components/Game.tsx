import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Monster, MathProblem } from '../types/game';

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
  // Level 1-2: 2 monsters
  // Level 3-5: 3 monsters
  // Level 6-8: 4 monsters
  // Level 9+: 5 monsters
  const availableMonsters = Math.min(
    2 + Math.floor((level - 1) / 3), // Start with 2 monsters, add 1 every 3 levels
    monsters.length
  );
  
  // Randomly select from available monsters
  const monsterIndex = Math.floor(Math.random() * availableMonsters);
  const name = monsters[monsterIndex];
  
  // Scale HP and rewards based on monster level
  const monsterLevel = Math.max(1, level + Math.floor(Math.random() * 3) - 1); // Random level variation
  const baseHp = 50 + (monsterLevel * 15); // Increased HP scaling
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    level: monsterLevel,
    hp: baseHp,
    maxHp: baseHp,
    image: MONSTER_AVATARS[name as keyof typeof MONSTER_AVATARS],
    mathProblem: generateMathProblem(monsterLevel),
    rewards: {
      experience: 25 * monsterLevel, // Increased experience reward
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
  const { player, currentMonster, gainExperience, gainCoins, setCurrentMonster, takeDamage, resetPlayer } = useGameStore();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [isDefending, setIsDefending] = useState(false);
  const [defenseProblem, setDefenseProblem] = useState<MathProblem | null>(null);
  const [isHeroAttacking, setIsHeroAttacking] = useState(false);
  const [isMonsterAttacking, setIsMonsterAttacking] = useState(false);
  const [showShield, setShowShield] = useState(false);

  // Calculate damage based on player level and monster level
  const calculateDamage = () => {
    const baseDamage = 10 + (player.level * 2);
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
    
    // Random chance to spawn a new monster of higher level
    const shouldLevelUp = Math.random() < 0.3; // 30% chance to face a higher level monster
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
      
      // Calculate monster damage based on level difference
      const monsterDamage = Math.floor(15 + (currentMonster.level * 2));
      setMessage(`The monster is attacking! Solve the problem to defend yourself! (${monsterDamage} damage)`);
      setAnswer('');
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentMonster) return;

    const userAnswer = parseInt(answer);
    if (isNaN(userAnswer)) {
      setMessage('Please enter a valid number!');
      return;
    }

    if (isDefending) {
      // Handle defense
      if (defenseProblem && userAnswer === defenseProblem.answer) {
        setShowShield(true);
        setTimeout(() => {
          setShowShield(false);
          setMessage("You successfully defended against the monster's attack!");
          setIsDefending(false);
          setDefenseProblem(null);
        }, 1000);
      } else {
        const monsterDamage = Math.floor(15 + (currentMonster.level * 2));
        setIsMonsterAttacking(true);
        setTimeout(() => {
          setIsMonsterAttacking(false);
          takeDamage(monsterDamage);
          setMessage(`Wrong answer! The monster hits you for ${monsterDamage} damage! (${defenseProblem?.answer} was correct)`);
          setIsDefending(false);
          setDefenseProblem(null);
        }, 500);
      }
    } else {
      // Handle attack
      if (userAnswer === currentMonster.mathProblem.answer) {
        const damage = calculateDamage();
        setIsHeroAttacking(true);
        setTimeout(() => {
          setIsHeroAttacking(false);
          const updatedMonster = {
            ...currentMonster,
            hp: Math.max(0, currentMonster.hp - damage)
          };
          setCurrentMonster(updatedMonster);
          
          if (updatedMonster.hp <= 0) {
            handleMonsterDefeat();
          } else {
            setMessage(`Correct! You dealt ${damage} damage to the ${currentMonster.name}!`);
            startMonsterTurn();
          }
        }, 500);
      } else {
        const monsterDamage = Math.floor(15 + (currentMonster.level * 2));
        setIsMonsterAttacking(true);
        setTimeout(() => {
          setIsMonsterAttacking(false);
          takeDamage(monsterDamage);
          setMessage(`Wrong answer! You stumble and take ${monsterDamage} damage! (${currentMonster.mathProblem.answer} was correct)`);
          
          if (player.currentHp > monsterDamage) {
            startMonsterTurn();
          }
        }, 500);
      }
    }
    setAnswer('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 mb-6 text-white">
          <h1 className="text-5xl font-bold mb-8 text-center text-yellow-400 drop-shadow-lg">
            Math Legends
          </h1>
          
          {/* Game Arena - Hero and Monster Side by Side */}
          <div className="mb-8 grid grid-cols-2 gap-8">
            {/* Hero Section */}
            <div className="p-6 bg-blue-900/50 rounded-xl border border-blue-500/30">
              <div className="flex h-full">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-blue-300">Hero Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-300">Level:</span>
                      <span className="text-xl font-bold text-yellow-400">{player.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-300">Experience:</span>
                      <span className="text-xl font-bold text-purple-400">{player.experience}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-300">Coins:</span>
                      <span className="text-xl font-bold">
                        <span className="text-yellow-400">{player.coins.gold}g </span>
                        <span className="text-gray-300">{player.coins.silver}s </span>
                        <span className="text-orange-400">{player.coins.copper}c</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-300">HP:</span>
                      <div className="flex-1 ml-2">
                        <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ 
                              width: `${(player.currentHp / player.maxHp) * 100}%`,
                              backgroundColor: player.currentHp < player.maxHp * 0.3 ? '#ef4444' : 
                                            player.currentHp < player.maxHp * 0.6 ? '#f59e0b' : '#22c55e'
                            }}
                          />
                        </div>
                        <div className="text-sm text-center mt-1">
                          {player.currentHp}/{player.maxHp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`w-40 h-full rounded-lg overflow-hidden shadow-lg border-2 border-blue-400/30 ml-6 transition-transform duration-500 relative ${
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
                  <div className="text-3xl font-bold text-red-500 mb-6">Game Over!</div>
                  <button
                    onClick={handleSpawnMonster}
                    className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-lg 
                             transition-colors duration-200 shadow-lg hover:shadow-green-500/50"
                  >
                    Start New Game
                  </button>
                </div>
              </div>
            ) : currentMonster ? (
              <div className="p-6 bg-red-900/50 rounded-xl border border-red-500/30">
                <div className="flex h-full">
                  <div className={`w-40 h-full rounded-lg overflow-hidden shadow-lg border-2 border-red-400/30 mr-6 transition-transform duration-500 ${
                    isMonsterAttacking ? '-translate-x-8' : ''
                  }`}>
                    <img 
                      src={currentMonster.image} 
                      alt={currentMonster.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-4 text-red-300">
                      {currentMonster.name} <span className="text-lg">(Level {currentMonster.level})</span>
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-red-300">HP:</span>
                        <div className="flex-1 ml-2">
                          <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 transition-all duration-300"
                              style={{ 
                                width: `${(currentMonster.hp / currentMonster.maxHp) * 100}%`,
                                backgroundColor: currentMonster.hp < currentMonster.maxHp * 0.3 ? '#ef4444' : 
                                              currentMonster.hp < currentMonster.maxHp * 0.6 ? '#f59e0b' : '#22c55e'
                              }}
                            />
                          </div>
                          <div className="text-sm text-center mt-1 text-red-300">
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
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-lg 
                           transition-colors duration-200 shadow-lg hover:shadow-blue-500/50"
                >
                  Find Monster
                </button>
              </div>
            )}
          </div>

          {/* Combat Interface */}
          {currentMonster && player.currentHp > 0 && (
            <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-500/30">
              <div className="text-lg text-center mb-4">
                <span className={isDefending ? "text-blue-300" : "text-red-300"}>
                  {isDefending ? "Defend against the monster's attack!" : "Attack the monster!"}
                </span>
              </div>
              <div className="text-3xl font-bold text-white text-center mb-4">
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
                  className="flex-1 bg-white/10 border border-gray-500/30 p-3 rounded-lg text-white text-xl"
                  placeholder="Enter your answer"
                />
                <button
                  onClick={handleSubmitAnswer}
                  className={`px-8 py-3 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg
                            ${isDefending 
                              ? 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/50' 
                              : 'bg-red-600 hover:bg-red-500 hover:shadow-red-500/50'}`}
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
                ? 'bg-green-900/50 border border-green-500/30 text-green-300'
                : message.includes('Game Over')
                ? 'bg-red-900/50 border border-red-500/30 text-red-300'
                : 'bg-yellow-900/50 border border-yellow-500/30 text-yellow-300'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 