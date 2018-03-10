import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Workflow } from 'jobs-react';

const workflowId = null;

ReactDOM.render(
    (
        <div>
            <h1>Test : </h1>
            <Workflow
                workflowId={workflowId}
                host="http://localhost:4005"
                title="Test"
            />
        </div>
    ),
    document.getElementById('root'),
);
