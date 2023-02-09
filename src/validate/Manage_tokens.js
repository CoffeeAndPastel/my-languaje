class Manage_tokens {
    constructor() {
        this.tokens = [];
    }

    exists(name) {
        return this.tokens.some((token) => token.name == name);
    }
    // create: function ({ type, name, operation, content }) {
    create({ type, name, operation, content }) {
        const type_id = {
            int: /^(-?\d+)$/,
            floant: /^-?\d+.\d+?$/,
            string: /^\".+\"$/,
        };

        const validates = {
            value: (id, { value }) => {
                if (!value.match(id))
                    throw new Error(`${value} is an invalid ${type} value.`);
                else return { value };
            },
        };
        const id = type_id[type] || null;
        const validate = validates[operation] || (() => {});
        const value = validate(id, content);

        if (value)
            this.tokens.push({
                type,
                name,
                content: { operation, ...value },
            });
    }

    modify({ name, value }) {
        const token = this.tokens.find((token) => token.name == name);
        token.value = value;
    }
}

module.exports = { Manage_tokens };
