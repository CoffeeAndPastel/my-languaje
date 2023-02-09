const { Manage_tokens } = require("./Manage_tokens");

const validate_conditions = (Manage, { evaluations }) => {
    for (const { value_a, value_b } of evaluations) {
        const tokens = [];
        for (const value of [value_a.trim(), value_b.trim()]) {
            if (value.match(/[_A-Za-z][\w]*/)) {
                if (!Manage.exists(value))
                    throw new Error(`variable ${value} no exist.`);

                tokens.push(Manage.find(value).type);
                continue;
            }

            if (value.match(/[\w" ]+/)) {
                const types = [
                    { name: "int", id: /^(-?\d+)$/ },
                    { name: "float", id: /^-?\d+(\.\d+)?$/ },
                    { name: "string", id: /^\".+\"$/ },
                ];

                const type = (() => {
                    for (const { name, id } of types) {
                        if (value.match(id)) {
                            return name;
                        }
                    }
                })();
                if (!type) throw new Error(`${value} not identifiable.`);
                else tokens.push(type);
            }
        }
        if (new Set(tokens).size != 1)
            throw new Error(
                `${value_a.trim()} & ${value_b.trim()} don't match types.`
            );
    }
    // { operation: "variable", id:  },
    // { operation: "value", id: /[0-9]+/ },
};

function validate_sense(actions) {
    const Tokens = new Manage_tokens();

    const validates = {
        declaration: (content) => Tokens.create(content),
        asignation: (content) => Tokens.modify(content),
        output: ({ operation, value }) => {
            const validates = {
                variable: (value) => {
                    if (!Tokens.exists(value))
                        throw new Error(`variable ${value} no exist.`);
                },
            };
            const validate = validates[operation] || (() => {});
            validate(value);
        },
        for: ({ name, value_a, value_b }) => {
            if (Tokens.exists(name))
                throw new Error(`variable ${name} already exist.`);

            //verify value
            const values = [];
            for (const { operation, value } of [value_a, value_b]) {
                if (operation === "variable") {
                    if (!Tokens.exists(value))
                        throw new Error(`variable ${value} no exist.`);

                    const token = Tokens.find(value);

                    if (token.type !== "int")
                        throw new Error(`${token.name} must be int type.`);

                    values.push(parseInt(token.value));
                    continue;
                }
                if (operation === "value") {
                    if (!value.match(/^(-?\d+)$/))
                        throw new Error(`${value} must be int type.`);
                    values.push(parseInt(value));
                    continue;
                }
            }
            // if (values[0] >= values[1])
            //     throw new Error(
            //         `${values[0]} must be lower than ${values[1]}.`
            //     );
        },
        if: (content) => {
            validate_conditions(Tokens, content);
        },
    };

    for (const { index, name, content } of actions) {
        const validate = validates[name] || (() => {});

        try {
            validate(content);
        } catch (error) {
            throw new Error(`Line ${index}: ${error.message}`);
        }
    }
    // console.log(Tokens.tokens);
}

module.exports = { validate_sense };
