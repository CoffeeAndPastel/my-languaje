const path = require("path");
const { read_file } = require("./read_file");

async function validate_code(name) {
    const text = await read_file(path.join(__dirname, `../docs/${name}`));
    console.log(text);
}

module.exports = { validate_code };
