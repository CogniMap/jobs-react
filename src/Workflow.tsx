import * as React from 'react';
import {Treebeard} from 'react-treebeard';
const difference = require('lodash/difference');
const ReactJson = require('react-json-view').default;

import {WorkflowTreeTasks, Statuses, TaskStatus} from 'jobs';

import {ProgressionContext, WorkflowComponent} from './index.d';
import {update} from './immutability';
import {Progression} from './Progression';

/**
 * Render a workflow progression.
 * Display all tasks in a tree view, with a panel for the selected task. This panel display
 * the task status and the task body.
 *
 * Tasks can be run manually.
 */
export class Workflow extends React.Component<WorkflowComponent.Props, WorkflowComponent.State> {

  public static defaultProps: WorkflowComponent.Props = {
    workflowId: null,
    title: '',

    panelRenderer: () => null,
  }

  public constructor(props) {
    super(props);
    this.state = {
      tasksStates: {},

      selectedTask: null,
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
      workflowId={this.props.workflowId}
      render={(context : ProgressionContext) => {
        /**
         * Append the toggled/active state and the status to tasks,
         */
        function renderableWorkflow(tasks : WorkflowTreeTasks)
        {
          return (tasks as any).map(task => {
            let status = context.tasksStatuses[task.path] || {
              status: "inactive",
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

        function executeTask(taskPath : string) {
          if (context.socket != null) {
            context.socket.emit('executeTask', {
              workflowId: self.props.workflowId,
              taskPath,
            });
          }
        }

        function renderPanel(taskPath : string) {
          let self = this;
          let {body, status, context, argument} = this.state.tasksStatuses[this.state.selectedTask];

          if (typeof body == 'string') {
            body = {error: body};
          }

          return (
            <div className="col-md-6 col-sm-12">
              <div className="row">
                <button onClick={() => {
                  executeTask(self.state.selectedTask);
                }}>Executer</button>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  {status == "ok" || status == "failed" ? (
                    <div>
                      <h2>{status == "ok" ? "Résultat" : "Erreur"}</h2>
                      <ReactJson src={body || {}} />
                      <h2>Argument</h2>
                      <ReactJson src={argument || {}} />
                      <h2>Contexte</h2>
                      <ReactJson src={context || {}} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="container">
            <h1>{this.props.title}</h1>
            <div className="row">
              <div className="col-md-6 col-sm-12">
                <Treebeard
                  data={renderableWorkflow(context.workflow)}
                  onToggle={(node, toggled) => {
                    let updater = {
                      tasksStates: {
                        [node.path]: {
                          $apply: orig => ({
                            toggled: orig == null ? true : !orig.toggled,
                            active: toggled,
                          })
                        }
                      }
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
              {this.state.selectedTask != null ? renderPanel(this.state.selectedTask) : null}
            </div>
          </div>
        );
      }}
    />
  }
}
