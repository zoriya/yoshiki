//
// Copyright (c) Zoe Roux and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import { FunctionComponent, ReactNode } from "react";
import { Stylable } from "yoshiki";

export type PProps = Stylable<"text"> & { children: ReactNode | string};
export declare const P: FunctionComponent<PProps>;
