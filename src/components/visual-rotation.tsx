import * as React from 'react';
import { AbilityComp } from './ability-comp';
import { AbilityLayouter} from '../services/ability-layouter';
import { AbilityManager } from '../services/ability-manager';

export interface VisualRotationProps {
    abilityList: string[];
}

export class VisualRotation extends React.Component<VisualRotationProps, {}> {
    private readonly layouter = new AbilityLayouter();

    componentWillMount() {
        function unique<T>(value: T, index: number, self: T[]) {
            return self.indexOf(value) === index;
        }
        this.props.abilityList.filter(unique).forEach(abilityName => {
            AbilityManager.onLayoutChange(abilityName, () => this.forceUpdate());
        });
    }

    render() {
        const rotation = this.layouter.layout(this.props.abilityList);

        const abilityComponents: JSX.Element[] = [];
        let row = 0;
        let column;

        for (const section of rotation) {
            row += section.height;
            column = 1;
            for (const gcdWindow of section.gcdWindows) {
                for (const [index, offGcdAbl] of gcdWindow.offGcdAbilities.entries()) {
                    const offGcdRow = row - (gcdWindow.offGcdAbilities.length - index);
                    abilityComponents.push((
                        <AbilityComp name={offGcdAbl.name}
                                key={offGcdAbl.index}
                                row={offGcdRow} 
                                column={column} />
                    ));
                }
                abilityComponents.push((
                    <AbilityComp name={gcdWindow.mainAbility.name}
                            key={gcdWindow.mainAbility.index}
                            row={row} 
                            column={column} />
                ));
                column++;
            }      
        }

        // const abilities = this.props.abilityList.map((ability, index) => <AbilityComp name={ability} key={index} popupMount={this.props.popupMount} />);
        return (
            <div className="ability-grid">
                {abilityComponents}
            </div>
        );
    }
}