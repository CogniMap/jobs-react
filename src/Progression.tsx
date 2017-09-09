import * as React from 'react';
import * as SocketIO from 'socket.io-client';
import { update } from './immutability';

const values = require('object.values');

import { Statuses, WorkflowStatus, WorkflowTreeTasks } from 'jobs';
import { ProgressionComponent } from './index.d';

/**
 * Default job progression display.
 */
export class Progression extends React.Component<ProgressionComponent.Props, ProgressionComponent.State>
{
    private socket = null;

    public static defaultProps : ProgressionComponent.Props = {
        workflowId: null,
        host: '',
        render: (ctx) => null,
        onError: (err) => null,
    };

    public constructor(props)
    {
        super(props);
        this.state = {
            workflow: [],
            tasksStatuses: {},
        };
    }

    public componentDidMount()
    {
        if (this.props.workflowId != null) {
            this.setupWorkflow(this.props.workflowId);
        }
    }

    public componentWillReceiveProps(nextProps : ProgressionComponent.Props)
    {
        if (nextProps.workflowId != null && nextProps.workflowId != this.props.workflowId) {
            this.setupWorkflow(nextProps.workflowId);
        }
    }

    /**
     * Create the Websocket, and register listeners if needed.
     *
     * Register the client to the workroom, and update the tasks tree upon workflow description.
     */
    private setupWorkflow(workflowId : string)
    {
        let self = this;

        if (this.socket == null) {
            let socket = this.socket = SocketIO.connect(this.props.host);
            socket.on('hello', data => {
                socket.emit('watchWorkflowInstance', workflowId);
            });

            socket.on('workflowDescription', (res : {id : string, tasks : WorkflowTreeTasks}) => {
                if (res.id == workflowId) {
                    self.setState(prevState => update(prevState, {
                        workflow: {$set: res.tasks},
                    }));
                }
            });

            socket.on('setTasksStatuses', (res : {id : string, statuses : Statuses}) => {
                if (res.id == workflowId) {
                    self.setState(prevState => update(prevState, {
                        tasksStatuses: {
                            $merge: res.statuses,
                        },
                    }));
                }
            });

            socket.on('setWorkflowStatus', (res : {id : string, status : WorkflowStatus}) => {
                if (res.id == workflowId) {
                    switch (status) {
                        case 'done':
                            self.props.onComplete();
                            break;
                    }
                }
            });

            socket.on('executionError', this.props.onError);
        } else {
            this.socket.emit('watchWorkflowInstance', workflowId);
        }
    }


    public render()
    {
        let numTasksDone = 0;
        let statuses = values(this.state.tasksStatuses);
        for (let status of statuses) {
            if (status.status == 'ok') {
                numTasksDone += 1;
            }
        }
        let context = {
            socket: this.socket,
            workflow: this.state.workflow,
            tasksStatuses: this.state.tasksStatuses,

            progression: numTasksDone / statuses.length,
        };
        return this.props.render(context);
    }
}
