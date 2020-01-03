import React = require("react");
import { AbilityStats } from "../services/ability-stats";
import ReactDOM = require("react-dom");
import { AbilityConfigurator } from "./ability-configurator";
import { AbilityManager } from "../services/ability-manager";

declare var $: any;

interface DamageDoneProps {
    abilityStats: AbilityStats[]
}

export class DamageDone extends React.Component<DamageDoneProps, {}> {
    keys(): (keyof AbilityStats)[] {
        return [
            "damageShare",
            "hitCount",
            "abilityName",
            "damageType",
            "totalDamage",
            "damagePerSecond",
            "activations",
            "dmgPerActivation",
            "dmgPerHit",
            "dmgPerNonCrit",
            "dmgPerCrit",
            "minHit",
            "maxHit",
            "critPercentage",
            "missPercentage"
        ];
    }

    header(key: keyof AbilityStats): string {
        switch (key) {
            case "damageShare": return "%";
            case "hitCount": return "Hits";
            case "abilityName": return "Name";
            case "damageType": return "Type";
            case "totalDamage": return "Total";
            case "damagePerSecond": return "DPS";
            case "activations": return "Activations";
            case "dmgPerActivation": return "Avg Activation";
            case "dmgPerHit": return "Avg Hit";
            case "dmgPerNonCrit": return "Avg Non Crit";
            case "dmgPerCrit": return "Avg Crit";
            case "minHit": return "Min Hit";
            case "maxHit": return "Max Hit";
            case "critPercentage": return "Crit%";
            case "missPercentage": return "Miss%";
            default: return "N/A"
        }
    }

    value(key: keyof AbilityStats, abilityStats: AbilityStats): string {
        switch (key) {
            case "damageShare":
            case "critPercentage":
            case "missPercentage":
                return abilityStats[key] + "%";
            case "dmgPerActivation":
                if (!isFinite(abilityStats.dmgPerActivation)) {
                    return "-";
                }
            case "dmgPerHit":
                return +abilityStats[key].toFixed(2) + "";
            default:
                if (abilityStats[key] === 0) {
                    return "-";
                }
                return abilityStats[key] + "";
        }
    }

    keyToTd(key: keyof AbilityStats, ability: AbilityStats) {
        if (key === "dmgPerActivation") {
            let title = ability.triggeredAbilities
                    .map(trigger => `${trigger.hits}x ${trigger.abilityName}: ${ability.dmgPerActivationOfTrigger(trigger).toFixed(2)}`).join("<br>");
            if (title.length > 0) {
                title = `Self: ${+ability.dmgPerActivationSelf.toFixed(2)}<br>` + title;
            }
            return (
                <td data-toggle="tooltip" 
                        data-html="true" 
                        data-container="body" 
                        data-placement="left" 
                        data-title={title} 
                        onClick={e => this.onConfigClick(e, ability.abilityName)}>
                            {this.value(key, ability)}
                        </td>
            );
        }
        return (<td>{this.value(key, ability)}</td>);
    }

    async onConfigClick(e: React.MouseEvent<HTMLTableCellElement>, abilityName: string) {
        const top = e.pageY;
        const left = e.pageX;
        await AbilityConfigurator.showTriggerConfigurator(abilityName, top, left);
    }

    render() {
        const headers = this.keys().map(key => <th>{this.header(key)}</th>);
        const dataRows = this.props.abilityStats
                .map(ability => this.keys().map(key => this.keyToTd(key, ability)))
                .map(tdArray => <tr>{tdArray}</tr>);
        return (
            <table className="table table-striped">
                <thead>
                    <tr>{headers}</tr>
                </thead>
                <tbody>{dataRows}</tbody>
            </table>
        );
    }

    componentDidUpdate() {
        const me = ReactDOM.findDOMNode(this);
        const $me = $(me);
        $me.find('[data-toggle="tooltip"]').tooltip();
    }

    componentDidMount() {
        const me = ReactDOM.findDOMNode(this);
        const $me = $(me);
        $me.tablesorter();
        $me.find('[data-toggle="tooltip"]').tooltip();

        this.props.abilityStats.forEach(stats => {
            AbilityManager.onTriggerChange(stats.abilityName, () => this.forceUpdate());
        })
    }
}