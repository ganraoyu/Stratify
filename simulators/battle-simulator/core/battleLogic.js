const express = require('express');
const router = express.Router();

const HexCell = require('../utils/HexCell.js');
const Board = require('./board.js');

const { 
    addAdditionalItemStatistics, 
    dragonsClawEffect, 
    brambleVestEffect, 
    bloodthristerEffect, 
    archangelsStaffEffect, 
    giantSlayerEffect, 
    steraksGageEffect, 
    runnansHurricaneEffect,
    titansResolveEffect,
    steadfastHeartEffect,
    crownguardEffect,
    handOfJusticeEffect,
    guardBreakerEffect,
    nashorsToothEffect,
    hextechGunbladeEffect,
    protectorsVowEffect,
    redBuffEffect,
    morellonomiconEffect,
    gargoyleStoneplateEffect,
    sunfireCapeEffect,
    ionicSparkEffect,
    adaptiveHelmEffect,
    evenshroudEffect,
    redemptionEffect,
    edgeOfNightEffect,
    quickSilverEffect
} = require('../data/item/itemLogic.ts');   

const { getChampionByName } = require('../data/champion/champion-data.ts');
const { displayStats, Champion } = require('../data/champion/champion.ts');
const { Item } = require('../data/item/item.ts');
const { getItemByName } = require('../data/item/item-data.ts');
const { Trait } = require('../data/trait/trait.ts');
const { getTraitByName } = require('../data/trait/trait-data.ts');
const { getDistanceBetweenCells, findClosestEnemy, moveChampionTowardsTarget } = require('./movementLogic.js');

/*
cd simulators/battle-simulator/core
nodemon battlelogic
*/
   
const board = new Board(8, 7);

