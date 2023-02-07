//Ids
const NAME = "(?<name>[\\w]+)";
const TYPE = "(?<type>[\\w]+)";
const CONTENT = "(?<content>.*)";
const VALUE = '(?<value>-?[\\w\\." :]+)';
const SPACE = " *";
const OPBLOCK = "(?<open>\\(?)";
const CLBLOCK = "(?<close>\\)?)";

//Statement
const ASIGNATIONID = NAME + SPACE + "=" + SPACE + CONTENT;

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
            CONTENT +
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
            CONTENT +
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
            CONTENT +
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

function validate_lines(text) {
    const lines = text.map((line, index) => {
        if (!line) return null;
        for (const { name, id } of statements) {
            const match = RegExp(id).exec(line);

            if (!match) continue;

            if (match[0] == line)
                return { index: index + 1, name, content: match.groups };
        }

        throw new Error(`Lexical Error: unknown line ${index + 1}.`);
    });

    // console.log(lines.filter((line) => !!line));

    return lines.filter((line) => !!line);
}

module.exports = { validate_lines };
