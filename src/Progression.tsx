import * as React from 'react';


export namespace Progression {
	export interface Props {
    progress: number;
    color: string;
    logs: string[];
	}

	export interface State {
	}
}

/**
 * Default job progression display.
 */
export class Progression extends React.Component<Progression.Props, Progression.State>
{
  public render()
  {
		return (
			<div>
			</div>
		);
  }
}
