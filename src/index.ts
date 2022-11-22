import path from 'path';
import fs from 'fs';

import { readdir } from 'fs/promises';

import componentGenerationPhase, {
  getDefaultGenerationOptions,
} from './ComponentGeneration';

// Read all directories and store in array
const getDirectories = async (source: string) => {
  const dirs = (await readdir(source, { withFileTypes: true }))
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  await componentGenerationPhase(getDefaultGenerationOptions(), dirs);
};

getDirectories('node_modules/@mui/material/');
