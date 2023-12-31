import * as React from "react";
import {GraphOptimizerContextProps} from "../../types/GraphOptimizerTypes";


export const GraphOptimizerContext: React.Context<GraphOptimizerContextProps> = React.createContext<GraphOptimizerContextProps>({} as GraphOptimizerContextProps);
