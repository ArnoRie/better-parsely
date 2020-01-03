import * as React from 'react';
import {AbilityData, AbilityLoader} from '../services/ability-loader';
import {AbilityManager, Trigger} from '../services/ability-manager';
import ReactDOM = require('react-dom');

export interface AbilityConfiguratorProps {
    abilityName: string;
    imageUrls: Promise<string[]>;
    rotation: boolean;
    style: {
        width: string;
        top: string;
        left: string;
    };
}

interface AbilityConfiguratorState {
    hide: boolean;
    imageUrls: string[];
}

export class AbilityConfigurator extends React.Component<AbilityConfiguratorProps, AbilityConfiguratorState> {
    constructor(props: AbilityConfiguratorProps) {
        super(props);
        this.close = this.close.bind(this);
        this.onTriggerNameChange = this.onTriggerNameChange.bind(this);
        this.onTriggerCountChange = this.onTriggerCountChange.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.openCustomUrlPrompt = this.openCustomUrlPrompt.bind(this);
        this.state = {
            hide: false,
            imageUrls: []
        };
        props.imageUrls.then(urls => this.setState({imageUrls: urls}));
    }

    onImageClick(url: string, target: any) {
        AbilityManager.setUrl(this.props.abilityName, url);
        target.classList.add("highlighted-ability");
    }

    close() {
        this.setState({hide: true});
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, true);
    }

    handleClickOutside(event: any) {
        const node = ReactDOM.findDOMNode(this);
        if (node && !node.contains(event.target)) {
            this.close();
        }
    }

    onSectionStartChange(sectionStart: boolean) {
        AbilityManager.setSectionStart(this.props.abilityName, sectionStart);
        this.forceUpdate();
    }

    onGcdChange(gcdFree: boolean) {
        AbilityManager.setGcdFree(this.props.abilityName, gcdFree);
        this.forceUpdate();
    }

    onLongChannelChange(longChannel: boolean) {
        AbilityManager.setLongChannel(this.props.abilityName, longChannel);
        this.forceUpdate();
    }

    onTriggerNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        const i = +event.target.name;
        const triggers = this.triggers;
        if (triggers[i] === undefined) {
            triggers[i] = {
                abilityName: "",
                hits: 0
            }
        }
        triggers[i].abilityName = event.target.value;
        this.updateTriggers(triggers);
    }

    onTriggerCountChange(event: React.ChangeEvent<HTMLInputElement>) {
        const i = +event.target.name;
        const triggers = this.triggers;
        if (triggers[i] === undefined) {
            triggers[i] = {
                abilityName: "",
                hits: 0
            }
        }
        triggers[i].hits = +event.target.value;
        this.updateTriggers(triggers);
    }

    private get triggers() {
        return AbilityManager.getTriggers(this.props.abilityName);
    }

    private updateTriggers(triggers: Trigger[]) {
        const filtered = triggers.filter(trigger => trigger.abilityName.length > 0 || trigger.hits > 0);
        AbilityManager.setTriggers(this.props.abilityName, filtered);
        this.forceUpdate();
    }

    get containerStyle() {
        return {
            display: this.state.hide ? 'none' : 'initial'
        };
    }

    openCustomUrlPrompt() {
        let url = prompt(`Custom Icon URL for ${this.props.abilityName}`);
        if (url) {
            AbilityManager.setUrl(this.props.abilityName, url);
        }
    }

    render() {
        const images = this.state.imageUrls.map(url => {
            let className = "hover-highlight ability";
            if (AbilityManager.getUrl(this.props.abilityName) === url) {
                className += " highlighted-ability";
            }
            return <img key={url} src={url} onClick={e => this.onImageClick(url, e.target)} className={className}
                        onError={e => e.currentTarget.style.display = 'none'} alt=""/>;
        });
        images.push(<button style={{width: '32px', height: '32px'}} onClick={this.openCustomUrlPrompt}>+</button>);
        const triggers = this.triggers;
        triggers.push({abilityName: "", hits: 0});
        const triggerInputs = triggers.map((trigger, index) => {
            return (
                <div>
                    <input name={index + ""} type="number" value={trigger.hits} onChange={this.onTriggerCountChange}
                           style={{width: "50px"}} step="0.1"/>
                    <input name={index + ""} value={trigger.abilityName} onChange={this.onTriggerNameChange}/>
                </div>
            );
        });
        const triggerStyle = this.props.rotation ? {display: 'none'} : {};
        const rotationStyle = this.props.rotation ? {} : {display: 'none'};
        return (
            <div className="dialog-container" style={this.containerStyle}>
                <div className="dialog" style={this.props.style}>
                    <button style={{float: 'right'}} onClick={this.close}>Close</button>
                    <h4 style={{marginTop: '5px'}}>{this.props.abilityName}</h4>
                    <div className="form-group" style={rotationStyle}>
                        <label>
                            <input type="checkbox"
                                   checked={AbilityManager.startsSection(this.props.abilityName)}
                                   onChange={e => this.onSectionStartChange(e.target.checked)}/> Section Start
                        </label>
                    </div>
                    <div className="form-group" style={rotationStyle}>
                        <label>
                            <input type="checkbox"
                                   checked={AbilityManager.isGcdFree(this.props.abilityName)}
                                   onChange={e => this.onGcdChange(e.target.checked)}/> Gcd Free
                        </label>
                    </div>
                    <div className="form-group" style={rotationStyle}>
                        <label>
                            <input type="checkbox"
                                   checked={AbilityManager.isLongChannel(this.props.abilityName)}
                                   onChange={e => this.onLongChannelChange(e.target.checked)}/> Long Channel
                        </label>
                    </div>
                    <div className="form-group" style={rotationStyle}>
                        <label>Image</label>
                        <div className="form-control-static" style={{height: '32px'}}>{images}</div>
                    </div>
                    <div className="form-group" style={triggerStyle}>
                        <label>Triggers</label>
                        {triggerInputs}
                    </div>
                </div>
            </div>
        );
    }

    static readonly popupMount = document.body.appendChild(document.createElement("div"));

    static async showRotationConfigurator(abilityName: string, top: number, left: number) {
        this.showConfigurator(abilityName, top, left, true);
    }

    static async showTriggerConfigurator(abilityName: string, top: number, left: number) {
        this.showConfigurator(abilityName, top, left, false);
    }

    private static async showConfigurator(abilityName: string, top: number, left: number, rotation: boolean) {
        const urlPromise = AbilityLoader.loadAbilities(abilityName)
            .then(result => result.map(data => data.url));
        const style = {
            width: '300px',
            top: top + 'px',
            left: left + 'px'
        };
        const configurator = <AbilityConfigurator abilityName={abilityName} rotation={rotation} imageUrls={urlPromise}
                                                  style={style}/>;


        ReactDOM.unmountComponentAtNode(this.popupMount);
        ReactDOM.render(configurator, this.popupMount);
    }
}

