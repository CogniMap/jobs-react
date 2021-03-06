import * as React from 'react';
import * as SocketIO from 'socket.io-client';
import {update} from './immutability';
const mapValues = require('object.map');
const difference = require('lodash/difference');
const values = require('object.values');

import {TaskStatus, Statuses, WorkflowStatus, WorkflowTreeTasks} from 'jobs';
import {ProgressionComponent} from './index.d';

/**
 * Backend component to track the progression of one or more workflows.
 */
export class Progression extends React.Component<ProgressionComponent.Props, ProgressionComponent.State> {
    private socket = null;
    private _mounted;

    public static defaultProps: ProgressionComponent.Props = {
        workflowIds: [],
        host: null,
        render: (ctx) => null,
        onError: (err) => null,
        onComplete: (workflowId) => null,
    };

    public constructor(props) {
        super(props);
        this.state = {
            workflows: {},
        };
    }

    public componentDidMount() {
        this._mounted = true;
        if (this.props.workflowIds != null && this.props.workflowIds.length > 0) {
            this.setupWorkflow(this.props.workflowIds);
        }
    }

    public componentWillUnmount() {
        this._mounted = false;
    }

    public asyncSetState(... args) {
        if (this._mounted) {
            (this.setState as any)(... args);
        }
    }

    public componentWillReceiveProps(nextProps: ProgressionComponent.Props) {
        let newWorkflows = difference(nextProps.workflowIds, this.props.workflowIds);
        let removedWorkflows = difference(this.props.workflowIds, nextProps.workflowIds);

        this.setupWorkflow(newWorkflows);
    }

    /**
     * Called when the description of a workflow updates.
     *
     * @param workflowId
     * @param tasks
     */
    private onWorkflowDescription(workflowId, tasks) {
        if (this.props.workflowIds.indexOf(workflowId) !== -1) {
            this.asyncSetState(prevState => update(prevState, {
                workflows: {
                    [workflowId]: {
                        workflow: {$set: tasks},
                    }
                }
            }));
        }
    }

    /**
     * Called when the statuses of the workflow's task update.
     *
     * @param workflowId
     * @param statuses
     */
    private onTasksStatuses(workflowId, statuses) {
        let prevStatuses = this.state.workflows[workflowId].tasksStatuses;

        // Detect changes to trigger onTaskStart / onTaskEnd
        if (prevStatuses) {
            for (let taskPath in statuses) {
                let prevTaskStatus = prevStatuses[taskPath] && prevStatuses[taskPath].status as TaskStatus;
                let nextTaskStatus = statuses[taskPath].status as TaskStatus;
                if (prevTaskStatus != nextTaskStatus) {
                    if (nextTaskStatus == 'queued') {
                        if (this.props.onTaskStart) {
                            this.props.onTaskStart(workflowId, taskPath);
                        }
                    } else if (nextTaskStatus == 'ok' || nextTaskStatus == 'failed') {
                        if (this.props.onTaskEnd) {
                            this.props.onTaskEnd(workflowId, taskPath);
                        }
                    }
                }
            }
        }

        if (this.props.workflowIds.indexOf(workflowId) != -1) {
            this.asyncSetState(prevState => update(prevState, {
                workflows: {
                    [workflowId]: {
                        tasksStatuses: {
                            $merge: statuses,
                        },
                    }
                }
            }));
        }
    }

    /**
     * Called when the status of a workflow updates.
     *
     * @param workflowId
     * @param status
     */
    private onWorkflowStatus(workflowId, status) {
        if (this.props.workflowIds.indexOf(workflowId) != -1) {
            switch (status) {
                case 'done':
                    this.props.onComplete(workflowId);
                    break;
            }
        }
    }

    /**
     * Create the Websocket, and register listeners if needed.
     *
     * Register the client to the workroom, and update the tasks tree upon workflow description.
     */
    private setupWorkflow(workflowIds: string[]) {
        let self = this;
        let stateWorkflows = {};
        for (let workflowId of workflowIds) {
            stateWorkflows[workflowId] = {
                workflow: [], // WorkflowTreeTask
                tasksStatuses: {}
            };
        }
        this.asyncSetState(state => update(state, {
            workflows: {
                $merge: stateWorkflows
            }
        }));

        function watchWorkflows() {
            for (let workflowId of workflowIds) {
                self.socket.emit('watchWorkflowInstance', workflowId);
            }
        }

        if (this.socket == null) {
            const options = {
                transports: ['polling']
            };
            if (this.props.host != null) {
                this.socket = SocketIO.connect(this.props.host, options);
            } else {
                this.socket = SocketIO.connect(options);
            }
            let socket = this.socket;
            socket.on('hello', data => {
                watchWorkflows();
            });

            this.socket.on('workflowDescription', (res: { id: string, tasks: WorkflowTreeTasks }) => {
                self.onWorkflowDescription(res.id, res.tasks);
            });

            this.socket.on('setTasksStatuses', (res: { id: string, statuses: Statuses }) => {
                self.onTasksStatuses(res.id, res.statuses);
            });

            this.socket.on('setWorkflowStatus', (res: { id: string, status: WorkflowStatus }) => {
                self.onWorkflowStatus(res.id, res.status);
            });

            this.socket.on('executionError', this.props.onError);
        } else {
            watchWorkflows();
        }
    }

    public render() {
        function getProgression(tasksStatuses) {
            let numTasksDone = 0;
            let statuses = values(tasksStatuses);
            for (let status of statuses) {
                if (status.status == 'ok') {
                    numTasksDone += 1;
                }
            }
            return numTasksDone / statuses.length;
        }


        let context = {
            socket: this.socket,
            workflows: mapValues(this.state.workflows, (value, key, obj) => {
                return {
                    ...value,
                    progression: getProgression(value.tasksStatuses),
                };
            }),
        };
        return <div style={this.props.style}>
            {this.props.render(context)}
        </div>;
    }
}
