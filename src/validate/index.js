const path = require("path");
const { read_file } = require("./read_file");
const { validate_lines } = require("./validate_lines");
const { validate_structure } = require("./validate_structure");

async function validate_code(name) {
    const text = await read_file(path.join(__dirname, `../docs/${name}`));

    try {
        //Lexical validate
        const lines = validate_lines(text);
        //Sintaxis validate
        const structure = validate_structure(lines);
        console.log(structure);
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = { validate_code };
