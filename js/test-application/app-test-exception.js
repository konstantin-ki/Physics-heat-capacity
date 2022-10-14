
let AA=1;
//console.log(`Value current AA = ${AA}`);
try {
    AA = 5;
    console.log(`Operation division AA = ${AA/2}`)
} catch (e) {
    console.log(e.message);
}
console.log(`Value current AA = ${AA}`);