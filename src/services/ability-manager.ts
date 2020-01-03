export interface AbilityManager {
    getUrl(abilityName: string): string | undefined;

    setUrl(abilityName: string, url: string): void;

    onUrlChange(abilityName: string, callback: UrlChangeCallback): void;

    isGcdFree(abilityName: string): boolean;

    setGcdFree(abilityName: string, gcd: boolean): void;

    startsSection(abilityName: string): boolean;

    setSectionStart(abilityName: string, sectionStart: boolean): void;

    isLongChannel(abilityName: string): boolean;

    setLongChannel(abilityName: string, longChannel: boolean): void;

    getHitsPerActivation(abilityName: string): number;

    setHitsPerActivation(abilityName: string, hitsPerActivation: number): void;

    getTriggers(abilityName: string): Trigger[];

    setTriggers(abilityName: string, triggers: Trigger[]): void;

    onLayoutChange(abilityName: string, callback: Callback): void;

    onTriggerChange(abilityName: string, callback: Callback): void;
}

interface Callback {
    (): void;
}

export interface UrlChangeCallback {
    (url: string): void;
}

interface Configuration {
    [ability: string]: AbilityConfig | undefined;
}

export interface Trigger {
    abilityName: string;
    hits: number;
}

interface AbilityConfig {
    url?: string;
    gcdFree?: boolean;
    sectionStart?: boolean;
    longChannel?: boolean;
    hitsPerActivation?: number;
    triggers?: Trigger[];
}

class LocalStorageAbilityManager implements AbilityManager {
    private static readonly STORAGE_KEY = "ability-config";

    private readonly storage: Storage;
    private readonly urlChangeListenerMap = new Map<string, UrlChangeCallback[]>();
    private readonly layoutChangeListenerMap = new Map<string, Callback[]>();
    private readonly triggerChangeListenerMap = new Map<string, Callback[]>();


    constructor() {
        this.storage = window.localStorage;
    }

    getUrl(abilityName: string): string | undefined {
        return this.config[abilityName] ? this.config[abilityName]!.url : undefined;
    }

    setUrl(abilityName: string, url: string): void {
        this.editAbility(abilityName, config => config.url = url);
        if (this.urlChangeListenerMap.has(abilityName)) {
            const callbacks = this.urlChangeListenerMap.get(abilityName)!;
            callbacks.forEach(callback => callback(url));
        }
    }

    isGcdFree(abilityName: string): boolean {
        return this.getValue(abilityName, 'gcdFree', false)!;
    }

    setGcdFree(abilityName: string, gcdFree: boolean) {
        this.editAbility(abilityName, config => config.gcdFree = gcdFree);
        this.notifyLayoutChange(abilityName);
    }

    startsSection(abilityName: string): boolean {
        return this.getValue(abilityName, 'sectionStart', false)!;
    }

    setSectionStart(abilityName: string, sectionStart: boolean): void {
        this.editAbility(abilityName, config => config.sectionStart = sectionStart);
        this.notifyLayoutChange(abilityName);
    }

    private notifyLayoutChange(abilityName: string) {
        if (this.layoutChangeListenerMap.has(abilityName)) {
            this.layoutChangeListenerMap.get(abilityName)!.forEach(c => c());
        }
    }

    isLongChannel(abilityName: string): boolean {
        return this.getValue(abilityName, 'longChannel', false)!;
    }

    setLongChannel(abilityName: string, longChannel: boolean): void {
        this.editAbility(abilityName, config => config.longChannel = longChannel);
        this.notifyLayoutChange(abilityName);
    }

    onUrlChange(abilityName: string, callback: UrlChangeCallback): void {
        if (!this.urlChangeListenerMap.has(abilityName)) {
            this.urlChangeListenerMap.set(abilityName, []);
        }
        this.urlChangeListenerMap.get(abilityName)!.push(callback);
    }

    onLayoutChange(abilityName: string, callback: Callback) {
        if (!this.layoutChangeListenerMap.has(abilityName)) {
            this.layoutChangeListenerMap.set(abilityName, []);
        }
        this.layoutChangeListenerMap.get(abilityName)!.push(callback);
    }

    onTriggerChange(abilityName: string, callback: Callback) {
        if (!this.triggerChangeListenerMap.has(abilityName)) {
            this.triggerChangeListenerMap.set(abilityName, []);
        }
        this.triggerChangeListenerMap.get(abilityName)!.push(callback);
    }

    getHitsPerActivation(abilityName: string): number {
        return this.getValue(abilityName, 'hitsPerActivation', 0)!;
    }

    setHitsPerActivation(abilityName: string, hitsPerActivation: number): void {
        this.editAbility(abilityName, config => config.hitsPerActivation = hitsPerActivation);
    }

    getTriggers(abilityName: string): Trigger[] {
        return this.getValue(abilityName, 'triggers', [])!;
    }

    setTriggers(abilityName: string, triggers: Trigger[]): void {
        this.editAbility(abilityName, config => config.triggers = triggers);
        if (this.triggerChangeListenerMap.has(abilityName)) {
            this.triggerChangeListenerMap.get(abilityName)!.forEach(c => c());
        }
    }

    private editConfig(editor: (config: Configuration) => void) {
        const config = this.config;
        editor(config);
        this.config = config;
    }

    private editAbility(abilityName: string, editor: (config: AbilityConfig) => void) {
        const config = this.config;
        if (!config.hasOwnProperty(abilityName)) {
            config[abilityName] = {};
        }
        const abilityConfig = config[abilityName]!;
        editor(abilityConfig);
        this.config = config;
    }

    private getValue<P extends keyof AbilityConfig, T extends AbilityConfig[P]>(abilityName: string, property: P, defaultValue: T) {
        const config = this.config;
        if (config.hasOwnProperty(abilityName)) {
            const propertyValue = config[abilityName]![property];
            return propertyValue || defaultValue;
        } else {
            return defaultValue;
        }
    }

    private set config(config: Configuration) {
        const configString = JSON.stringify(config);
        this.storage.setItem(LocalStorageAbilityManager.STORAGE_KEY, configString);
    }

    private get config(): Configuration {
        const configString = this.storage.getItem(LocalStorageAbilityManager.STORAGE_KEY);
        if (configString) {
            return JSON.parse(configString);
        } else {
            return {};
        }
    }
}

export const AbilityManager: AbilityManager = new LocalStorageAbilityManager();

(<any>unsafeWindow).AbilityManager = AbilityManager;