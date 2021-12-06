'use strict';

// This is a facet

(() => { try {

    class FsInterface {
        /** Verify permission to access the given FileSystemHandle, prompting the user if necessary
         *  @param {FileSystemHandle} file_handle
         *  @param {boolean} for_writing
         *  @return {Promise} resolves if permission granted, rejects if permission not granted
         */
        async verify_permission(file_handle, for_writing=false) {
            const options = {};
            if (for_writing) {
                options.writable = true;  // legacy
                options.mode = 'readwrite';
            }
            return ( await file_handle.queryPermission(options)   === 'granted' ||
                     await file_handle.requestPermission(options) === 'granted'    );
        }

        /** Save object as JSON to the file asscociated with FileSystemFileHandle
         *  @param {FileSystemFileHandle} file_handle
         *  @param {Object} obj
         *  @return {Promise}
         */
        async save_json(file_handle, obj) {
            await this.verify_permission(file_handle, true);
            const writable = await fileHandle.createWritable();
            const contents = JSON.stringify(obj, null, 4);
            await writable.write(contents);
            await writable.close();
        }

        /** Load JSON from the file associated with a FileSystemFileHandle
         *  @param {FileSystemFileHandle} file_handle
         *  @param {boolean} verify_for_writing verify write permissions, too (defaults to false)
         *  @return {Promise} resolves to { text: string, fs_timestamp: number }
         */
        async load_raw(file_handle, verify_for_writing=false) {
            await this.verify_permission(file_handle, verify_for_writing);
            const file = await file_handle.getFile();
            return {
                text: await file.text(),
                fs_timestamp: file.lastModified,
            };
        }

        /** Load an object that is encoded in JSON from the file associated with a FileSystemFileHandle
         *  @param {FileSystemFileHandle} file_handle
         *  @param {boolean} verify_for_writing verify write permissions, too (defaults to false)
         *  @return {Promise} resolves to { contents: object, fs_timestamp: number }
         */
        async load_json(file_handle, verify_for_writing=false) {
            const { text, fs_timestamp } = await this.load_raw(file_handle, verify_for_writing);
            return {
                contents: JSON.parse(text),
                fs_timestamp,
            };
        }

        /** Return the "last modified" timestamp for the file associated with a FileSystemFileHandle
         *  @param {FileSystemFileHandle} file_handle
         *  @return {Promise} which resolves to the "last modified" time of the file,
         *                    in milliseconds since the UNIX epoch (January 1, 1970 at Midnight UTC)
         */
        async get_fs_timestamp(file_handle) {
            await this.verify_permission(file_handle);
            const file = await file_handle.getFile();
            return file.lastModified;
        }

        /** Show a file picker for the user to select a file for saving
         *  @return {Promise} which resolves to { canceled: true }|{ file_handle: FileSystemFileHandle, fs_timestamp: number }
         */
        async prompt_for_save() {
            const options = {};
            let file_handle;
            try {
                file_handle = await window.showSaveFilePicker(options);
            } catch (err) {
                if (err instanceof AbortError) {
                    return { canceled: true };
                } else {
                    throw err;
                }
            }
            const fs_timestamp = (await file_handle.getFile()).lastModified;
            return {
                file_handle,
                fs_timestamp,
            };
        }

        /** Show a file picker for the user to select a file for loading
         *  @return {Promise} which resolves to { canceled: true }|{ file_handle: FileSystemFileHandle, fs_timestamp: number }
         */
        async prompt_for_load() {
            const options = {};
            let file_handle;
            try {
                file_handle = await window.showOpenFilePicker(options);
            } catch (err) {
                if (err instanceof AbortError) {
                    return { canceled: true };
                } else {
                    throw err;
                }
            }
            const fs_timestamp = (await file_handle.getFile()).lastModified;
            return {
                file_handle,
                fs_timestamp,
            };
        }
    }


    // === EXPORT ===

    facet_export(new FsInterface());

} catch (err) { facet_load_error(err); }})();
