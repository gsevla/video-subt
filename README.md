# How to?

###### only the extractor is exposed for now. 
###### the main idea behing the translator is to use in premise GPT model to translate the extracted subtitles.

## Development

#### SubExtractor

Run `npm run exec:subExtractor <path/to/file/target.mkv> <output/path>`.

It will generate a sub.<codec_name> file that contains things like 
info, styles and dialogue events.
