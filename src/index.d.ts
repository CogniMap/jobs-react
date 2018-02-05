import { Statuses, WorkflowTreeTasks } from 'jobs';

/***************************************************************************
 *  React components
 **************************************************************************/

import * as React from 'react';

export namespace WorkflowComponent
{
    export interface Props
    {
        host : string;
        workflowId : string;
        title : string;
    }

    export interface State
    {
        tasksStates : {
            [taskPath : string] : {
                toggled : boolean,
                active : boolean,
            }
        },

        selectedTask ? : string; // Task path
        updaters ?: any; // Updaters of selected task
    }
}

declare class Workflow extends React.Component<WorkflowComponent.Props, WorkflowComponent.State>
{
}

export interface ProgressionContext
{
    socket : any;
    workflows: {
        [id : string] : {
            workflow ? : WorkflowTreeTasks;
            tasksStatuses ? : Statuses;

            progression : number; // Percent
        }
    }
}

export namespace ProgressionComponent
{
    export interface Props
    {
        host : string;
        workflowIds : string[];

        render : {(context : ProgressionContext) : any;};

        // Events handlers
        onError ? : {(err : {type : string, payload : string});};
        onComplete ?: {(): void;};
    }

    export interface State
    {
        workflows ?: {
            [id: string]: {
                workflows: WorkflowTreeTasks; // Descriptions
                tasksStatuses: Statuses;
            };
        };
    }
}

declare class Progression extends React.Component<ProgressionComponent.Props, ProgressionComponent.State>
{
}

/***************************************************************************
 *  Types
 **************************************************************************/

// Component specific types
