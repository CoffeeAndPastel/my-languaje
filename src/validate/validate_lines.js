function validate_lines(text) {
    //Ids
    const NAME = /(?<name>[\w]+)/;
    const TYPE = /(?<type>[\w]+)/;
    const VALUE = /(?<value>.*)/;
    const SPACE = / */;
    const OPBLOCK = /(?<open>\(?)/;
    const CLBLOCK = /(?<close>\)?)/;

    //Statement
    const ASIGNATIONID =
        NAME.source + SPACE.source + "=" + SPACE.source + VALUE.source;

    const statements = [
        {
            name: "asignation",
            id: ASIGNATIONID,
        },
        {
            name: "declaration",
            id: TYPE.source + SPACE.source + ASIGNATIONID,
        },
        {
            name: "if",
            id:
                "(?<start>&&&|\\|\\|\\|)" +
                SPACE.source +
                "\\(" +
                VALUE.source +
                "\\)" +
                SPACE.source +
                ":" +
                SPACE.source +
                "\\{" +
                SPACE.source,
        },
        {
            name: "for",
            id:
                NAME.source +
                SPACE.source +
                "\\?" +
                SPACE.source +
                "\\(" +
                VALUE.source +
                "\\)" +
                SPACE.source +
                ":" +
                SPACE.source +
                "\\{" +
                SPACE.source,
        },
        {
            name: "while",
            id:
                "&&&" +
                SPACE.source +
                "\\(" +
                VALUE.source +
                "\\)" +
                SPACE.source +
                "\\?" +
                SPACE.source +
                ":" +
                SPACE.source +
                "\\{" +
                SPACE.source,
        },
        {
            name: "output",
            id:
                "output" +
                SPACE.source +
                OPBLOCK.source +
                VALUE.source +
                SPACE.source +
                CLBLOCK.source,
        },
        { name: "close", id: "}" },
    ];

    const lines = text.map((line, index) => {
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
