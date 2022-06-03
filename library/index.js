const
    // SniperCode.FileSystem Module Import for file system operations 
    FileSystem = require('SniperCode.FileSystem').File_System,
    // Extract Libraries using the SniperCode.FileSystem module
    Libraries = FileSystem.scan_dir_recursive(FileSystem.path_resolve(__dirname, '.')),
    /**
     * @description This method is used to capitalize the first letter of a string.
     * @method UcFirst
     * @param {String} str
     * @returns {String}
     */
    UcFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
let
    // Exportable Library object to be exported
    /**
     * @description This object is used to export the libraries.
     * @default
     * @class ExportableLibraries
     * @returns {Object}  
     * ````````
     * {
     *     [Library]: {
     *       [LibraryElements],
     *       Details:{
     *          AccessName:'....',
     *          FullFileName:'....',
     *          FilePath:'....',
     *          FileExtension:'....',
     *          FileSize:'....',
     *       }
     *  }
     * ````````
     */
    ExportableLibraries = {};
//Libraries Extraction for Export
Libraries
    .forEach(Library => {
        const
            // Split the name to extract details
            SplitName = Library.split('\\'),
            // Full File Name With Extension
            FullName = SplitName[SplitName.length - 1],
            // File Extension
            Extension = FullName.split('.')[FullName.split('.').length - 1],
            // Library Name before dot
            Name = FullName.split('.')[1];
        // If It's Not Index File The Append Data to ExportableLibraries
        if (FullName.split('.')[0] !== 'index') {
            ExportableLibraries[UcFirst(Name)] = {};
            ExportableLibraries[UcFirst(Name)] = require(Library);
            ExportableLibraries[UcFirst(Name)].Details = {
                AccessName: UcFirst(Name),
                FullFileName: FullName,
                FilePath: Library,
                FileExtension: Extension,
                FileSize: (FileSystem.file_size(Library) / 1024).toFixed(2) + ' Kb'
            }
        }
    });
// Exporting the Libraries
module.exports = ExportableLibraries;