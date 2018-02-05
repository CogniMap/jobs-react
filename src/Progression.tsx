import * as React from 'react';
import * as SocketIO from 'socket.io-client';
import { update } from './immutability';

const mapValues = require('object.map');

const difference = require('lodash/difference');

const values = require('object.values');

import { Statuses, WorkflowStatus, WorkflowTreeTasks } from 'jobs';
import { ProgressionComponent } from './index.d';

/**
 * Backend component to track the progression of one or more workflows.
 */
export class Progression extends React.Component<ProgressionComponent.Props, ProgressionComponent.State>
{
    private socket = null;

    public static defaultProps : ProgressionComponent.Props = {
        workflowIds: [],
        host: '',
        render: (ctx) => null,
        onError: (err) => null,
    };

    public constructor(props)
    {
        super(props);
        this.state = {
            workflows: {},
        };
    }

    public componentDidMount()
    {
        if (this.props.workflowIds != null && this.props.workflowIds.length > 0) {
            this.setupWorkflow(this.props.workflowIds);
        }
    }

    public componentWillReceiveProps(nextProps : ProgressionComponent.Props)
    {
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
    private onWorkflowDescription(workflowId, tasks)
    {
        if (this.props.workflowIds.indexOf(workflowId) !== -1) {
            this.setState(prevState => update(prevState, {
                workflow: {$set: tasks},
            }));
        }
    }

    /**
     * Called when the statuses of the workflow's task update.
     *
     * @param workflowId
     * @param statuses
     */
    private onTasksStatuses(workflowId, statuses)
    {
        if (this.props.workflowIds.indexOf(workflowId) != -1) {
            this.setState(prevState => update(prevState, {
                tasksStatuses: {
                    $merge: statuses,
                },
            }));
        }
    }

    /**
     * Called when the status of a workflow updates.
     *
     * @param workflowId
     * @param status
     */
    private onWorkflowStatus(workflowId, status)
    {
        if (this.props.workflowIds.indexOf(workflowId) != -1) {
            switch (status) {
                case 'done':
                    this.props.onComplete();
                    break;
            }
        }
    }

    /**
     * Create the Websocket, and register listeners if needed.
     *
     * Register the client to the workroom, and update the tasks tree upon workflow description.
     */
    private setupWorkflow(workflowIds : string[])
    {
        let self = this;

        function watchWorkflows()
        {
            for (let workflowId of workflowIds) {
                self.socket.emit('watchWorkflowInstance', workflowId);
            }
        }

        if (this.socket == null) {
            let socket = this.socket = SocketIO.connect(this.props.host);
            socket.on('hello', data => {
                watchWorkflows();
            });

            socket.on('workflowDescription', (res : {id : string, tasks : WorkflowTreeTasks}) => {
                self.onWorkflowDescription(res.id, res.tasks);
            });

            socket.on('setTasksStatuses', (res : {id : string, statuses : Statuses}) => {
                self.onTasksStatuses(res.id, res.statuses);
            });

            socket.on('setWorkflowStatus', (res : {id : string, status : WorkflowStatus}) => {
                self.onWorkflowStatus(res.id, res.status);
            });

            socket.on('executionError', this.props.onError);
        } else {
            watchWorkflows();
        }
    }

    public render()
    {
        function getProgression(tasksStatuses)
        {
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
            workflows: mapValues(this.state.workflows, (key, value, obj) => {
                return {
                    ... value,
                    progression: getProgression(value.tasksStatuses),
                };
            }),
        };
        return this.props.render(context);
    }
}
