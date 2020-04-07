import {Buffer} from 'buffer/';
import {unzipObject, tidxSorter} from '../utils';
import {preprocess} from './preprocess';

const CHUNK_SEPARATOR = 'CHUNK>|<!';

const decoder = new TextDecoder();
const makeResponseHandlerData = (reader) => ({
    reader,
    jsonChunks: [],
    promises: [],
    isCompressed: true,
    result: {
        cachedData: {dataByGroupBy: {account_id: [], email: []}},
        schema: null
    }
});

function processChunk(chunk, data) {
    // handle the string data received from the server
    // each chunk has a type (part)
    // chunks are separated by CHUNK_SEPARATOR, so we need to get to it first before we can JSON.parse the chunk

    if (data.jsonChunks.length > 0) {
        // this is used to handle cases where the chunk separator is split between chunks
        data.jsonChunks.push(chunk);
        chunk = data.jsonChunks.join('');
        data.jsonChunks = [];
    }

    const chunkend = chunk.indexOf(CHUNK_SEPARATOR);
    if (chunkend === -1) {
        // if CHUNK_SEPARATOR was not found, save the partial chunk in the chunks array
        data.jsonChunks.push(chunk);
    }
    else {
        // if CHUNK_SEPARATOR was found, take all pervious chunks and combine them to one big chunk
        const jsonEnd = chunkend;
        data.jsonChunks.push(chunk.substring(0, jsonEnd));
        const jsonText = data.jsonChunks.join('');

        const {part, data: chunkData} = JSON.parse(jsonText);

        //add the chunk's data according to its "part" field
        switch (part) {
            case 'groupByMapping':
                data.result.cachedData.groupByMapping = chunkData;
                break;
            case 'account_id':
            case 'email':
                chunkData.forEach(base64Str => {
                    const promise = unzipObject(Buffer.from(base64Str, 'base64'))
                        .then(({items}) => data.result.cachedData.dataByGroupBy[part].push(...items));
                    data.promises.push(promise);
                });
                break;
            case 'uc-account_id':
            case 'uc-email':
                data.isCompressed = false;
                data.result.cachedData.dataByGroupBy[part.substring(3)].push(...chunkData);
                break;
            case 'schema':
                data.result.schema = chunkData;
                break;
            default:
                console.error('Unexpected chunk from server!');
                break;
        }

        data.jsonChunks = [];
        // get all the data after the chunk separator and use it again (if it has another full chunk it will be parsed, if not it will be saved)
        processChunk(chunk.substring(jsonEnd + CHUNK_SEPARATOR.length), data);
    }
}

function handleReadResult(readResult, data) {
    // parse the read result using the decoder and pass it to chunk processor
    const chunk = decoder.decode(readResult.value || new Uint8Array, {stream: !readResult.done});
    processChunk(chunk, data);

    // if this is the last chunk, wait for all process promises to resolve and return the processed result
    if (readResult.done) {
        return Promise.all(data.promises)
            .then(() => {
                data.result.shouldPreprocess = data.isCompressed;
                return data.result;
            });
    } else {
        return readChunk(data);
    }
}


function readChunk(data) {
    // converts received data to readable result and passes it on
    return data.reader.read().then(readResult => handleReadResult(readResult, data));
}

export function handleCompressedAttributionResponse(response) {
    // this function initiates the reading process
    var reader = response.body.getReader();
    const data = makeResponseHandlerData(reader);
    return readChunk(data);
}

export function preprocessDataByGroupBy(dataByGroupBy, startDateUnixTS, endDateUnixTS, sort = false) {
    if (sort) {
        Object.values(dataByGroupBy).forEach(array => array.sort(tidxSorter));
    }
    return preprocess(dataByGroupBy, startDateUnixTS, endDateUnixTS);
}