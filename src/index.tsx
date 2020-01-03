import './index.css'
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { VisualRotation } from './components/visual-rotation';
import { Parse } from './services/parse-information';
import { DamageDone } from './components/damage-done';

(() => {
    const rotationContainer = document.getElementById("rotation")!;
    const defaultRotaTable = rotationContainer.querySelector("div.table-responsive")!;
    const mountPoint = rotationContainer.appendChild(document.createElement("div"));

    [defaultRotaTable, mountPoint].forEach(e => e.classList.add("col-sm-6"));

    ReactDOM.render(<VisualRotation abilityList={Parse.rotation} />, mountPoint);

    const oldTable = document.querySelector("#damage-done > div:nth-child(4)")!;
    const damageDoneMount = document.createElement("div");
    damageDoneMount.classList.add("table-responsive");
    oldTable.insertAdjacentElement("afterend", damageDoneMount);

    ReactDOM.render(<DamageDone abilityStats={Parse.abilityStats} />, damageDoneMount);
})();