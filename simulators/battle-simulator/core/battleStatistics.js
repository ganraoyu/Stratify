const { startBattle } = require('./battleLogic.js');

/*
cd simulators/battle-simulator/core
nodemon battleStatistics
*/

const startBattleData = startBattle();

const calculateWinRate = async (req, res) => {
    try {
        const { playerWinRate, opponentWinRate } = startBattleData;
        console.log('Player win rate is ' + playerWinRate);
        console.log('Opponent win rate is ' + opponentWinRate);

        return { playerWinRate, opponentWinRate };
    } catch (error) {
        console.error('Error: ' + error);
        res.status(500).json({ error: 'An error occurred while calculating win rate.' });
    }
};

const calculateChampionItems = async (req, res) => {
    try{
        const { playerStatistics, opponentStatistics } = startBattleData; 

        const playerChampionItems = playerStatistics.map(champion => ({
            name: champion.name,
            items: champion.items
        }));

        const opponentChampionItems = opponentStatistics.map(champion => ({
            name: champion.name,
            items: champion.items   
        }));

        return { playerChampionItems, opponentChampionItems };
    } catch(error){
        console.error('Error: ' + error);
        res.status(500).json({ error: 'An error occurred while fetching champion items.' });
    }
}

const calculateAttackDamageDelt = async (req, res) => {
    try {
        const { playerStatistics, opponentStatistics } = startBattleData;

        if (playerStatistics.length === 0 || opponentStatistics.length === 0) {
            res.status(400).json({ error: 'No attack damage data available.' });
            throw new Error('No attack damage data available.');
        }

        const totalPlayerDamage = playerStatistics.map(champion => ({
            name: champion.name,
            totalDamage: champion.damageArray.reduce((total, damage) => total + damage, 0)
        }));
        
        const totalOpponentDamage = opponentStatistics.map(champion => ({
            name: champion.name,
            totalDamage: champion.damageArray.reduce((total, damage) => total + damage, 0)
        }));

        console.log(totalPlayerDamage);
        console.log(totalOpponentDamage);

        return { totalPlayerDamage, totalOpponentDamage };
    } catch (error) {
        console.error('Error: ' + error);
        res.status(500).json({ error: 'An error occurred while calculating total attack damage.' });
    }
};

const calculateAbilityDamageDelt = async (req, res) => {
    try {
        const { playerStatistics, opponentStatistics } = startBattleData;

        if (playerStatistics.length === 0 || opponentStatistics.length === 0) {
            res.status(400).json({ error: 'No ability damage data available.' });
            throw new Error('No ability damage data available.');
        }

        const totalPlayerAbilityDamage = playerStatistics.map(champion => ({
            name: champion.name,
            totalAbilityDamage: champion.abilityArray.reduce((total, abilityDamage) => total + abilityDamage, 0)
        }));

        const totalOpponentAbilityDamage = opponentStatistics.map(champion => ({
            name: champion.name,
            totalAbilityDamage: champion.abilityArray.reduce((total, abilityDamage) => total + abilityDamage, 0)
        }));

        console.log(totalPlayerAbilityDamage);
        console.log(totalOpponentAbilityDamage);

        return { totalPlayerAbilityDamage, totalOpponentAbilityDamage };
    } catch (error) {
        console.error('Error: ' + error);
        res.status(500).json({ error: 'An error occurred while calculating total ability damage.' });
    }
};

const calculateAllDamageDelt = async (req, res) => {
    try {
        const { playerStatistics, opponentStatistics } = startBattleData;

        if (playerStatistics.length === 0 || opponentStatistics.length === 0) {
            return res.status(400).json({ error: 'No total damage data available.' });
        }

        if (playerStatistics.length === 0 || opponentStatistics.length === 0) {
            return res.status(400).json({ error: 'No total ability damage data available.' });
        }

        const totalPlayerDamage = playerStatistics.map(champion => ({
            name: champion.name,
            totalDamage: champion.damageArray.reduce((total, damage) => total + damage, 0)
        }));

        const totalOpponentDamage = opponentStatistics.map(champion => ({
            name: champion.name,
            totalDamage: champion.damageArray.reduce((total, damage) => total + damage, 0)
        }));

        const totalPlayerAbilityDamage = playerStatistics.map(champion => ({
            name: champion.name,
            totalAbilityDamage: champion.abilityArray.reduce((total, abilityDamage) => total + abilityDamage, 0)
        }));

        const totalOpponentAbilityDamage = opponentStatistics.map(champion => ({
            name: champion.name,
            totalAbilityDamage: champion.abilityArray.reduce((total, abilityDamage) => total + abilityDamage, 0)
        }));

        const allPlayerDamage = totalPlayerDamage.map((champion, index) => ({
            name: champion.name,
            totalAttackDamage: champion.totalDamage,
            totalAbilityDamage: totalPlayerAbilityDamage[index].totalAbilityDamage, 
            allDamage: champion.totalDamage + totalPlayerAbilityDamage[index].totalAbilityDamage
        }));
        
        const allOpponentDamage = totalOpponentDamage.map((champion, index) => ({
            name: champion.name,
            totalAttackDamage: champion.totalDamage,
            totalAbilityDamage: totalOpponentAbilityDamage[index].totalAbilityDamage,
            allDamage: champion.totalDamage + totalOpponentAbilityDamage[index].totalAbilityDamage
        }));

        console.log(allPlayerDamage);
        console.log(allOpponentDamage);

        return { allPlayerDamage, allOpponentDamage }
    } catch (error) {
        console.error('Error: ' + error);
        res.status(500).json({ error: 'An error occurred while calculating total damage.' });
    }
};

