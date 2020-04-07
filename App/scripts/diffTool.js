const fs = require('fs');

const [file1, file2] = process.argv.slice(process.argv.length - 2);

console.log('reading contents from ', file1);
const content1 = fs.readFileSync(file1);
console.log('reading contents from ', file2);
const content2 = fs.readFileSync(file2);

console.log('json parse file 1');
const obj1 = JSON.parse(content1);

console.log('json parse file 2');
const obj2 = JSON.parse(content2);

const obj1Keys = Object.keys(obj1);
const obj2Keys = Object.keys(obj2);

const keysDiff = obj1Keys.filter(k => !obj2Keys.includes(k)).concat(obj2Keys.filter(k2 => !obj1Keys.includes(k2)));
console.log('keysDiff: ', keysDiff);

const differentKeys = [];
const identicalKeys = obj1Keys.filter(obj2Keys.includes.bind(obj2Keys));
for (const key of identicalKeys) {
    const str1 = JSON.stringify(obj1[key]),
        str2 = JSON.stringify(obj2[key]);

    if (str1 !== str2)
        differentKeys.push(key);
}

console.log('differentKeys', differentKeys);
console.log('done');