const path = require("path");
const { read_file } = require("./read_file");
const { validate_lines } = require("./validate_lines");

async function validate_code(name) {
    const text = await read_file(path.join(__dirname, `../docs/${name}`));

    //Lexical validate
    const lines = validate_lines(text);
}

module.exports = { validate_code };
