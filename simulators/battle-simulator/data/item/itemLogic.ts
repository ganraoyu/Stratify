import { ItemProps } from './item'; 

function getFormattedTime(champion: any){
    const mins = Math.floor(champion.battleTime / 6000);
    const secs = Math.floor((champion.battleTime % 6000) / 100);
    const cents = champion.battleTime % 100;
    const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}:${cents.toString().padStart(2, '0')}`;
    return formattedTime;
}

export function addAdditionalItemStatistics(champion: any) { // basic stats
    if (!champion || !champion.items || !champion.items.length) return 'No items equipped';

    if(champion.items.length > 0 && champion.items.length <= 3){
        champion.items.forEach((item: ItemProps) => {            
            champion.currentHp += item.additionalHealth || 0;      
            champion.statsByStarLevel[champion.starLevel].hp += item.additionalHealth || 0;    
            champion.currentHp *= item.additionalPercentageHealth || 1; 
            champion.statsByStarLevel[champion.starLevel].hp *= item.additionalPercentageHealth || 1;
            champion.statsByStarLevel[champion.starLevel].hp *= item.additionalPercentageHealth || 1;           
            champion.statsByStarLevel[champion.starLevel].armor += item.additionalArmor || 0;   
            champion.statsByStarLevel[champion.starLevel].magicResist += item.additionalMagicResist || 0;
            champion.statsByStarLevel[champion.starLevel].attackDamage *= item.additionalAttackDamage || 1;
            champion.damageAmp += item.additionalDamageAmp || 0;
            console.log('additionalAttackDamage', item.additionalAttackDamage)
            champion.attackSpeed *= item.additionalAttackSpeed || 1;
            champion.manaPerAttack += item.additionalManaPerAttack || 0;
            champion.range += item.additionalAttackRange || 0;
            champion.attackCritChance += item.additionalCritChance || 0;
            champion.attackCritDamage += item.additionalCritDamage || 0;
            champion.durability += item.additionalDurability || 0;
            champion.statsByStarLevel[champion.starLevel].reduction += item.reductionAmount || 0;
            champion.abilityPower += item.additionalAbilityPower || 0;            
            champion.mana += item.additionalStartingMana || 0;  
            champion.abilityManaCost -= item.reducedMaxMana || 0;
        });
    } else if(champion.items.length === 0){
        console.log('No items equipped');
    } else {
        console.log('Max 3 items can be equipped');
    }
}

export function gainHealingEffects(champion: any, battleTime: number){
    if (!champion || !champion.items || !champion.items.length || !battleTime) return 'No items equipped';

    let formattedTime = getFormattedTime(champion);

    champion.items.forEach((item: ItemProps) => {
        if(item.name === 'Dragon\'s Claw' && 
            item.heal && item.healAmount && 
            battleTime % 200 === 0 && 
            battleTime > 0
        ){
            const healAmount = Math.round(champion.statsByStarLevel[champion.starLevel].hp * item.healAmount);
            champion.currentHp += healAmount;
            champion.healArray.push(healAmount);
            console.log(`[${formattedTime}] ${champion.name} healed for ${healAmount} hp`);
        }
    })
}

let shieldEffectUsed = false

export function gainShieldEffect(champion: any, battleTime: number ){   
    if(!champion || !champion.items || !champion.items.length || !battleTime) return 'No items equipped';

    let formattedTime = getFormattedTime(champion);
    
    champion.items.forEach((item: ItemProps) => {
        if(item.name === 'Bloodthirster' && 
            item.shield && 
            item.shieldAmount && 
            item.shieldDuration && 
            !shieldEffectUsed
        ){
            if(champion.currentHp <= champion.statsByStarLevel[champion.starLevel].hp * 0.4){
                champion.shield += (champion.statsByStarLevel[champion.starLevel].hp * item.shieldAmount);
                shieldEffectUsed = true;
                console.log(`[${formattedTime}] ${champion.name} gained a shield for ${champion.statsByStarLevel[champion.starLevel].hp * item.shieldAmount} hp`);
            }
        }
    })
}

let timeSinceLastExternalMagicDamage = 0;
let attackedArray = [];
let cooldown = 0; // 200 centiseconds, 2 seconds

export function externalMagicDamageEffect(champion: any, target: any, battleTime: number){
    if(!champion || !champion.items || !champion.items.length || !battleTime) return 'No items equipped';

    let formattedTime = getFormattedTime(champion);

    champion.items.forEach((item: ItemProps) => {
        if(item.name === 'Bramble Vest' && 
            item.externalMagicDamage && 
            champion.damageTakenArray.length > attackedArray.length
        ){
            if(battleTime - target.attackSpeed >= timeSinceLastExternalMagicDamage){
                if(battleTime >= cooldown){
                    target.currentHp -= item.externalMagicDamage;
                    attackedArray.push(battleTime)
                    cooldown = timeSinceLastExternalMagicDamage + battleTime + 200;
                    console.log(`[${formattedTime}] ${champion.name} dealt ${item.externalMagicDamage} magic damage to ${target.name}`);
                }
            }
        }
    })
}

export function abilityPowerStacking(champion: any, battleTime: number){
    if(!champion || !champion.items || !champion.items.length || !battleTime) return 'No items equipped';

    const formattedTime = getFormattedTime(champion);

    champion.items.forEach((item: ItemProps) => {
        if(item.abilityPowerStacking){
            if(battleTime % 500 === 0){
                champion.abilityPower += item.additionalAbilityPowerPerStack; 
                console.log(`[${formattedTime}] ${champion.name} gained ${item.additionalAbilityPowerPerStack} ability power`);
            }
        }
    })
}