function getFormattedTime(battleTime) {
    const mins = Math.floor(battleTime / 6000);
    const secs = Math.floor((battleTime % 6000) / 100);
    const cents = battleTime % 100;
    const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}.${cents.toString().padStart(2, '0')}`;
    return formattedTime;
}

function placeChampionByName(championName, row, column, starLevel, team) {
    const champion = getChampionByName(championName);
    if (typeof champion === 'string') {
        console.log(champion);
    } else {
        const newChampion = new Champion(
            champion.name, 
            champion.cost, 
            champion.movementSpeed,
            champion.traitsList, 
            champion.shield,
            champion.statsByStarLevel,
            champion.attackSpeed, 
            champion.abilityName, 
            champion.range, 
            champion.mana, 
            champion.manaPerAttack, 
            champion.abilityManaCost, 
            champion.attackCritChance, 
            champion.attackCritDamage, 
            champion.abilityCritChance,
            champion.abilityCritDamage,
            champion.damageAmp,
            champion.sunder,
            champion.shred,
            champion.wound,
            champion.burn,
            champion.immunity,
            champion.abilityPower,
            champion.omnivamp,
            champion.durability,
            champion.timeUntilAttack,
            champion.attackArray,
            champion.abilityArray,
            champion.healArray,            
            champion.items,
        );
        newChampion.setStarLevel(starLevel);
        newChampion.team = team; // Assign the team to the champion
        board.placeChampion(newChampion, row, column);
    }
}

function initializeTeams() {
    let player = [];
    let opponent = [];
    
    // Assign champions to the player team (bottom 4 rows)
    for (let row = 4; row < board.rows; row++) {
        for (let column = 0; column < board.columns; column++) {
            const champion = board.getChampion(row, column);
            if (champion) {
                player.push(champion);
            }
        }
    }
    
    // Assign champions to the opponent team (top 4 rows)
    for (let row = 0; row < 4; row++) {
        for (let column = 0; column < board.columns; column++) {
            const champion = board.getChampion(row, column);
            if (champion) {
                opponent.push(champion);
            }
        }
    }
    
    console.log('Player team:', player.map(champion => champion.name));
    console.log('Opponent team:', opponent.map(champion => champion.name));

    return { player, opponent };
}

function addItemByName(champion, itemName) {
    const item = getItemByName(itemName);

    if (typeof item === 'string') {
        throw new Error(item);
    } else { 
        champion.items.push(item);
    }   
}

function checkChampionTraits(champion) {
    let combinedTraitsObject = {
        name: champion.name,
        traits: []  
    };

    const traits = champion.traitsList;

    for (let i = 0; i < traits.length; i++) {
        const trait = getTraitByName(traits[i]);

        if (trait) {
            combinedTraitsObject.traits.push({
                trait: trait.name,
                numberOfTrait: 1,  
            });
        } else {
            console.log('Trait not found');
        }
    }

    return combinedTraitsObject;
}

function addAdditionalTraitStatistics(champion) {
    let traitCounts = {};

    const combinedTraitsObject = checkChampionTraits(champion); // Get combined traits object
    const traitStats = combinedTraitsObject.traits.map(trait => getTraitByName(trait.trait)); // Extract trait names and their corresponding stats

    combinedTraitsObject.traits.forEach(trait => {
        if (traitCounts[trait.trait]) {
            traitCounts[trait.trait]++;
        } else {
            traitCounts[trait.trait] = 1;
        }
    });

    combinedTraitsObject.traits.forEach((trait) => {
        const traitStatsForTrait = traitStats.find(t => t.name === trait.trait);

        if (trait.trait === traitStatsForTrait.name && traitCounts[traitStatsForTrait.name] >= 1) {       
            champion.statsByStarLevel[champion.starLevel].hp += parseFloat(traitStatsForTrait.stats.additionalHealth) || 0;          
            champion.currentHp += parseFloat(traitStatsForTrait.stats.additionalHealth) || 0;           
            champion.statsByStarLevel[champion.starLevel].armor += parseFloat(traitStatsForTrait.stats.additionalArmor) || 0;
            champion.statsByStarLevel[champion.starLevel].attackDamage += parseFloat(traitStatsForTrait.stats.additionalAttackDamage) || 0;
            champion.statsByStarLevel[champion.starLevel].attackSpeed += parseFloat(traitStatsForTrait.stats.additionalAttackSpeed) || 0;
            champion.statsByStarLevel[champion.starLevel].magicResist += parseFloat(traitStatsForTrait.stats.additionalMagicResist) || 0;
            champion.statsByStarLevel[champion.starLevel].mana += parseFloat(traitStatsForTrait.stats.additionalMana) || 0;
            champion.statsByStarLevel[champion.starLevel].manaPerAttack += parseFloat(traitStatsForTrait.stats.additionalManaPerAttack) || 0;
            champion.statsByStarLevel[champion.starLevel].abilityPower += parseFloat(traitStatsForTrait.stats.additionalAbilityPower) || 0;
            champion.statsByStarLevel[champion.starLevel].abilityManaCost -= parseFloat(traitStatsForTrait.stats.reducedMaxMana) || 0;
            champion.statsByStarLevel[champion.starLevel].attackCritChance += parseFloat(traitStatsForTrait.stats.additionalCritChance) || 0;
            champion.statsByStarLevel[champion.starLevel].attackCritDamage += parseFloat(traitStatsForTrait.stats.additionalCritDamage) || 0;
            champion.statsByStarLevel[champion.starLevel].omnivamp += parseFloat(traitStatsForTrait.stats.additionalOmnivamp) || 0;
            champion.statsByStarLevel[champion.starLevel].durability += parseFloat(traitStatsForTrait.stats.additionalDurability) || 0;
            champion.statsByStarLevel[champion.starLevel].range += parseFloat(traitStatsForTrait.stats.additionalAttackRange) || 0;
        } else {
            console.log('Error: Trait not processed correctly');
        }
    });
}

function simulateRound(battlePlayer, battleOpponent, battleTime) {
    let attackOccurred = false;
    let updatedBattleTime = battleTime;

    let movementOccurred = false;


    for (const champion of battlePlayer) {
        if (champion.currentHp <= 0) continue;
        
        const { closestEnemy, distance } = findClosestEnemy(champion, battleOpponent, board);
        
        if (closestEnemy) {
            if (distance <= champion.range) {
                if (champion.attack(closestEnemy, updatedBattleTime)) {
                    attackOccurred = true;
                }
            } else {
                const moveTime = moveChampionTowardsTarget(champion, closestEnemy, board, updatedBattleTime);

                if (moveTime) {
                    updatedBattleTime += moveTime;
                    movementOccurred = true;
                    break; 
                }
            }
        }
    }

    if (!movementOccurred) {
        for (const champion of battleOpponent) {
            if (champion.currentHp <= 0) continue;
            
            const { closestEnemy, distance } = findClosestEnemy(champion, battlePlayer, board);
            
            if (closestEnemy) {
                if (distance <= champion.range) {
                    if (champion.attack(closestEnemy, updatedBattleTime)) {
                        attackOccurred = true;
                    }
                } else {
                    const moveTime = moveChampionTowardsTarget(champion, closestEnemy, board, updatedBattleTime);
                    if (moveTime) {
                        updatedBattleTime += moveTime;
                        movementOccurred = true;
                        break;
                    }
                }
            }
        }
    }

    battlePlayer.forEach(champion => {
        if (champion.currentHp <= 0) {
            const [row, col] = board.getChampionPosition(champion);

            if (row !== undefined && col !== undefined) {
                board.removeChampion(row, col);
            }
        }
    });
    
    battleOpponent.forEach(champion => {
        if (champion.currentHp <= 0) {
            const [row, col] = board.getChampionPosition(champion);

            if (row !== undefined && col !== undefined) {
                board.removeChampion(row, col);
            }
        }
    });

    battlePlayer.filter(champion => champion.currentHp > 0);
    battleOpponent.filter(champion => champion.currentHp > 0);


    return { 
        battlePlayer, 
        battleOpponent, 
        attackOccurred,
        movementOccurred,
        battleTime: updatedBattleTime 
    };
}

function calculateWinRates(playerWins, opponentWins) {
    const playerWinRate = (playerWins.length / 100) * 100 + '%';
    const opponentWinRate = (opponentWins.length / 100) * 100 + '%';
    return { playerWinRate, opponentWinRate };
}

function startBattle() {
    console.log('Battle started!');

    let { player, opponent } = initializeTeams();
    let playerWins = [];
    let opponentWins = [];

    let battlePlayer = [...player];
    let battleOpponent = [...opponent];
    
    console.log("Starting battle with champions:");
    console.log("Player:", battlePlayer.map(c => `${c.name} (Attack Speed: ${c.attackSpeed.toFixed(2)})`));
    console.log("Opponent:", battleOpponent.map(c => `${c.name} (Attack Speed: ${c.attackSpeed.toFixed(2)})`));
    
    const BATTLE_STEP = 1; 
    const MAX_BATTLE_TIME = 30000; 

    let battleTime = 0;

    while (
        battlePlayer.some(champion => champion.currentHp > 0) && 
        battleOpponent.some(champion => champion.currentHp > 0) && 
        battleTime <= MAX_BATTLE_TIME
    ) {
        const result = simulateRound(battlePlayer, battleOpponent, battleTime); 
        
        battlePlayer = result.battlePlayer;
        battleOpponent = result.battleOpponent;
        battleTime = result.battleTime; 
        
        if (!result.movementOccurred && !result.attackOccurred) {
            battleTime += BATTLE_STEP;
        }
    
        const formattedTime = getFormattedTime(battleTime);

        if (battleTime % 100 === 0) {
            console.log(`Battle time: ${formattedTime} (${battleTime/100} seconds)`);
            
            const playerTeamStats = battlePlayer.map(champion => {
                return [
                    `${champion.name}`,
                    `(${champion.currentHp.toFixed(2)} HP,`,
                    `${champion.shield} shield,`,
                    `${champion.mana}/${champion.abilityManaCost} mana),`,  
                    `(Attack Speed: ${champion.attackSpeed.toFixed(2)})`
                ].join(' ');
            });
            
            const opponentTeamStats = battleOpponent.map(champion => {
                return [
                    `${champion.name}`,
                    `(${champion.currentHp.toFixed(2)} HP,`,
                    `${champion.shield} shield,`,
                    `${champion.mana}/${champion.abilityManaCost} mana),`,
                    `(Attack Speed: ${champion.attackSpeed.toFixed(2)})`
                ].join(' ');
            });
            
            console.log('Player team:', playerTeamStats);
            console.log('Opponent team:', opponentTeamStats);
        }

        battlePlayer.forEach(champion => {            
            const target = battleOpponent.find(c => c.currentHp > 0);
            const ally = battlePlayer.reduce((max, c) => (c.currentHp > max.currentHp ? c : max), battlePlayer[0]);
            const { championsInRadius, surroundingOpponents, surroundingAllies } = board.getSurroundingChampionsByRadius(champion, 2);
            const { championsInRadiusByTarget, surroundingChampionsAroundTarget } = board.getSurroundingChampionsByRadius(target, 2);
            const [row, column] = board.getChampionPosition(champion);

            let isChampionFrontOrBack; // True = front, False = back
            row >= 4 ? isChampionFrontOrBack = true : isChampionFrontOrBack = false;

            dragonsClawEffect(champion, battleTime);
            bloodthristerEffect(champion, battleTime);
            archangelsStaffEffect(champion, battleTime);
            runnansHurricaneEffect(champion, battleTime);
            steraksGageEffect(champion, battleTime);
            titansResolveEffect(champion, battleTime);
            steadfastHeartEffect(champion, battleTime);
            crownguardEffect(champion, battleTime);
            handOfJusticeEffect(champion, battleTime);
            nashorsToothEffect(champion, battleTime);
            protectorsVowEffect(champion, battleTime);
            gargoyleStoneplateEffect(champion, battleTime);
            ionicSparkEffect(champion, target, surroundingOpponents, battleTime);
            adaptiveHelmEffect(champion, isChampionFrontOrBack, battleTime);
            evenshroudEffect(champion, surroundingOpponents, battleTime );
            redemptionEffect(champion, surroundingAllies, battleTime);
            edgeOfNightEffect(champion, battleTime);
            quickSilverEffect(champion, battleTime);

            if(ally){
                hextechGunbladeEffect(champion, ally, battleTime);
            }

            if (target) {
                guardBreakerEffect(champion, target, battleTime);
                giantSlayerEffect(champion, target, battleTime);
                brambleVestEffect(champion, target, battleTime);
                redBuffEffect(champion, target, battleTime);
                morellonomiconEffect(champion, target, battleTime);
                sunfireCapeEffect(champion, target, surroundingOpponents, battleTime);

            }
        });

        battleOpponent.forEach(champion => {
            const target = battleOpponent.find(c => c.currentHp > 0);
            const ally = battleOpponent.reduce((max, c) => (c.currentHp > max.currentHp ? c : max), battleOpponent[0]);
            const { championsInRadius, surroundingOpponents, surroundingAllies } = board.getSurroundingChampionsByRadius(champion, 2);
            const { championsInRadiusByTarget, surroundingChampionsAroundTarget } = board.getSurroundingChampionsByRadius(target, 2);
            const [row, column] = board.getChampionPosition(champion);

            let isChampionFrontOrBack; // True = front, False = back
            row >= 4 ? isChampionFrontOrBack = true : isChampionFrontOrBack = false;

            dragonsClawEffect(champion, battleTime);
            bloodthristerEffect(champion, battleTime);
            archangelsStaffEffect(champion, battleTime);
            runnansHurricaneEffect(champion, battleTime);
            steraksGageEffect(champion, battleTime);
            titansResolveEffect(champion, battleTime);
            steadfastHeartEffect(champion, battleTime);
            crownguardEffect(champion, battleTime);
            handOfJusticeEffect(champion, battleTime);
            nashorsToothEffect(champion, battleTime);
            protectorsVowEffect(champion, battleTime);
            gargoyleStoneplateEffect(champion, battleTime);
            ionicSparkEffect(champion, target, surroundingOpponents, battleTime);
            adaptiveHelmEffect(champion, isChampionFrontOrBack, battleTime);
            evenshroudEffect(champion, surroundingOpponents, battleTime );
            redemptionEffect(champion, surroundingAllies, battleTime);
            edgeOfNightEffect(champion, battleTime);
            quickSilverEffect(champion, battleTime);

            if(ally){
                hextechGunbladeEffect(champion, ally, battleTime);
            }

            if (target) {
                guardBreakerEffect(champion, target, battleTime);
                giantSlayerEffect(champion, target, battleTime);
                brambleVestEffect(champion, target, battleTime);
                redBuffEffect(champion, target, battleTime);
                morellonomiconEffect(champion, target, battleTime);
                sunfireCapeEffect(champion, target, surroundingOpponents, battleTime);

            }
        });

    }
    
    if (battlePlayer.some(champion => champion.currentHp > 0)) {
        playerWins.push(1);
        console.log("Player team wins!");
    } else if (battleOpponent.some(champion => champion.currentHp > 0)) {
        opponentWins.push(1);
        console.log("Opponent team wins!");
    } else {
        console.log('No champions left standing - Draw!');
    }
    
    board.displayBoard();
    console.log('Battle ended after', (battleTime/100).toFixed(2), 'seconds of simulated time.');
    
    const { playerWinRate, opponentWinRate } = calculateWinRates(playerWins, opponentWins);

    const playerStatistics = player.map((champion, index) => {
        if (index < battlePlayer.length) {
            champion.damageArray = battlePlayer[index].damageArray || [];
            champion.abilityArray = battlePlayer[index].abilityArray || [];
            champion.healArray = battlePlayer[index].healArray || [];
        }
        
        return {
            name: champion.name,
            items: champion.items,
            HP: index < battlePlayer.length ? battlePlayer[index].currentHp : 0,
            baseHP: champion.statsByStarLevel[champion.starLevel].hp,
            damageArray: champion.damageArray,
            abilityArray: champion.abilityArray,
            healArray: champion.healArray
        };
    });

    const opponentStatistics = opponent.map((champion, index) => {
        if (index < battleOpponent.length) {
            champion.damageArray = battleOpponent[index].damageArray || [];
            champion.abilityArray = battleOpponent[index].abilityArray || [];
            champion.healArray = battleOpponent[index].healArray || [];
        }
        
        return {
            name: champion.name,
            items: champion.items,
            HP: index < battleOpponent.length ? battleOpponent[index].currentHp : 0,
            baseHP: champion.statsByStarLevel[champion.starLevel].hp,
            damageArray: champion.damageArray,
            abilityArray: champion.abilityArray,
            healArray: champion.healArray
        };
    });
    
    return { 
        playerWinRate, 
        opponentWinRate, 
        playerStatistics, 
        opponentStatistics,
        battleDuration: battleTime/100 
    }; 
}

placeChampionByName('Akali', 4, 3, 3, 'player');
placeChampionByName('Darius', 3, 3, 3, 'opponent'); 

addItemByName(board.getChampion(4,3), 'Quick Silver');
addItemByName(board.getChampion(3,3), 'Nashor\'s Tooth');

console.log(board.getChampion(4,3));

board.displayBoard();
module.exports = { router, startBattle };