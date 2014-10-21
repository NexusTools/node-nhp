@noautocompile

enum Instruction {
    WRITE, // Write data to the stream
    WRITECODE, // Execute and write template code to the stream
    
    VALUE, // pushValue operation
    VARIABLE,
    OPERATOR, // pushOp operation
    
    IF,
    ELSEIF,
    ELSE,
    ENDIF
}

@main Instruction