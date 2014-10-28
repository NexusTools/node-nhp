enum Instruction {
    WRITE, // Write data to the stream
    WRITECODE, // Execute and write template code to the stream
    
    PUSH,
    POP,
    
    VALUE, // pushValue
    VARIABLE,
    OPERATOR, // pushOp
    
    IF,
    ELSEIF,
    ELSE,
    ENDIF
}

@main Instruction