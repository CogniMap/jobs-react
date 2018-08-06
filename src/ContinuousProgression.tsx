import * as React from 'react';

const update = require('immutability-helper');
const FakeProgress = require("fake-progress");

import {Statuses, WorkflowStatus, WorkflowTreeTasks} from 'jobs';
import {ProgressionContext, ProgressionComponent, ContinuousProgressionComponent} from './index.d';
import {Progression} from "./Progression";

/**
 * Generate a fake continuous progression, using an exponential function
 */
export class ContinuousProgression extends React.Component<ContinuousProgressionComponent.Props, ContinuousProgressionComponent.State> {
    private fakeProgress: {
        [workflowId: string]: {
            [taskPath: string]: any;
        }
    };
    private intervals: {
        [workflowId: string]: {
            [taskPath: string]: any; // JS Intervals instance
        }
    };

    public static defaultProps = {
        updateInterval: 40
    };

    public constructor(props: ContinuousProgressionComponent.Props) {
        super(props);
        this.fakeProgress = {};
        this.intervals = {};
        this.state = {
            progressions: {}
        }

        for (let workflowId of props.workflowIds) {
            this.fakeProgress[workflowId] = {};
            this.intervals[workflowId] = {};
            this.state.progressions[workflowId] = {};
        }

    }

    /**
     * Create one FakeProgress instance per task
     */
    public componentWillMount() {
        let taskPaths = Object.keys(this.props.estimations);
        for (let taskPath of taskPaths) {

        }
    }

    /**
     * Clear everything
     */
    public componentWillUnmount() {
        for (let workflowId in this.intervals) {
            let workflowIntervals = this.intervals[workflowId];
            for (let taskPath in workflowIntervals) {
                clearInterval(workflowIntervals[taskPath]);
            }
        }
    }

    public updateTaskProgression(workflowId: string, taskPath: string, newProgression: number) {
        this.setState(state => update(state, {
            progressions: {
                [workflowId]: {
                    $merge: {
                        [taskPath]: newProgression
                    }
                }
            }
        }));

    }

    public render() {
        let self = this;
        return (
            <Progression
                {... this.props as any}
                onTaskStart={(workflowId, taskPath) => {
                    if (self.props.onTaskStart) {
                        self.props.onTaskStart(workflowId, taskPath);
                    }

                    let estimation = self.props.estimations[taskPath]; // In milliseconds
                    /**
                     * With a timeconstant of 10 sec, after 10 seconds, progress will be 0.6321 ( = 1-Math.exp(-1) )
                     *
                     * We consider progress = 100% at t=5*\tau
                     */
                    let timeConstant = estimation / 6;
                    let fakeProgress = this.fakeProgress[workflowId][taskPath] = new FakeProgress({
                        timeConstant,
                        autoStart: true
                    });
                    let handler = setInterval(() => {
                        let progress = fakeProgress.progress;
                        self.updateTaskProgression(workflowId, taskPath, progress);
                    }, self.props.updateInterval)
                    self.intervals[workflowId][taskPath] = handler;
                }}
                onTaskEnd={(workflowId, taskPath) => {
                    if (self.props.onTaskEnd) {
                        self.props.onTaskEnd(workflowId, taskPath);
                    }

                    // End fakeProgress
                    let fakeProgress = this.fakeProgress[workflowId][taskPath];
                    if (fakeProgress != null) { // onTaskStart may have not been called for quick tasks
                        fakeProgress.end();
                    }

                    self.updateTaskProgression(workflowId, taskPath, 1);

                    // Clear interval
                    clearInterval(this.intervals[workflowId][taskPath]);
                    delete this.intervals[workflowId][taskPath];
                }}
                render={(context: ProgressionContext) => {
                    let continuousContext = {
                        workflows: {}
                    };
                    for (let workflowId of self.props.workflowIds) {
                        if (context.workflows[workflowId] == null) {
                            continue;
                        }
                        continuousContext.workflows[workflowId] = {
                            tasksStatuses: context.workflows[workflowId].tasksStatuses,
                            tasksProgressions: self.state.progressions[workflowId],
                            progression: context.workflows[workflowId].progression
                        }
                    }
                    return self.props.render(continuousContext);
                }}
            />
        )
    }
}
