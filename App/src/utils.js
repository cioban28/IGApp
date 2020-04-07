import {getProfileSync} from 'components/utils/AuthService';
import round from 'lodash/round';
const {Readable} = require('stream');
const bs = require('binary-search');
const zlib = require('zlib');
const Buffer = require('buffer/').Buffer;

export function userPermittedToPage(page) {
  const userProfile = getProfileSync();
  if(userProfile.isAdmin) {
    return true;
  }
  else{
    const blockedPages = userProfile.app_metadata.blockedPages;
    return !blockedPages || blockedPages.findIndex(blockedPage => page === blockedPage) === -1;
  }
}

export function precisionFormat(number) {
  return round(number, 2);
}

export function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function objToGridFSStream(obj) {
  const buf = obj instanceof Buffer ? obj : Buffer.from(JSON.stringify(obj));

  const stream = new Readable();
  stream.push(buf);
  stream.push(null);
  return stream;
}

function bufferFromStream(stream) {
  return new Promise(function (resolve, reject) {
    const chunks = [];

    stream.on('data', chunks.push.bind(chunks));

    stream.on('end', () => {
      const zipped = Buffer.concat(chunks);
      resolve(zipped);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

export function unzipObject(zippedObject) {  
  const stream = objToGridFSStream(zippedObject);
  const unzipStream = zlib.createGunzip();
  stream.pipe(unzipStream);

  return bufferFromStream(unzipStream).then(buffer => {    
    return JSON.parse(buffer.toString())
  });
}

// binary search adapted for range search
export function rbs(haystack, needle, comp) {
  const res = bs(haystack, needle, comp);
  if (res > -1) {
    return res;
  }
  else if (res === -1 || Math.abs(res) > haystack.length) {
    return false;
  }
  else {
    return -2 - res;
  }
}

const sizeStrUnits = {
  GB: 1024 * 1024 * 1024,
  MB: 1024 * 1024,
  KB: 1024,
  B: 0
}
export function sizeStr(sizeInBytes) {
  let unit;
  let sizeForDisplay;

  for (const unit_ in sizeStrUnits) {
    const unitSize = sizeStrUnits[unit_];
    if (sizeInBytes >= unitSize) {
      unit = unit_;
      sizeForDisplay = sizeInBytes / (unitSize || 1);
      break;
    }
  }

  return `${sizeForDisplay.toFixed(2)} ${unit}`;
}

export const tidxSorter = (item1, item2) => item1.tidx.h - item2.tidx.h;