const calculateHealing = async (req, res) => {
    try {
        const { playerStatistics, opponentStatistics } = startBattleData;
        
        const totalPlayerHealing = playerStatistics.map(champion => ({
            name: champion.name,
            totalHealing: champion.healArray.reduce((total, heal) => total + heal, 0)
        }));

        const totalOpponentHealing = opponentStatistics.map(champion => ({
            name: champion.name,
            totalHealing: champion.healArray.reduce((total, heal) => total + heal, 0)
        }));

        console.log(totalPlayerHealing);
        console.log(totalOpponentHealing);

        return { totalPlayerHealing, totalOpponentHealing }
    } catch (error) {
        console.log('Error' + error);
        res.status(500).json({ error: 'An error occurred while calculating healing.' });
    }
};

const calculateIsAliveOrDead = async (req, res) => {
    try {
        const { playerStatistics, opponentStatistics } = startBattleData;

        const checkPlayerChampionAliveOrDead = playerStatistics.map(champion => ({
            name: champion.name,
            HP: champion.HP,
            baseHP: champion.baseHP,
            isAlive: champion.HP > 0 ? true : false,
        }));

        const checkOpponentChampionAliveOrDead = opponentStatistics.map((champion) => ({
            name: champion.name,
            HP: champion.HP,
            baseHP: champion.baseHP,
            isAlive: champion.HP > 0 ? true : false,
        }));

        console.log(checkPlayerChampionAliveOrDead);

        return { checkPlayerChampionAliveOrDead, checkOpponentChampionAliveOrDead };
    } catch(error){
        console.log('Error', error);
        res.status(500).json({ error: 'An error occurred while checking if champions are alive or dead.' });
    }
};

const calculateAllBattleStatistics = async (req, res) => {
    try {
        const { playerWinRate, opponentWinRate } = await calculateWinRate();
        const { allPlayerDamage, allOpponentDamage } = await calculateAllDamageDelt();
        const { totalPlayerHealing, totalOpponentHealing } = await calculateHealing();
        const { checkPlayerChampionAliveOrDead, checkOpponentChampionAliveOrDead } = await calculateIsAliveOrDead();

        const playerChampionStatistics = [{
            playerWinRate,
            playerStatistics: allPlayerDamage.map((champion, index) => ({
                name: champion.name,
                items: champion.items,
                hp: checkPlayerChampionAliveOrDead[index].HP,
                isAlive: checkPlayerChampionAliveOrDead[index].isAlive,
                totalChampionDamage: champion.totalAttackDamage,
                totalChampionAbilityDamage: champion.totalAbilityDamage,
                allChampionDamage: champion.allDamage,
                totalChampionHealing: totalPlayerHealing[index].totalHealing,

            }))
        }];

        checkPlayerChampionAliveOrDead.forEach((champion, index) => {
            console.log(`Champion ${index + 1} HP:`, champion.HP);
        });

        console.log('First Champion HP:', checkPlayerChampionAliveOrDead[0]?.HP);
        
        const opponentChamionStatistics = [{
            opponentWinRate,
            opponentStatistics: allOpponentDamage.map((champion, index) => ({
                name: champion.name,       
                items: champion.items,   
                hp: checkOpponentChampionAliveOrDead[index].HP,                  
                isAlive: checkOpponentChampionAliveOrDead[index].isAlive,
                totalChampionDamage: champion.totalAttackDamage,
                totalChampionAbilityDamage: champion.totalAbilityDamage,
                allChampionDamage: champion.allDamage,
                totalChampionHealing: totalOpponentHealing[index].totalHealing,
            }))
        }];

        console.log(playerChampionStatistics);
        console.log(opponentChamionStatistics);

        return { playerChampionStatistics, opponentChamionStatistics };

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ error: 'An error occurred while calculating all battle statistics.' });
    }
};

const calculateBattleHistory = async (req, res) => {
    try {
        const battleHistory = startBattleData;
        
        return battleHistory;
    } catch(error){
        console.log('Error', error);
        res.status(500).json({ error: 'An error occurred while fetching battle history.' });
    }
}

/* 
calculateWinRate();
calculateAbilityDamageDelt();
calculateAttackDamageDelt();
calculateAllDamageDelt();
calculateHealing();
calculateIsAliveOrDead();
calculateAllBattleStatistics();
*/

module.exports = { 
    calculateWinRate, 
    calculateChampionItems,
    calculateAttackDamageDelt, 
    calculateAbilityDamageDelt, 
    calculateAllDamageDelt, 
    calculateHealing,
    calculateIsAliveOrDead,
    calculateAllBattleStatistics,
    calculateBattleHistory,
};