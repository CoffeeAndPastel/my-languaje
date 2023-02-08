const NAME = "(?<name>[\\w]+)";
const VALUE = '(?<value>-?[\\w\\." :]+)';
const SPACE = " *";
const OPBLOCK = "(?<open>\\(?)";
const CLBLOCK = "(?<close>\\)?)";

const INPUT =
    "input" +
    SPACE +
    OPBLOCK +
    NAME +
    SPACE +
    "(," +
    SPACE +
    VALUE +
    ")?" +
    SPACE +
    CLBLOCK;

function asignation_validate({ name, content }) {
    //Name
    if (!name.match(/^[_A-Za-z][\w]*$/))
        throw new Error(`${name} is invalid name.`);

    //Value
    const basic_value = '[\\w" ]+';
    const input = INPUT;
    const operation = `^(?<value_a>${basic_value})${SPACE}(?<operator>\\+|\\-|\\*|\\/|\\/\\/|%)${SPACE}(?<value_b>${basic_value})$`;

    const value_ids = [basic_value, input, operation];
    if (!value_ids.some((id) => !!content.match(`^${id}$`)))
        throw new Error(`${content} is invalid value.`);

    return { name, value: content };
}

function condition_validate({ content }) {
    const value_id = '[\\w" ]+';
    const comparator_id = "==|!=|>|>=|<|<=";

    const basic_condition = `(?<value_a>${value_id})${SPACE}(?<comparator_a>${comparator_id})${SPACE}(?<value_b>${value_id})`;
    const two_condition = `${basic_condition}${SPACE}(?<logic>\\|\\||&&)${SPACE}(?<value_c>${value_id})${SPACE}(?<comparator_b>==|!=|>|>=|<|<=) *(?<value_d>${value_id})`;

    const condition_ids = [basic_condition, two_condition];

    const evaluations = (() => {
        for (const id of condition_ids) {
            const match = RegExp(`^${id}$`).exec(content);
            if (!!match) return match.groups;
        }
        throw new Error(`${content} is invalid condition.`);
    })();

    // if (!condition_ids.some((id) => !!content.match(`^${id}$`)))
    //     throw new Error(`${content} is invalid condition.`);

    return { evaluations };
}

function validate_structure(lines) {
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

            const value_id = '[\\w" ]+';

            if (!value.match(value_id))
                throw new Error(`${value} is invalid value.`);

            return { value };
        },
        if: ({ start, content }) => {
            const evaluations = condition_validate({ content });
            return { start, ...evaluations };
        },
        while: condition_validate,
        for: ({ name, content }) => {
            if (!name.match(/^[_A-Za-z][\w]*$/))
                throw new Error(`${name} is invalid name.`);

            const range_id = `^(?<value_a>[\\w]+)${SPACE},${SPACE}(?<value_b>[\\w]+)$`;
            const match = RegExp(`^${range_id}$`).exec(content);

            if (!match) throw new Error(`${content} is invalid range.`);

            return { name, ...match.groups };
        },
    };

    const actions = [];
    for (const { index, name, content } of lines) {
        const validate = validates[name] || (() => {});

        try {
            const newContent = validate(content);
            if (!!newContent)
                actions.push({ index, name, actions: newContent });
        } catch (error) {
            throw new Error(`Line ${index}: ${error.message}`);
        }
    }
    // actions.map((x) => console.log(x));

    return actions;
}

module.exports = { validate_structure };
