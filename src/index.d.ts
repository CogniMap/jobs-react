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

        panelRenderer();   // Component renderer
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
    }
}

declare class Workflow extends React.Component<WorkflowComponent.Props, WorkflowComponent.State>
{
}

export interface ProgressionContext
{
    socket : any;
    workflow ? : WorkflowTreeTasks;
    tasksStatuses ? : Statuses;

    progression : number; // Percent
}

export namespace ProgressionComponent
{
    export interface Props
    {
        host : string;
        workflowId : string;

        render : {(context : ProgressionContext) : any;};

        // Events handlers
        onError ? : {(err : {type : string, payload : string});};
        onComplete ?: {(): void;};
    }

    export interface State
    {
        workflow ? : WorkflowTreeTasks;
        tasksStatuses ? : Statuses;
    }
}

declare class Progression extends React.Component<ProgressionComponent.Props, ProgressionComponent.State>
{
}

/***************************************************************************
 *  Types
 **************************************************************************/

// Component specific types
