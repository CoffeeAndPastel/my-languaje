function validate_lines(text) {
    //Ids
    const NAME = "(?<name>[\\w]+)";
    const TYPE = "(?<type>[\\w]+)";
    const VALUE = "(?<value>.*)";
    const SPACE = " *";
    const OPBLOCK = "(?<open>\\(?)";
    const CLBLOCK = "(?<close>\\)?)";

    //Statement
    const ASIGNATIONID = NAME + SPACE + "=" + SPACE + VALUE;

    const statements = [
        {
            name: "asignation",
            id: ASIGNATIONID,
        },
        {
            name: "declaration",
            id: TYPE + SPACE + ASIGNATIONID,
        },
        {
            name: "if",
            id:
                "(?<start>&&&|\\|\\|\\|)" +
                SPACE +
                "\\(" +
                VALUE +
                "\\)" +
                SPACE +
                ":" +
                SPACE +
                "\\{" +
                SPACE,
        },
        {
            name: "for",
            id:
                NAME +
                SPACE +
                "\\?" +
                SPACE +
                "\\(" +
                VALUE +
                "\\)" +
                SPACE +
                ":" +
                SPACE +
                "\\{" +
                SPACE,
        },
        {
            name: "while",
            id:
                "&&&" +
                SPACE +
                "\\(" +
                VALUE +
                "\\)" +
                SPACE +
                "\\?" +
                SPACE +
                ":" +
                SPACE +
                "\\{" +
                SPACE,
        },
        {
            name: "output",
            id: "output" + SPACE + OPBLOCK + VALUE + SPACE + CLBLOCK,
        },
        { name: "close", id: "}" },
    ];

    const lines = text.map((line, index) => {
        if (!line) return null;
        for (const { name, id } of statements) {
            const match = RegExp(id).exec(line);

            if (!match) continue;

            if (match[0] == line) return { name, content: match.groups };
        }

        throw new Error(`Lexical Error: unknown line ${index}.`);
    });

    console.log(lines);

    return lines;
}

module.exports = { validate_lines };
