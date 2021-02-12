export function go() {
    console.log('module2');
    setTimeout(() => {
        import('./module3.js').then(module => {
            console.log(module);
            module.gogo('un texte');
        });
    }, 10000);
}
//# sourceMappingURL=module2.js.map