import * as Handlebars from 'handlebars';
import * as Prettier from 'prettier';
import * as changeCase from 'change-case';
import * as fs from 'fs';
import * as path from 'path';
import { EOL } from 'os';
import readline from 'readline';
import { parse } from '@babel/parser';

interface IGenerationOptions {
  resultsPath: string;
  pluralizeNames: boolean;
  noConfigs: boolean;
  convertCaseFile: 'pascal' | 'param' | 'camel' | 'none';
  convertCaseEntity: 'pascal' | 'camel' | 'none';
  convertCaseProperty: 'pascal' | 'camel' | 'snake' | 'none';
  convertEol: 'LF' | 'CRLF';
  propertyVisibility: 'public' | 'protected' | 'private' | 'none';
  lazy: boolean;
  activeRecord: boolean;
  generateConstructor: boolean;
  generateRepository: boolean;
  generateType: boolean;
  customNamingStrategyPath: string;
  relationIds: boolean;
  strictMode: 'none' | '?' | '!';
  skipSchema: boolean;
  indexFile: boolean;
  exportType: 'named' | 'default';
}

import AppliccationProps from '../node_modules/@mui/material/Accordion/Accordion';

export const eolConverter = {
  LF: '\n',
  CRLF: '\r\n',
};

const prettierOptions: Prettier.Options = {
  parser: 'typescript',
  endOfLine: 'auto',
};

interface PropType {
  name: string;
  optional: boolean;
  type: string;
}

function createHandlebarsHelpers(generationOptions: IGenerationOptions): void {
  Handlebars.registerHelper('json', (context: any) => {
    const json = JSON.stringify(context);

    const withoutQuotes = json.replace(/"([^(")"]+)":/g, '$1:');

    return withoutQuotes.slice(1, withoutQuotes.length - 1);
  });

  Handlebars.registerHelper('toEntityName', (str: string) => {
    let retStr = '';

    switch (generationOptions.convertCaseEntity) {
      case 'camel':
        retStr = changeCase.camelCase(str);
        break;
      case 'pascal':
        retStr = changeCase.pascalCase(str);
        break;
      case 'none':
        retStr = str;
        break;
      default:
        throw new Error('Unknown case style');
    }
    return retStr;
  });

  Handlebars.registerHelper('toFileName', (str) => {
    let retStr = '';

    switch (generationOptions.convertCaseFile) {
      case 'camel':
        retStr = changeCase.camelCase(str);
        break;
      case 'param':
        retStr = changeCase.paramCase(str);
        break;
      case 'pascal':
        retStr = changeCase.pascalCase(str);
        break;
      case 'none':
        retStr = str;
        break;
      default:
        throw new Error('Unknown case style');
    }
    return retStr;
  });

  Handlebars.registerHelper('printPropertyVisibility', () =>
    generationOptions.propertyVisibility !== 'none'
      ? `${generationOptions.propertyVisibility} `
      : ''
  );

  Handlebars.registerHelper('toPropertyName', (str) => {
    let retStr = '';

    switch (generationOptions.convertCaseProperty) {
      case 'camel':
        retStr = changeCase.camelCase(str);
        break;
      case 'pascal':
        retStr = changeCase.pascalCase(str);
        break;
      case 'none':
        retStr = str;
        break;
      case 'snake':
        retStr = changeCase.snakeCase(str);
        break;
      default:
        throw new Error('Unknown case style');
    }
    return retStr;
  });
}

function generateAtomicComponents(directories: string[], resultPath: string) {
  const componentTemplatePath = path.resolve(
    __dirname,
    'templates',
    'component.mst'
  );

  const componentTemplate = fs.readFileSync(componentTemplatePath, 'utf-8');

  const componentCompiledTemplate = Handlebars.compile(componentTemplate, {
    noEscape: true,
  });

  directories.forEach(async (element: string) => {
    console.log(element);
    const resultFilePath = path.resolve(resultPath, `${element}.tsx`);

    const rendered = componentCompiledTemplate({
      componentName: element,
    });

    let formatted = '';

    try {
      formatted = Prettier.format(rendered, prettierOptions);
    } catch (error) {
      console.error(
        'There were some problems with component generation for item: ',
        element
      );
      console.error(error);

      formatted = Prettier.format(rendered, prettierOptions);
    }

    fs.writeFileSync(resultFilePath, formatted, {
      encoding: 'utf-8',
      flag: 'w',
    });
  });
}

export function getDefaultGenerationOptions(): IGenerationOptions {
  const generationOptions: IGenerationOptions = {
    resultsPath: path.resolve(process.cwd(), 'output'),
    pluralizeNames: true,
    noConfigs: false,
    convertCaseFile: 'pascal',
    convertCaseEntity: 'pascal',
    convertCaseProperty: 'camel',
    convertEol: EOL === '\n' ? 'LF' : 'CRLF',
    propertyVisibility: 'public',
    lazy: false,
    activeRecord: true,
    generateConstructor: true,
    generateRepository: true,
    generateType: true,
    customNamingStrategyPath: '',
    relationIds: false,
    strictMode: 'none',
    skipSchema: false,
    indexFile: true,
    exportType: 'named',
  };
  return generationOptions;
}

export default async function componentGenerationPhase(
  generationOptions: IGenerationOptions,
  directories: string[]
) {
  // createHandlebarsHelpers(generationOptions);

  // get path to where generated files are stored
  const resultPath = path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(resultPath)) {
    fs.mkdirSync(resultPath);
  }

  generateAtomicComponents(directories, resultPath);
}
