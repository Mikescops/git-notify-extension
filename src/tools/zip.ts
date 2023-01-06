import * as fs from 'fs';
import archiver from 'archiver';

(async () => {
    const args = process.argv.slice(2);

    const distDir = './dist';

    console.log(`Zipping ${args[0]} in ${distDir}/${args[1]}`);

    !fs.existsSync(distDir) && fs.mkdirSync(distDir);

    const output = fs.createWriteStream(`${distDir}/${args[1]}`);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive
        .directory(`./${args[0]}`, false)
        .pipe(output)
        .on('error', (error) => {
            throw error;
        });

    output.on('close', () => {
        console.log(archive.pointer() + ' total bytes');
        console.log('Archive has been finalized and the output file descriptor has closed.');
    });

    output.on('end', () => {
        console.log('Data has been drained');
    });

    archive.on('warning', (error) => {
        if (error.code === 'ENOENT') {
            console.warn(error);
        } else {
            throw error;
        }
    });

    await archive.finalize();
})();
