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
}

function condition_validate({ content }) {
    const value_id = '[\\w" ]+';
    const comparator_id = "==|!=|>|>=|<|<=";
    const basic_condition = `(?<value_a>${value_id})${SPACE}(?<comparator_a>${comparator_id})${SPACE}(?<value_b>${value_id})`;
    const two_condition = `${basic_condition}${SPACE}(?<logic>\\|\\||&&)${SPACE}(?<value_c>${value_id})${SPACE}(?<comparator_b>==|!=|>|>=|<|<=) *(?<value_d>${value_id})`;

    const condition_ids = [basic_condition, two_condition];
    if (!condition_ids.some((id) => !!content.match(`^${id}$`)))
        throw new Error(`${content} is invalid condition.`);
}

function validate_structure(lines) {
    const validates = {
        declaration: ({ type, name, content }) => {
            const types = ["string", "int", "float"];
            if (!types.find((tp) => tp == type))
                throw new Error(`${type} type no exits.`);

            asignation_validate({ name, content });
        },
        asignation: asignation_validate,
        output: ({ open, close }) => {
            if (!(open && close))
                throw new Error(
                    `${!open ? "(" : ")"} is missing at output statement.`
                );
        },
        if: condition_validate,
        while: condition_validate,
        for: ({ name, content }) => {
            if (!name.match(/^[_A-Za-z][\w]*$/))
                throw new Error(`${name} is invalid name.`);

            if (
                !content.match(
                    `^(?<value_a>[\\w]+)${SPACE},${SPACE}(?<value_b>[\\w]+)$`
                )
            )
                throw new Error(`${content} is invalid range.`);
        },
    };

    for (const { index, name, content } of lines) {
        // const {index, name, content } = line;

        default_validate = () => {};
        const validate = validates[name] || default_validate;

        try {
            validate(content);
        } catch (error) {
            throw new Error(`Line ${index}: ${error.message}`);
        }
    }
}

module.exports = { validate_structure };
