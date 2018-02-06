import * as React from 'react';

const values = require('object.values');

import { Progression } from '../src/Progression';

let workflowIds = (window as any).multiWorkflowIds;

namespace Progressions
{
    export interface Props
    {
    }

    export interface State
    {

    }
}

export class Progressions extends React.Component<Progressions.Props, Progressions.State>
{
    public render()
    {
        console.log(workflowIds);
        return (
            <div>
                <Progression
                    host="http://localhost:4005"
                    workflowIds={workflowIds}
                    render={context => values(context.workflows)
                        .map((workflow, i) => {
                            return (
                                <div key={i} style={{border: '1px solid black', margin: '10px'}}>
                                    <h3>Workflow #{i}</h3>
                                    Progression : {workflow.progression * 100}%
                                </div>
                            );
                        })}
                />
            </div>
        );
    }
}
