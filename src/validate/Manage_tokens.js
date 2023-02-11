class Manage_tokens {
    constructor() {
        this.tokens = [];
        this.validates = {
            value: ({ type, id, value }) => {
                if (!value.match(id))
                    throw new Error(`${value} is an invalid ${type} value.`);
                else return { value };
            },
            variable: ({ type, value }) => {
                if (!this.exists(value))
                    throw new Error(`variable ${value} no exist.`);

                const token = this.find(value);
                if (token.type != type)
                    throw new Error(`${value} is an invalid ${type} value.`);
                else return { value };
            },
            input: ({ type, open, close, value, input_type }) => {
                if (!(open && close))
                    throw new Error(
                        `${!open ? "(" : ")"} is missing at input statement.`
                    );

                const value_id = '[\\w" ]+';

                if (!value.match(value_id))
                    throw new Error(`${value} is invalid value.`);

                if (type != input_type)
                    throw new Error(`${name} can't save ${type} value.`);

                return { value };
            },
            math: ({ type, id, value_a, value_b, operator }) => {
                //Values
                const values = [value_a.trim(), value_b.trim()];

                for (const value of values) {
                    if (value.match(/[_A-Za-z][\w]*/)) {
                        if (!this.exists(value))
                            throw new Error(`variable ${value} no exist.`);

                        const token = this.find(value);
                        if (token.type != type)
                            throw new Error(
                                `${value} is an invalid ${type} value.`
                            );
                        continue;
                    }
                    if (value.match(/[\w" ]+/))
                        if (!value.match(id))
                            throw new Error(
                                `${value} is an invalid ${type} value.`
                            );
                }

                //Operator
                const type_operators = {
                    int: /\+|-|\*|\\|%|\^/,
                    floant: /\+|-|\*|\/|\\|%|\^/,
                    string: /\+|-/,
                };

                const id_operator = type_operators[type] || null;
                if (!operator.match(id_operator))
                    throw new Error(
                        `Invalid operator ${operator} to ${type} type.`
                    );

                return {
                    value_a: value_a.trim(),
                    value_b: value_b.trim(),
                    operator,
                };
            },
        };
    }

    exists(name) {
        return this.tokens.some((token) => token.name == name);
    }
    find(name) {
        return this.tokens.find((token) => token.name == name);
    }
    findIndex(name) {
        return this.tokens.findIndex((token) => token.name == name);
    }
    create({ type, name, operation = "value", content }) {
        if (this.exists(name)) throw Error(`${name} already exist`);
        const type_id = {
            int: /^(-?\d+)$/,
            float: /^-?\d+(\.\d+)?$/,
            string: /^\".+\"$/,
        };

        const id = type_id[type] || null;
        const validate = this.validates[operation] || (() => {});
        const value = validate({ type, id, ...content });

        if (value)
            this.tokens.push({
                type,
                name,
                content: { operation, ...value },
            });
    }

    modify({ name, operation, content }) {
        if (!this.exists(name)) throw new Error(`variable ${name} no exist.`);
        const token = this.find(name);

        if (token.name == token.name.toUpperCase())
            throw new Error(`${name} is a constant.`);

        const type = token.type;

        const type_id = {
            int: /^(-?\d+)$/,
            float: /^-?\d+(\.\d+)?$/,
            string: /^\".+\"$/,
        };

        const id = type_id[type] || null;
        const validate = this.validates[operation] || (() => {});
        if (validate({ type, id, ...content })) token.content = content;
    }
    fakeModify({ name, operation, content }) {
        if (!this.exists(name)) throw new Error(`variable ${name} no exist.`);
        const token = this.find(name);

        if (token.name == token.name.toUpperCase())
            throw new Error(`${name} is a constant.`);

        const type = token.type;

        const type_id = {
            int: /^(-?\d+)$/,
            float: /^-?\d+(\.\d+)?$/,
            string: /^\".+\"$/,
        };

        const id = type_id[type] || null;
        const validate = this.validates[operation] || (() => {});
        const value = validate({ type, id, ...content });
    }
    delete(name) {
        if (!this.exists(name)) throw new Error(`variable ${name} no exist.`);
        const token_index = this.findIndex(name);

        this.tokens.splice(token_index, 1);
    }
}

module.exports = { Manage_tokens };
