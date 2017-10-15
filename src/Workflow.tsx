import * as React from 'react';
import { Treebeard } from 'react-treebeard';

import { WorkflowTreeTasks, TaskStatus } from 'jobs';

import { ProgressionContext, WorkflowComponent } from './index.d';
import { update } from './immutability';
import { Progression } from './Progression';
import { Panel } from './Panel';

/**
 * Render a workflow progression.
 * Display all tasks in a tree view, with a panel for the selected task. This panel display
 * the task status and the task body.
 *
 * Tasks can be run manually.
 */
export class Workflow extends React.Component<WorkflowComponent.Props, WorkflowComponent.State>
{

    public static defaultProps : WorkflowComponent.Props = {
        workflowId: null,
        host: '',
        title: '',
    };

    public constructor(props)
    {
        super(props);
        this.state = {
            tasksStates: {},

            selectedTask: null,
            updaters: null, // Updaters of selected task
        };
    }

    private getStatusLabel(status : TaskStatus) : string
    {
        return '[' + status.toUpperCase() + ']';
    }

    public render()
    {
        let self = this;
        if (this.props.workflowId == null) {
            return null;
        }

        return <Progression
            host={this.props.host}
            workflowId={this.props.workflowId}
            render={(progressContext : ProgressionContext) => {
                /**
                 * Append the toggled/active state and the status to tasks,
                 */
                function renderableWorkflow(tasks : WorkflowTreeTasks)
                {
                    return (tasks as any).map(task => {
                        let status = progressContext.tasksStatuses[task.path] || {
                            status: 'inactive',
                        };
                        let nodeState = self.state.tasksStates[task.path] || {
                            toggled: false,
                            active: false,
                        };
                        return Object.assign({}, task, nodeState, {
                            name: self.getStatusLabel(status.status) + ' ' + task.name,
                        });
                    });
                }

                return (
                    <div className="container">
                        <h1>{this.props.title}</h1>
                        <div className="row">
                            <div className="col-md-6 col-sm-12">
                                <Treebeard
                                    data={renderableWorkflow(progressContext.workflow)}
                                    onToggle={(node, toggled) => {
                                        let updater = {
                                            tasksStates: {
                                                [node.path]: {
                                                    $apply: orig => ({
                                                        toggled: orig == null ? true : !orig.toggled,
                                                        active: toggled,
                                                    }),
                                                },
                                            },
                                        };

                                        // Set the active task
                                        for (let path in self.state.tasksStates) {
                                            if (path != node.path) {
                                                updater.tasksStates[path] = {$merge: {active: false}};
                                            }
                                        }
                                        updater['selectedTask'] = {$set: node.path};

                                        self.setState(update(self.state, updater));
                                    }}
                                />
                            </div>
                            {this.state.selectedTask == null ? null : (
                                <Panel
                                    workflowId={self.props.workflowId}
                                    taskPath={self.state.selectedTask}
                                    progressContext={progressContext}
                                />
                            )}
                        </div>
                    </div>
                );
            }}
        />;
    }
}
