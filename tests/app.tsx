import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Cognimap } from '../src/Cognimap';

require("../assets/style.scss");

ReactDOM.render(
    <div>
      <Cognimap/>
    </div>,
    document.getElementById('root')
);

