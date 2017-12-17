import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Workflow } from '../src/Workflow';

require('../assets/style.scss');

let workflowId = (window as any).workflowId;
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
    });
}

ReactDOM.render(
    (
        <div>
            <button onClick={() => {
                post('/executeAllTasks', {workflowId});
            }}>Tout executer
            </button>
            {workflowId == null ? null : (
                <Workflow
                    workflowId={workflowId}
                    host="http://localhost:4005"
                    title="Test"
                />
            )}
        </div>
    ),
    document.getElementById('root'),
);

