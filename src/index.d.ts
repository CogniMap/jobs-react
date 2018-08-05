import {Statuses, WorkflowTreeTasks} from 'jobs';

/***************************************************************************
 *  React components
 **************************************************************************/

import * as React from 'react';

export namespace WorkflowComponent {
    export interface Props {
        host: string;
        workflowId: string;
        title: string;
    }

    export interface State {
        tasksStates: {
            [taskPath: string]: {
                toggled: boolean,
                active: boolean,
            }
        },

        selectedTask?: string; // Task path
        updaters?: any; // Updaters of selected task
    }
}

declare class Workflow extends React.Component<WorkflowComponent.Props, WorkflowComponent.State> {
}

export interface ProgressionContext {
    socket: any;
    workflows: {
        [id: string]: {
            workflow?: WorkflowTreeTasks;
            tasksStatuses?: Statuses;

            progression: number; // Percent
        }
    }
}

interface BaseProgressionProps {
    style?: any;

    host?: string;
    workflowIds: string[];

    // Events handlers
    onError?: { (err: { type: string, payload: string }); };
    onComplete?: { (workflowId: string): void; };
}

export namespace ProgressionComponent {
    export interface Props extends BaseProgressionProps {
        render: { (context: ProgressionContext): any; };

        onTaskStart?: { (workflowId: string, taskPath: string) };
        onTaskEnd?: { (workflowId: string, taskPath: string) };
    }

    export interface State {
        workflows?: {
            [id: string]: {
                workflows: WorkflowTreeTasks; // Descriptions
                tasksStatuses: Statuses;
            };
        };
    }
}

export interface ContinuousProgressionContext {
    workflows: {
        [id: string]: {
            tasksStatuses?: Statuses;
            tasksProgressions: {
                [taskPath: string]: number; // Percent
            }
            progression: number; // Overall progression
        }
    }
}

/**
 * Caller component must know the workflow tasks paths.
 */
export namespace ContinuousProgressionComponent {
    export interface Props extends BaseProgressionProps {
        estimations: {
            [taskPath: string]: number; // Nuber of milliseconds
        };
        updateInterval?: number; // Interval in milliseconds to update the progressinon context

        render: { (context: ContinuousProgressionContext): any; };
    }

    export interface State {
        progressions: {
            [workflowId: string]: {
                [taskPath: string]: number;
            }
        }
    }
}

declare class Progression extends React.Component<ProgressionComponent.Props, ProgressionComponent.State> {
}

declare class ContinuousProgression extends React.Component<ContinuousProgressionComponent.Props, ContinuousProgressionComponent.State> {
}

/***************************************************************************
 *  Types
 **************************************************************************/

// Component specific types
