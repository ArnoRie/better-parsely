export interface AbilityData {
    name: string;
    url: string;
}

export class AbilityLoader {
    private static urlForName(ability: string, page: number): string {
        return `https://torcommunity.com/database/search/ability?name=${ability}&page=${page}`;
    }

    private static async promisifiedXhr(url: string): Promise<GMXMLHttpRequestResponse> {
        return new Promise<GMXMLHttpRequestResponse>((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                method: 'GET',
                onload: resolve,
                onerror: reject
            });
        });
    }

    static async loadAbilities(abilityName: string) {
        let page = 1;
        let abilityData;
        do {
            abilityData = await AbilityLoader.loadAbilityPage(abilityName, page);
            abilityData = abilityData.filter(data => data.name === abilityName);
            abilityData = AbilityLoader.filterDuplicateUrls(abilityData);
        } while (abilityData.length === 0 && ++page < 10);
        return abilityData;
    }

    private static filterDuplicateUrls(abilityData: AbilityData[]): AbilityData[] {
        const seen: {[url: string]: boolean} = {};
        return abilityData.filter(data => seen.hasOwnProperty(data.url) ? false: (seen[data.url] = true));
    }

    static async loadAbilityPage(ability: string, page: number = 1): Promise<AbilityData[]> {
        const response = await AbilityLoader.promisifiedXhr(this.urlForName(ability, page));
        const jediDoc = response.responseText;
        const parser = new DOMParser();
        const doc = parser.parseFromString(jediDoc, "text/html");
        const rows = Array.from(doc.querySelectorAll(".db_table > tbody > tr"));
        return rows.filter(tr => tr.querySelector("img") !== null)
            .map(tr => {
                return {
                    name: tr!.querySelector(".torctip_name")!.textContent!,
                    url: tr!.querySelector("img")!.src!
                };
            });
    }
}