import FfmpegCommandImpl, { FfmpegCommand, FfmpegCommandLogger, FfprobeStream } from 'fluent-ffmpeg';

export class SubExtractor {
    private readonly command: FfmpegCommand;

    constructor() {
        this.command = FfmpegCommandImpl({ logger: console });
    }

    private async findSubMetadata(command: FfmpegCommand, subIdentifiers: string[]): Promise<FfprobeStream> {
        return new Promise(resolve => {
            command.ffprobe((err, metadata) => {
                if(err) {
                    console.log('err on subExtractor', err)
                    return
                }
    
                const { streams } = metadata;
                const subtitles = streams.filter(stream => stream.codec_type === 'subtitle')

                const _engSub = subtitles.find(subtitle => subIdentifiers.includes(subtitle.tags?.language));
                
                if(!_engSub) {
                    throw new Error('No eng subtitles found!')
                }

                resolve(_engSub)
            })
        })
    }

    private async extractSub(command: FfmpegCommand, subMetadata: FfprobeStream) {
        return new Promise((resolve, reject) => {
            command.on('start', (cmd) => {
                console.log('>> ffmpeg run with:\n', cmd);
            })
            command.on('codecData', function(data) {
                console.log('Input is ' + data.audio + ' audio ' +
                    'with ' + data.video + ' video');
            });
            command.on('stderr', function(stderrLine) {
                console.log('Stderr output: ' + stderrLine);
            });
            command.on('error', function(err, stdout, stderr) {
                console.log('Cannot process video: ' + err.message);
                reject();
            });
            command.on('end', function(stdout, stderr) {
                console.log('>> ffmpeg succeeded!');
                resolve();
            });

            command.outputOptions(
                '-map', `0:${subMetadata.index}`,
                `sub.${subMetadata.codec_name}`
            ).run();
        })
    }

    async execute(fileTarget: string, outputPath: string) {
        try {
            const targetCmd = this.command.input(fileTarget).output(outputPath);
    
            const engSubMeta = await this.findSubMetadata(targetCmd, ['eng', 'en']);
            console.log('>> engSub\n', engSubMeta);
    
            await this.extractSub(targetCmd, engSubMeta)
        } catch(err) {
            console.log('subExtractor err', err);
        }
    }
}
