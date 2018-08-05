import * as React from 'react';
import {Line, Circle} from 'rc-progress';
require('rc-progress/dist/rc-progress.css');

const values = require('object.values');

import {TaskStatus} from 'jobs';

import {ContinuousProgression} from "../src/ContinuousProgression";
import {ContinuousProgressionContext} from '../src/index.d';

namespace ContinuousProgressions {
    export interface Props {
        workflowIds: string[];
    }

    export interface State {

    }
}

/**
 * Task paths : (cf jobs/test)
 *
 * - task 1
 * - task 2
 * - task 3
 * - task 4
 * - task 5
 * - task 5
 */
export class ContinuousProgressions extends React.Component<ContinuousProgressions.Props, ContinuousProgressions.State> {
    public getStatusColor(status: TaskStatus) {
        if (status == "ok") {
            return 'green';
        } else if (status == "queued") {
            return 'gray';
        } else if (status == "failed") {
            return 'red';
        } else {
            return 'blue';
        }
    }

    public renderWorkflow(workflowId, context: ContinuousProgressionContext) {
        let taskPaths = [
            '#.task1',
            '#.task2',
            '#.task3',
            '#.task4',
            '#.task5',
            '#.task6',
        ];
        let self = this;
        let workflow = context.workflows[workflowId];
        return (
            <table>
                {taskPaths.map((taskPath, i) => {
                    let status = workflow.tasksStatuses[taskPath] && workflow.tasksStatuses[taskPath].status as any;
                    let color = self.getStatusColor(status);
                    let progression = workflow.tasksProgressions[taskPath];
                    return (
                        <tr key={i}>
                            <td>
                                {taskPath}
                            </td>
                            <td>
                                {status}
                            </td>
                            <td style={{width: '500px'}}>
                                <Line percent={progression * 100} strokeWidth="4" strokeColor={color}/>
                            </td>
                        </tr>
                    );
                })}
            </table>
        )
    }

    public render() {
        return (
            <div>
                <ContinuousProgression
                    host="http://localhost:4005"
                    workflowIds={this.props.workflowIds}
                    estimations={{
                        '#.task1': 50,
                        '#.task2': 50,
                        '#.task3': 300000,
                        '#.task4': 50,
                        '#.task5': 50,
                        '#.task6': 50,
                    }}
                    render={context => {
                        let workflowIds = Object.keys(context.workflows);

                        return (
                            <React.Fragment>
                                {workflowIds.map((workflowId, i) => {
                                    let workflow = context.workflows[workflowId];
                                    if (workflow == null) {
                                        return null;
                                    }
                                    return (<div key={i}>
                                            <h3>Workflow {workflowId}</h3>
                                            {this.renderWorkflow(workflowId, context)}
                                        </div>
                                    );
                                })}

                            </React.Fragment>
                        );
                    }}
                />
            </div>
        );
    }
}
