import { join } from 'path';
import { reconsilePath } from './path-reconsiler';
import { readdirSync } from 'fs';

export const F_FIND_DIR = (relPath: string) =>
    reconsilePath(join(__dirname + '/..', relPath));

const F_DIR_FILES = (relPath: string) => readdirSync(F_FIND_DIR(relPath));

function validateFileType(file: string, fileFormat: string): boolean {
    const fileExtension = file
        .toLowerCase()
        .substr(file.length - fileFormat.length);
    return fileExtension === fileFormat;
}

export const F_FIND_FILE = (relPath: string, fileFormat: string) =>
    F_DIR_FILES(relPath).find((file) => validateFileType(file, fileFormat));

const F_FIND_FILES = (relPath: string, fileFormat: string) =>
    F_DIR_FILES(relPath).filter((file) => validateFileType(file, fileFormat));

export const F_FIND_VSIX_BY_FILE_NAME = (
    relPath: string,
    fileFormat: string,
    fileSubStr: string,
) => {
    const eslintExtensionFiles = F_FIND_FILES(relPath, fileFormat)
        .filter((file) => file.includes(fileSubStr))!
        .sort();
    return eslintExtensionFiles[eslintExtensionFiles.length - 1];
};
