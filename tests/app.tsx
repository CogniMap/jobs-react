import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Workflow } from '../src/Workflow';

require('../assets/style.scss');

let workflowId = (window as any).workflowId;
console.log('Load workflow : ' + workflowId);

ReactDOM.render(
    (
        <div>
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

