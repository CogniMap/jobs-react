import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {Workflow} from '../src/Workflow';
import {Progressions} from './progressions';
import {ContinuousProgressions} from "./continuousProgressions";

require('../assets/style.scss');

let workflowId = (window as any).singleWorkflowId;
let workflowIds = (window as any).multiWorkflowIds;
let realm = (window as any).realm;

console.log('Load workflow : ' + workflowId);

function post(url, data) {
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json());
}

ReactDOM.render(
    (
        <div>
            Realm : {realm}
            <h1>Workflow</h1>
            <button onClick={() => {
                post('/executeAllTasksSingle', {workflowId});
            }}>
                Tout executer
            </button>
            <button onClick={() => {
                post('/deleteByRealm', {realm});
            }}>
                Supprimer par realm
            </button>
            <button onClick={() => {
                post('/hasWorkflows', {workflowIds: [workflowId]})
                    .then(response => {
                        if (response.existing.length == 0) {
                            alert("Le workflows a bien été supprimé !");
                        } else {
                            alert("Le workflow n'a pas encore été supprimé !");
                        }
                    })
            }}>
                Tester l'existence du workflow
            </button>
            {workflowId == null ? null : (
                <Workflow
                    workflowId={workflowId}
                    host="http://localhost:4005"
                    title="Test"
                />
            )}

            <h1>Fake progression</h1>
            <ContinuousProgressions workflowIds={[workflowId]}/>

            <h1>Progression multi ephemeral workflows</h1>
            <button onClick={() => {
                post('/executeAllTasksMulti', {workflowIds});
            }}>
                Tout executer
            </button>
            <button onClick={() => {
                post('/hasWorkflows', {workflowIds})
                    .then(response => {
                        if (response.existing.length == 0) {
                            alert("Les workflows ont bien été supprimé !");
                        } else {
                            alert("Les workflows n'ont pas encore été supprimé !");
                        }
                    })
            }}>
                Tester l'existence des workflows
            </button>
            <Progressions/>
        </div>
    ),
    document.getElementById('root'),
);

