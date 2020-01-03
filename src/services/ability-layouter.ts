import { AbilityManager } from "./ability-manager";

export class RotationSection {
    readonly gcdWindows: GcdWindow[];

    constructor(gcdWindows: GcdWindow[]) {
        this.gcdWindows = gcdWindows;
    }

    get length() {
        return this.gcdWindows.length;
    }

    get height() {
        return this.gcdWindows.map(gcd => gcd.height).reduce((p, c) => Math.max(p, c), 0);
    }

    static height(sections: RotationSection[]): number {
        return sections.map(section => section.height).reduce((p, c) => p + c, 0);
    }

    static maxLength(sections: RotationSection[]): number {
        return sections.map(section => section.length).reduce((p, c) => Math.max(p, c), 0);
    }
}

class GcdWindow {
    readonly offGcdAbilities: Ability[];
    readonly mainAbility: Ability;

    constructor(offGcdAbilities: Ability[], mainAbility: Ability) {
        this.offGcdAbilities = offGcdAbilities;
        this.mainAbility = mainAbility;
    }

    get height() {
        return this.offGcdAbilities.length + 1;
    }
}

class Ability {
    readonly name: string;
    readonly index: number;

    constructor(name: string, index: number) {
        this.name = name;
        this.index = index;
    }
}

export class AbilityLayouter {
    layout(abilityList: string[]): RotationSection[] {
        const rotation: RotationSection[] = [];

        let currentSection: GcdWindow[] = [];
        let currentOffGcds: Ability[] = [];
        for (const [index, ability] of abilityList.entries()) {
            if (AbilityManager.startsSection(ability)) {
                rotation.push(new RotationSection(currentSection));
                currentSection = [];
            }

            if (AbilityManager.isGcdFree(ability)) {
                currentOffGcds.push(new Ability(ability, index));
            } else {
                currentSection.push(new GcdWindow(currentOffGcds, new Ability(ability, index)));
                currentOffGcds = [];
                if (AbilityManager.isLongChannel(ability)) {
                    currentSection.push(new GcdWindow([], new Ability(ability, index)));
                }
            }            
        }
        rotation.push(new RotationSection(currentSection));
        return rotation;
    }
}