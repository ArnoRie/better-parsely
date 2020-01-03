import { AbilityStats } from "./ability-stats";

enum Column {
    Percent,
    Hits,
    Action,
    Type,
    Damage,
    DPS,
    AvgHit,
    AvgCrit,
    MinHit,
    MaxHit,
    Crits,
    CritPercent,
    MissPercent
}

class ParseInformation {
    private static get damageDoneTable(): HTMLTableElement {
        return document.querySelector("#damage-done > div:nth-child(4) > table:nth-child(1)") as HTMLTableElement;
    }

    private static get abilityRows(): HTMLTableRowElement[] {
        return Array.from(ParseInformation.damageDoneTable.querySelectorAll("tbody > tr"))
                .filter(row => !row.children[2].classList.contains("sub-instance")) as HTMLTableRowElement[];
    }

    countAbility(abilityName: string) {
        return Parse.rotation.filter(name => name === abilityName).length;
    }

    private rowToAbilityStats(row: HTMLTableRowElement): AbilityStats {
        const name = ParseInformation.getColumn(row, Column.Action);
        const activations = this.countAbility(name);
        return new AbilityStats(
            parseFloat(ParseInformation.getColumn(row, Column.Percent)),
            +ParseInformation.getColumn(row, Column.Hits),
            ParseInformation.getColumn(row, Column.Action),
            ParseInformation.getColumn(row, Column.Type),
            +ParseInformation.getColumn(row, Column.Damage),
            +ParseInformation.getColumn(row, Column.DPS),
            +ParseInformation.getColumn(row, Column.AvgHit),
            +ParseInformation.getColumn(row, Column.AvgCrit),
            +ParseInformation.getColumn(row, Column.MinHit),
            +ParseInformation.getColumn(row, Column.MaxHit),
            +ParseInformation.getColumn(row, Column.Crits),
            parseFloat(ParseInformation.getColumn(row, Column.CritPercent)),
            parseFloat(ParseInformation.getColumn(row, Column.MissPercent)),
            activations
        );
    }

    findAbilityStats(name: string): AbilityStats | undefined {
        return this.abilityStats.find(stats => stats.abilityName === name);
    }

    get abilityStats(): AbilityStats[] {
        const rows = ParseInformation.abilityRows;
        return rows.map(row => this.rowToAbilityStats(row));
    }

    get rotation(): string[] {
        const actionCells = Array.from(document.querySelectorAll("#rotation tbody > tr > td:last-child"));
        return actionCells.map(cell => cell.textContent!);
    }

    private getRow(abilityName: string): Element {
        return ParseInformation.abilityRows.find(row => row.children[Column.Action].textContent === abilityName)!
    }

    private static getColumn(row: Element, column: Column): string {
        return row.children[column].textContent!;
    }

    getHits(abilityName: string): number {
        const row = this.getRow(abilityName);
        const content = ParseInformation.getColumn(row, Column.Hits);
        return +content;
    }

    getTotalDamage(abilityName: string): number {
        const row = this.getRow(abilityName);
        const content = ParseInformation.getColumn(row, Column.Damage);
        return +content;
    }

    getDmgPerHit(abilityName: string) {
        return this.getTotalDamage(abilityName) / this.getHits(abilityName);
    }
}

export const Parse = new ParseInformation();