import { AbilityManager } from "./ability-manager";

function enhanceDamage() {

}

export function insertPerActivation(abilityList: string[]) {
    function countAbility(abilityName: string) {
        return abilityList.filter(name => name === abilityName).length;
    }

    function insertHeaderColumn(table: HTMLTableElement, newHeaderValue: string, index: number) {
        const headerRow = table.tHead.rows[0];
        const newHeader = document.createElement("th");
        newHeader.classList.add("header");
        newHeader.textContent = newHeaderValue;
        headerRow.insertBefore(newHeader, headerRow.children[index]);
    }

    function insertBodyColumn(table: HTMLTableElement, valueGenerator: (row: HTMLTableRowElement) => string, index: number) {
        Array.from(table.tBodies[0].rows).forEach((row, rowIndex) => {
            const newCell = document.createElement("td");
            newCell.textContent = valueGenerator(row);
            row.insertBefore(newCell, row.children[index]);
        });
    }

    let damageDone = document.getElementById("damage-done")!;
    let abilityTable = damageDone.querySelector("div:nth-child(4) > table") as HTMLTableElement;
    insertHeaderColumn(abilityTable, "Activations", 6);
    insertBodyColumn(abilityTable, row => {
        const actionCell = row.children[2];
        if (actionCell.classList.contains("sub-instance")) {
            return "-";
        } else {
            const count = countAbility(actionCell.textContent!);
            return count > 0 ? count + '' : "N/A";
        }
    }, 6);
    insertHeaderColumn(abilityTable, "Dmg/Activation", 7);
    insertBodyColumn(abilityTable, row => {
        const actionCell = row.children[2];
        const hits = +row.children[1].textContent!;
        const abilityName = actionCell.textContent!;
        const totalDamage = +row.children[4].textContent!
        if (actionCell.classList.contains("sub-instance")) {
            return "-";
        } else {
            const activations = countAbility(abilityName);
            const avgDmg = AbilityManager.getHitsPerActivation(abilityName) 
                    ? Math.round(totalDamage / hits * AbilityManager.getHitsPerActivation(abilityName))
                    : Math.round(totalDamage / activations);
            return activations > 0 ? avgDmg + '' : "N/A";
        }
    }, 7);
}