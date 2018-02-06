import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Workflow } from '../src/Workflow';
import { Progressions} from './progressions';

require('../assets/style.scss');

let workflowId = (window as any).singleWorkflowId;
let workflowIds = (window as any).multiWorkflowIds;

console.log('Load workflow : ' + workflowId);

function post(url, data)
{
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
            <h1>Workflow</h1>
            <button onClick={() => {
                post('/executeAllTasksSingle', {workflowId});
            }}>
                Tout executer
            </button>
            {workflowId == null ? null : (
                <Workflow
                    workflowId={workflowId}
                    host="http://localhost:4005"
                    title="Test"
                />
            )}

            <h1>Progression multi ephemeral workflows</h1>
            <button onClick={() => {
                post('/executeAllTasksMulti', {workflowIds});
            }}>
                Tout executer
            </button>
            <button onClick={() => {
                post('/hasWorkflows', {workflowId})
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

