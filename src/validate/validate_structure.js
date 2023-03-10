const TYPE = "(?<input_type>[\\w]+)";

const VALUE = '(?<value>-?[\\w\\." :]+)';
const SPACE = " *";
const OPBLOCK = "(?<open>\\(?)";
const CLBLOCK = "(?<close>\\)?)";

const INPUT =
    "input" +
    SPACE +
    OPBLOCK +
    TYPE +
    SPACE +
    "(," +
    SPACE +
    VALUE +
    ")?" +
    SPACE +
    CLBLOCK;

function asignation_validate({ name, content }) {
    //Name
    const name_id = "[_A-Za-z][\\w]*";
    if (!name.match(`^${name_id}$`))
        throw new Error(`${name} is invalid name.`);

    //Value
    const basic_value = '[\\w" ]+';
    const input = INPUT;
    const operation = `(?<value_a>${basic_value})${SPACE}(?<operator>\\+|-|\\*|\\/|\\\\|%|\\^)${SPACE}(?<value_b>${basic_value})`;

    const value_ids = [
        { operation: "variable", id: `(?<value>${name_id})` },
        { operation: "value", id: `(?<value>${basic_value})` },
        { operation: "input", id: input },
        { operation: "math", id: operation },
    ];
    // if (!value_ids.some(({ id }) => !!content.match(`^${id}$`)))
    //     throw new Error(`${content} is invalid value.`);

    for (const { operation, id } of value_ids) {
        const match = RegExp(`^${id}$`).exec(content);

        if (!match) continue;
        return { name, operation, content: match.groups };
    }
    throw new Error(`${content} is invalid value.`);
}

function condition_validate({ content }) {
    const value_id = '[\\w" \\.]+';
    const comparator_id = "==|!=|>|>=|<|<=";

    const condition_id = `(?<logic>\\|\\||&&)?${SPACE}(?<value_a>${value_id})${SPACE}(?<comparator>${comparator_id})${SPACE}(?<value_b>${value_id})${SPACE}(?<elsecontent>.*)?`;

    const evaluations = [];

    const getEvaluations = (content) => {
        const match = RegExp(`^${condition_id}$`).exec(content);

        if (!match) throw new Error(`${content} is invalid condition.`);

        const { logic, value_a, value_b, comparator, elsecontent } =
            match.groups;
        evaluations.push({ logic, value_a, value_b, comparator });

        if (elsecontent) getEvaluations(elsecontent);
    };

    getEvaluations(content);

    return { evaluations };
}

function validate_structure(lines) {
    let keys = 0;
    const validates = {
        declaration: ({ type, name, content }) => {
            const types = ["string", "int", "float"];
            if (!types.find((tp) => tp == type))
                throw new Error(`${type} type no exits.`);

            const data = asignation_validate({ name, content });

            return { type, ...data };
        },
        asignation: asignation_validate,
        output: ({ open, close, value }) => {
            if (!(open && close))
                throw new Error(
                    `${!open ? "(" : ")"} is missing at output statement.`
                );

            const value_ids = [
                { operation: "variable", id: /[_A-Za-z][\w]*/ },
                { operation: "value", id: /[\w" ]+/ },
            ];

            for (const { operation, id } of value_ids) {
                const match = RegExp(id).exec(value);

                if (!match) continue;
                return { operation, value };
            }
            throw new Error(`${value} is invalid value.`);
        },
        if: ({ start, content }) => {
            keys++;
            const evaluations = condition_validate({ content });
            return { start, ...evaluations };
        },
        while: (content) => {
            keys++;
            condition_validate(content);
        },
        for: ({ name, content }) => {
            keys++;
            if (!name.match(/^[_A-Za-z][\w]*$/))
                throw new Error(`${name} is invalid name.`);

            const range_id = `^(?<value_a>[\\w]+)${SPACE},${SPACE}(?<value_b>[\\w]+)$`;
            const match = RegExp(`^${range_id}$`).exec(content);
            if (!match) throw new Error(`${content} is invalid range.`);

            const { value_a, value_b } = match.groups;
            const range = [];

            const value_ids = [
                { operation: "variable", id: /[_A-Za-z][\w]*/ },
                { operation: "value", id: /[0-9]+/ },
            ];

            for (const { operation, id } of value_ids) {
                const match = RegExp(id).exec(value_a);

                if (!match) continue;
                else {
                    range.push({ operation, value: value_a });
                    break;
                }
            }
            for (const { operation, id } of value_ids) {
                const match = RegExp(id).exec(value_b);

                if (!match) continue;
                else {
                    range.push({ operation, value: value_b });
                    break;
                }
            }

            return { name, value_a: range[0], value_b: range[1] };
        },
        close: (content) => {
            keys--;
            return content;
        },
    };

    const actions = [];
    for (const { index, name, content } of lines) {
        const validate = validates[name] || (() => {});

        try {
            const new_content = validate(content);
            if (!!new_content)
                actions.push({ index, name, content: new_content });
        } catch (error) {
            throw new Error(`Line ${index}: ${error.message}`);
        }
    }

    if (keys > 0) throw new Error(`There are a block without close.`);

    return actions;
}

module.exports = { validate_structure };
