const { Manage_tokens } = require("./Manage_tokens");

function validate_sense(actions) {
    const Tokens = new Manage_tokens();

    const validates = {
        // asignation: asignation_action,
        declaration: (data) => Tokens.create(data),
    };

    for (const { index, name, content } of actions) {
        const validate = validates[name] || (() => {});

        try {
            validate(content);
        } catch (error) {
            throw new Error(`Line ${index}: ${error.message}`);
        }
    }
    console.log(Tokens.tokens);
}

module.exports = { validate_sense };
