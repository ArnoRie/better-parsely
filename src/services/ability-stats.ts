import { Parse } from "./parse-information";
import { Trigger, AbilityManager } from "./ability-manager";

export class AbilityStats {
    constructor(
        public damageShare: number,
        public hitCount: number,
        public abilityName: string,
        public damageType: string,
        public totalDamage: number,
        public damagePerSecond: number,
        public dmgPerNonCrit: number,
        public dmgPerCrit: number,
        public minHit: number,
        public maxHit: number,
        public critCount: number,
        public critPercentage: number,
        public missPercentage: number,
        public activations: number
    ) {}

    get dmgPerActivationSelf(): number {
        return this.totalDamage / this.activations;
    }

    get triggeredAbilities(): Trigger[] {
        return AbilityManager.getTriggers(this.abilityName);
    }

    get dmgPerActivationTriggered(): number {
        return this.triggeredAbilities
                .map(trigger => this.dmgPerActivationOfTrigger(trigger))
                .reduce((a, b) => a + b, 0);
    }

    get dmgPerActivation(): number {
        return this.dmgPerActivationSelf + this.dmgPerActivationTriggered;
    }

    get dmgPerHit(): number {
        return this.totalDamage / this.hitCount;
    }

    dmgPerActivationOfTrigger(trigger: Trigger) {
        const stats = Parse.findAbilityStats(trigger.abilityName);
        if (stats) {
            return stats.dmgPerHit * trigger.hits;
        } else {
            return Infinity;
        }       
    }
}