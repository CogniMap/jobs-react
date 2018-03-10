import * as React from 'react';
const ReactJson = require('react-json-view').default;
import { JsonEditor } from 'react-json-edit';
const equals = require('deep-equal');

import { ProgressionContext } from './index.d';
import { Packets } from './network';
import { networkInterfaces } from 'os';

namespace Panel
{
    export interface Props
    {
        taskPath : string;
        workflowId: string;
        progressContext: ProgressionContext; // We assume there is our workflow in this context
    }

    export interface State
    {
        contextUpdaters: any;
    }
}

export class Panel extends React.Component<Panel.Props, Panel.State>
{
    public constructor(props)
    {
        super(props);
        this.state = {
            contextUpdaters: [],
        };
    }

    private executeTask(taskPath : string)
    {
        if (this.props.progressContext.socket != null) {
            this.props.progressContext.socket.emit('executeTask', {
                workflowId: this.props.workflowId,
                taskPath,
            });
        }
    }

    public componentWillReceiveProps(nextProps : Panel.Props)
    {
        let workflowContext = nextProps.progressContext.workflows[nextProps.workflowId];
        if (workflowContext != null) {
            //let contextUpdaters = workflowContext.tasksStatuses[nextProps.taskPath].contextUpdaters;
            //if (!equals(contextUpdaters, this.state.contextUpdaters)) {
            //    this.setState({contextUpdaters});
            //}
        }
    }

    public render()
    {
        let workflowContext = this.props.progressContext.workflows[this.props.workflowId];
        if (workflowContext== null) {
            return <div/>;
        }

        let {body, status, context, argument, contextUpdaters} = workflowContext.tasksStatuses[this.props.taskPath] as any;
        let socket = this.props.progressContext.socket;
        let self = this;

        try {
            JSON.parse(argument);
        } catch (e) {
            argument = {};
        }

        if (typeof body == 'string') {
            if (status == "ok") {
                body = {"result": body}
            } else {
                body = {"error": body};
            }
        }

        return (
            <div className="col-md-6 col-sm-12">
                <div className="row">
                    <button onClick={() => {
                        this.executeTask(this.props.taskPath);
                    }}>Executer
                    </button>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        {status == 'ok' || status == 'failed' ? (
                            <div>
                                <h2>{status == 'ok' ? 'Résultat' : 'Erreur'}</h2>
                                <ReactJson src={body || {}}/>
                                <h2>Argument</h2>
                                <ReactJson src={argument || {}}/>
                                <h2>Contexte</h2>
                                <ReactJson src={context || {}}/>
                                <h2>Updaters</h2>
                                <JsonEditor value={this.state.contextUpdaters} propagateChanges={newUpdaters => {
                                    self.setState({
                                        contextUpdaters: newUpdaters
                                    });
                                }}/>
                                <button onClick={() => {
                                    Packets.setContextUpdaters(socket, self.props.workflowId, self.props.taskPath, self.state.contextUpdaters);
                                }}>Sauvegarder updaters</button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
}
