/// <reference types="node" />

import {Instruction,StackControl} from "../Instruction";

export class EndIf implements Instruction {
    readonly usesStackControl = true;
    constructor() {}

    generateSource(stackControl: StackControl, asyncContext: boolean): string {
        if (stackControl.pop({omitcb:true})['else'] || !asyncContext)
            return "}}catch(e){__out.write(__error(e))}";
        return "}else{__next()}}catch(e){__out.write(__error(e));__next()}"
    }

}