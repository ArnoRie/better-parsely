import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AbilityManager } from '../services/ability-manager';
import { AbilityConfigurator } from './ability-configurator';

export interface AbilityCompProps {
    name: string;
    column: number;
    row: number;
}

interface AbilityCompState {
    url?: string;
}

// Bootstrap + jQuery
declare var $: any;

export class AbilityComp extends React.Component<AbilityCompProps, AbilityCompState> {
    constructor(props: AbilityCompProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = {
            url: AbilityManager.getUrl(this.props.name)
        };
        AbilityManager.onUrlChange(this.props.name, url => this.setState({url: url}));
    }

    componentDidMount() {
        const me = ReactDOM.findDOMNode(this);
        $(me).tooltip();
    }

    get style(): React.CSSProperties {
        const style: React.CSSProperties = {};
        if (this.state.url) {
            style.backgroundImage = `url(${this.state.url})`;
        } else {
            style.backgroundColor = 'black';
        }
        style.gridColumn = this.props.column;
        style.gridRow = this.props.row;
        return style;
    }

    async onClick(e: React.MouseEvent<HTMLDivElement>) {
        const top = e.pageY;
        const left = e.pageX;
        await AbilityConfigurator.showRotationConfigurator(this.props.name, top, left);
    }

    render() {
        return (
            <div className="ability"
                data-toggle="tooltip"
                data-placement="top"
                data-original-title={this.props.name}
                style={this.style}
                onClick={this.onClick} />
        );
    }
}