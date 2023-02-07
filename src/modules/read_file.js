const { promises: fsPromises } = require("fs");

async function read_file(filename) {
    try {
        const contents = await fsPromises.readFile(filename, "utf-8");
        const arr = contents.split(/\r?\n/);
        return arr.map((x) => x.trim());
    } catch (err) {
        console.log(err);
    }
}

module.exports = { read_file };
