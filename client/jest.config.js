const { pathsToModuleNameMapper } = require('ts-jest');
const { paths } = require('./tsconfig.json').compilerOptions;

module.exports = {
    preset: 'jest-preset-angular',
    moduleDirectories: ['node_modules', '<rootDir>'],
    moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>' }),
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    "collectCoverage": true,
    "collectCoverageFrom": [
        "src/**/*.ts",
        "!src/app/components/loader/loader.component.ts",
        "!src/environments/*.ts",
        "!src/app/stub/*.ts",
        "!src/app/services/*.ts",
        "!src/app/static/*.ts",
        "!src/main.ts",
    ],
    transformIgnorePatterns: ['node_modules/(?!@angular|@ngrx|@phoenix|uuid|angular-oauth2-oidc|ngx-toastr)']
};
