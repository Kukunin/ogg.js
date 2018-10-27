(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Module=typeof Module!=="undefined"?Module:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=(function(status,toThrow){throw toThrow});Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}else{return scriptDirectory+path}}if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;ret=tryParseAsDataURI(filename);if(!ret){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename)}return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));process["on"]("unhandledRejection",abort);Module["quit"]=(function(status){process["exit"](status)});Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){var data=tryParseAsDataURI(f);if(data){return intArrayToString(data)}return read(f)}}Module["readBinary"]=function readBinary(f){var data;data=tryParseAsDataURI(f);if(data){return data}if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=(function(status){quit(status)})}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(document.currentScript){scriptDirectory=document.currentScript.src}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf("/")+1)}else{scriptDirectory=""}Module["read"]=function shell_read(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText}catch(err){var data=tryParseAsDataURI(url);if(data){return intArrayToString(data)}throw err}};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}catch(err){var data=tryParseAsDataURI(url);if(data){return data}throw err}}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}var data=tryParseAsDataURI(url);if(data){onload(data.buffer);return}onerror()};xhr.onerror=onerror;xhr.send(null)};Module["setWindowTitle"]=(function(title){document.title=title})}else{}var out=Module["print"]||(typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null);var err=Module["printErr"]||(typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||out);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var STACK_ALIGN=16;function staticAlloc(size){var ret=STATICTOP;STATICTOP=STATICTOP+size+15&-16;return ret}function dynamicAlloc(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;HEAP32[DYNAMICTOP_PTR>>2]=end;if(end>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){HEAP32[DYNAMICTOP_PTR>>2]=ret;return 0}}return ret}function alignMemory(size,factor){if(!factor)factor=STACK_ALIGN;var ret=size=Math.ceil(size/factor)*factor;return ret}function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}var jsCallStartIndex=1;var functionPointers=new Array(2);function addFunction(func,sig){var base=0;for(var i=base;i<base+2;i++){if(!functionPointers[i]){functionPointers[i]=func;return jsCallStartIndex+i}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}function removeFunction(index){functionPointers[index-jsCallStartIndex]=null}var funcWrappers={};function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}var GLOBAL_BASE=8;var ABORT=false;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}var JSfuncs={"stackSave":(function(){stackSave()}),"stackRestore":(function(){stackRestore()}),"arrayToC":(function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};function ccall(ident,returnType,argTypes,args,opts){function convertReturnValue(ret){if(returnType==="string")return Pointer_stringify(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);ret=convertReturnValue(ret);if(stack!==0)stackRestore(stack);return ret}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}var ALLOC_STATIC=2;var ALLOC_NONE=4;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return UTF8ToString(ptr)}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx){var endPtr=idx;while(u8Array[endPtr])++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}}function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function demangle(func){return func}function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,(function(x){var y=demangle(x);return x===y?x:y+" ["+x+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE,STATICTOP,staticSealed;var STACK_BASE,STACKTOP,STACK_MAX;var DYNAMIC_BASE,DYNAMICTOP_PTR;STATIC_BASE=STATICTOP=STACK_BASE=STACKTOP=STACK_MAX=DYNAMIC_BASE=DYNAMICTOP_PTR=0;staticSealed=false;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)err("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();function getTotalMemory(){return TOTAL_MEMORY}function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}var Math_abs=Math.abs;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_min=Math.min;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}STATIC_BASE=GLOBAL_BASE;STATICTOP=STATIC_BASE+9136;__ATINIT__.push();memoryInitializer="data:application/octet-stream;base64,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";var tempDoublePtr=STATICTOP;STATICTOP+=16;function ___assert_fail(condition,filename,line,func){abort("Assertion failed: "+Pointer_stringify(condition)+", at: "+[filename?Pointer_stringify(filename):"unknown filename",line,func?Pointer_stringify(func):"unknown function"])}var SYSCALLS={varargs:0,get:(function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret}),getStr:(function(){var ret=Pointer_stringify(SYSCALLS.get());return ret}),get64:(function(){var low=SYSCALLS.get(),high=SYSCALLS.get();if(low>=0)assert(high===0);else assert(high===-1);return low}),getZero:(function(){assert(SYSCALLS.get()===0)})};function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function flush_NO_FILESYSTEM(){var fflush=Module["_fflush"];if(fflush)fflush(0);var printChar=___syscall146.printChar;if(!printChar)return;var buffers=___syscall146.buffers;if(buffers[1].length)printChar(1,10);if(buffers[2].length)printChar(2,10)}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.get(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();var ret=0;if(!___syscall146.buffers){___syscall146.buffers=[null,[],[]];___syscall146.printChar=(function(stream,curr){var buffer=___syscall146.buffers[stream];assert(buffer);if(curr===0||curr===10){(stream===1?out:err)(UTF8ArrayToString(buffer,0));buffer.length=0}else{buffer.push(curr)}})}for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];for(var j=0;j<len;j++){___syscall146.printChar(stream,HEAPU8[ptr+j])}ret+=len}return ret}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}DYNAMICTOP_PTR=staticAlloc(4);STACK_BASE=STACKTOP=alignMemory(STATICTOP);STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=alignMemory(STACK_MAX);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;staticSealed=true;var ASSERTIONS=false;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){if(ASSERTIONS){assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")}chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}var decodeBase64=typeof atob==="function"?atob:(function(input){var keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{enc1=keyStr.indexOf(input.charAt(i++));enc2=keyStr.indexOf(input.charAt(i++));enc3=keyStr.indexOf(input.charAt(i++));enc4=keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!==64){output=output+String.fromCharCode(chr2)}if(enc4!==64){output=output+String.fromCharCode(chr3)}}while(i<input.length);return output});function intArrayFromBase64(s){if(typeof ENVIRONMENT_IS_NODE==="boolean"&&ENVIRONMENT_IS_NODE){var buf;try{buf=Buffer.from(s,"base64")}catch(_){buf=new Buffer(s,"base64")}return new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength)}try{var decoded=decodeBase64(s);var bytes=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;++i){bytes[i]=decoded.charCodeAt(i)}return bytes}catch(_){throw new Error("Converting base64 string to bytes failed.")}}function tryParseAsDataURI(filename){if(!isDataURI(filename)){return}return intArrayFromBase64(filename.slice(dataURIPrefix.length))}function invoke_ii(index,a1){var sp=stackSave();try{return Module["dynCall_ii"](index,a1)}catch(e){stackRestore(sp);if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function jsCall_ii(index,a1){return functionPointers[index](a1)}function invoke_iiii(index,a1,a2,a3){var sp=stackSave();try{return Module["dynCall_iiii"](index,a1,a2,a3)}catch(e){stackRestore(sp);if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function jsCall_iiii(index,a1,a2,a3){return functionPointers[index](a1,a2,a3)}function invoke_viiii(index,a1,a2,a3,a4){var sp=stackSave();try{Module["dynCall_viiii"](index,a1,a2,a3,a4)}catch(e){stackRestore(sp);if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function jsCall_viiii(index,a1,a2,a3,a4){functionPointers[index](a1,a2,a3,a4)}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"enlargeMemory":enlargeMemory,"getTotalMemory":getTotalMemory,"abortOnCannotGrowMemory":abortOnCannotGrowMemory,"invoke_ii":invoke_ii,"jsCall_ii":jsCall_ii,"invoke_iiii":invoke_iiii,"jsCall_iiii":jsCall_iiii,"invoke_viiii":invoke_viiii,"jsCall_viiii":jsCall_viiii,"___assert_fail":___assert_fail,"___setErrNo":___setErrNo,"___syscall140":___syscall140,"___syscall146":___syscall146,"___syscall6":___syscall6,"_emscripten_memcpy_big":_emscripten_memcpy_big,"flush_NO_FILESYSTEM":flush_NO_FILESYSTEM,"DYNAMICTOP_PTR":DYNAMICTOP_PTR,"tempDoublePtr":tempDoublePtr,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX};// EMSCRIPTEN_START_ASM
var asm=(/** @suppress {uselessCode} */ function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.DYNAMICTOP_PTR|0;var j=env.tempDoublePtr|0;var k=env.STACKTOP|0;var l=env.STACK_MAX|0;var m=0;var n=0;var o=0;var p=0;var q=global.NaN,r=global.Infinity;var s=0,t=0,u=0,v=0,w=0.0;var x=0;var y=global.Math.floor;var z=global.Math.abs;var A=global.Math.sqrt;var B=global.Math.pow;var C=global.Math.cos;var D=global.Math.sin;var E=global.Math.tan;var F=global.Math.acos;var G=global.Math.asin;var H=global.Math.atan;var I=global.Math.atan2;var J=global.Math.exp;var K=global.Math.log;var L=global.Math.ceil;var M=global.Math.imul;var N=global.Math.min;var O=global.Math.max;var P=global.Math.clz32;var Q=env.abort;var R=env.assert;var S=env.enlargeMemory;var T=env.getTotalMemory;var U=env.abortOnCannotGrowMemory;var V=env.invoke_ii;var W=env.jsCall_ii;var X=env.invoke_iiii;var Y=env.jsCall_iiii;var Z=env.invoke_viiii;var _=env.jsCall_viiii;var $=env.___assert_fail;var aa=env.___setErrNo;var ba=env.___syscall140;var ca=env.___syscall146;var da=env.___syscall6;var ea=env._emscripten_memcpy_big;var fa=env.flush_NO_FILESYSTEM;var ga=0.0;
// EMSCRIPTEN_START_FUNCS
function ka(a){a=a|0;var b=0;b=k;k=k+a|0;k=k+15&-16;return b|0}function la(){return k|0}function ma(a){a=a|0;k=a}function na(a,b){a=a|0;b=b|0;k=a;l=b}function oa(a,b){a=a|0;b=b|0;if(!m){m=a;n=b}}function pa(a){a=a|0;x=a}function qa(){return x|0}function ra(){var a=0,b=0;a=La(1,56)|0;b=La(1,28)|0;c[a>>2]=b;if(Ba(b)|0)$(8336,8363,19,8373);if((Ga(b,a+4|0)|0)==1)$(8383,8363,20,8373);else return a|0;return 0}function sa(a,b){a=a|0;b=b|0;return Da(c[a>>2]|0,b)|0}function ta(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;if(Ea(c[a>>2]|0,b)|0)$(8429,8363,30,8465);i=a+4|0;j=a+20|0;k=a+24|0;l=a+28|0;b=a+36|0;e=a+40|0;f=c[2052]|0;a:while(1){switch(Ga(c[a>>2]|0,i)|0){case -1:{m=17;break a}case 1:break;default:{m=18;break a}}g=wa(i)|0;if(va(i)|0){h=c[j>>2]|0;if(h|0)ya(h)|0;h=La(1,360)|0;c[j>>2]=h;if(xa(h,g)|0){m=9;break}}if(Ha(c[j>>2]|0,i)|0){m=12;break}b:while(1){switch(Ia(c[j>>2]|0,k)|0){case -1:{m=15;break b}case 1:break;default:break b}ja[d&3](c[k>>2]|0,c[l>>2]|0,c[b>>2]|0,c[e>>2]|0)}if((m|0)==15){m=0;$a(8557,26,1,f)|0}}if((m|0)==9)$(8475,8363,42,8465);else if((m|0)==12)$(8513,8363,45,8465);else if((m|0)==17){$a(8584,24,1,f)|0;return 0}else if((m|0)==18)return 0;return 0}function ua(a){a=a|0;var b=0;Ca(c[a>>2]|0)|0;b=c[a+20>>2]|0;if(!b){Ka(a);return}ya(b)|0;Ka(a);return}function va(b){b=b|0;return a[(c[b>>2]|0)+5>>0]&2|0}function wa(a){a=a|0;a=c[a>>2]|0;return (d[a+15>>0]|0)<<8|(d[a+14>>0]|0)|(d[a+16>>0]|0)<<16|(d[a+17>>0]|0)<<24|0}function xa(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;if(!a){a=-1;return a|0}fb(a+8|0,0,352)|0;c[a+4>>2]=16384;c[a+24>>2]=1024;d=Ja(16384)|0;c[a>>2]=d;g=Ja(4096)|0;e=a+16|0;c[e>>2]=g;f=Ja(8192)|0;h=a+20|0;c[h>>2]=f;do if(!d){d=g;b=g}else{if((f|0)==0|(g|0)==0){Ka(d);b=c[e>>2]|0;d=b;break}c[a+336>>2]=b;a=0;return a|0}while(0);if(d|0)Ka(b);b=c[h>>2]|0;if(b|0)Ka(b);fb(a|0,0,360)|0;a=-1;return a|0}function ya(a){a=a|0;var b=0;if(!a)return 0;b=c[a>>2]|0;if(b|0)Ka(b);b=c[a+16>>2]|0;if(b|0)Ka(b);b=c[a+20>>2]|0;if(b|0)Ka(b);Ka(a);return 0}function za(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if((e|0)>7){h=~e;h=((h|0)>-16?h:-16)+e+8&-8;i=h+8|0;g=e+-8|0;f=b;while(1){j=((d[f+1>>0]|0)<<16|(d[f>>0]|0)<<24|(d[f+2>>0]|0)<<8|(d[f+3>>0]|0))^a;a=c[6160+((j>>>16&255)<<2)>>2]^c[7184+(j>>>24<<2)>>2]^c[5136+((j>>>8&255)<<2)>>2]^c[4112+((j&255)<<2)>>2]^c[3088+((d[f+4>>0]|0)<<2)>>2]^c[2064+((d[f+5>>0]|0)<<2)>>2]^c[1040+((d[f+6>>0]|0)<<2)>>2]^c[16+((d[f+7>>0]|0)<<2)>>2];if((e|0)<=15)break;else{f=f+8|0;e=e+-8|0}}e=g-h|0;b=b+i|0}if(!e){j=a;return j|0}while(1){e=e+-1|0;a=c[16+((a>>>24^(d[b>>0]|0))<<2)>>2]^a<<8;if(!e)break;else b=b+1|0}return a|0}function Aa(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;f=a+24|0;d=c[f>>2]|0;if((d-b|0)>(c[a+28>>2]|0)){a=0;return a|0}if((d|0)>(2147483647-b|0)){b=c[a>>2]|0;if(b|0)Ka(b);b=c[a+16>>2]|0;if(b|0)Ka(b);b=c[a+20>>2]|0;if(b|0)Ka(b);fb(a|0,0,360)|0;a=-1;return a|0}d=d+b|0;d=(d|0)<2147483615?d+32|0:d;g=a+16|0;b=Ma(c[g>>2]|0,d<<2)|0;if(!b){b=c[a>>2]|0;if(b|0)Ka(b);b=c[g>>2]|0;if(b|0)Ka(b);b=c[a+20>>2]|0;if(b|0)Ka(b);fb(a|0,0,360)|0;a=-1;return a|0}c[g>>2]=b;e=a+20|0;b=Ma(c[e>>2]|0,d<<3)|0;if(b|0){c[e>>2]=b;c[f>>2]=d;a=0;return a|0}b=c[a>>2]|0;if(b|0)Ka(b);b=c[g>>2]|0;if(b|0)Ka(b);b=c[e>>2]|0;if(b|0)Ka(b);fb(a|0,0,360)|0;a=-1;return a|0}function Ba(a){a=a|0;if(!a)return 0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;return 0}function Ca(a){a=a|0;var b=0;if(!a)return 0;b=c[a>>2]|0;if(b|0)Ka(b);Ka(a);return 0}function Da(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;h=a+4|0;d=c[h>>2]|0;if((d|0)<=-1){a=0;return a|0}g=a+12|0;e=c[g>>2]|0;i=a+8|0;if(!e)e=d;else{f=(c[i>>2]|0)-e|0;c[i>>2]=f;if((f|0)>0){d=c[a>>2]|0;eb(d|0,d+e|0,f|0)|0;d=c[h>>2]|0}c[g>>2]=0;e=d}d=c[i>>2]|0;do if((e-d|0)<(b|0)){f=b+4096+d|0;d=c[a>>2]|0;if(!d)e=Ja(f)|0;else e=Ma(d,f)|0;if(e|0){c[a>>2]=e;c[h>>2]=f;d=c[i>>2]|0;break}d=c[a>>2]|0;if(d|0)Ka(d);c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;a=0;return a|0}else e=c[a>>2]|0;while(0);a=e+d|0;return a|0}function Ea(a,b){a=a|0;b=b|0;var d=0,e=0;e=c[a+4>>2]|0;if((e|0)<=-1){e=-1;return e|0}d=a+8|0;a=(c[d>>2]|0)+b|0;if((a|0)>(e|0)){e=-1;return e|0}c[d>>2]=a;e=0;return e|0}function Fa(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0;q=k;k=k+16|0;m=q;h=c[b>>2]|0;p=b+12|0;l=c[p>>2]|0;n=h+l|0;i=c[b+8>>2]|0;l=i-l|0;g=h;if((c[b+4>>2]|0)<=-1){p=0;k=q;return p|0}o=b+20|0;f=c[o>>2]|0;if(!f){if((l|0)<27){p=0;k=q;return p|0}if(Va(n,8609,4)|0){c[o>>2]=0;c[b+24>>2]=0;o=Ya(n+1|0,79,l+-1|0)|0;o=(o|0)==0?h+i|0:o;c[p>>2]=o-g;p=n-o|0;k=q;return p|0}j=n+26|0;g=a[j>>0]|0;f=(g&255)+27|0;if((l|0)<(f|0)){p=0;k=q;return p|0}if(g<<24>>24){h=b+24|0;g=0;i=c[h>>2]|0;do{i=i+(d[n+(g+27)>>0]|0)|0;c[h>>2]=i;g=g+1|0}while(g>>>0<(d[j>>0]|0)>>>0)}c[o>>2]=f}i=b+24|0;if((f+(c[i>>2]|0)|0)>(l|0)){p=0;k=q;return p|0}f=n+22|0;g=d[f>>0]|d[f+1>>0]<<8|d[f+2>>0]<<16|d[f+3>>0]<<24;c[m>>2]=g;a[f>>0]=0;a[f+1>>0]=0;a[f+2>>0]=0;a[f+3>>0]=0;j=c[o>>2]|0;l=c[i>>2]|0;a[f>>0]=0;a[f+1>>0]=0;a[f+2>>0]=0;a[f+3>>0]=0;l=za(za(0,n,j)|0,n+j|0,l)|0;a[f>>0]=l;a[n+23>>0]=l>>>8;a[n+24>>0]=l>>>16;a[n+25>>0]=l>>>24;if(Va(m,f,4)|0){a[f>>0]=g;a[f+1>>0]=g>>8;a[f+2>>0]=g>>16;a[f+3>>0]=g>>24}h=c[p>>2]|0;f=(c[b>>2]|0)+h|0;if(!e){f=c[o>>2]|0;g=c[i>>2]|0}else{c[e>>2]=f;n=c[o>>2]|0;c[e+4>>2]=n;c[e+8>>2]=f+n;g=c[i>>2]|0;c[e+12>>2]=g;f=n}c[b+16>>2]=0;b=g+f|0;c[p>>2]=b+h;c[o>>2]=0;c[i>>2]=0;p=b;k=q;return p|0}function Ga(a,b){a=a|0;b=b|0;var d=0,e=0;a:do if((c[a+4>>2]|0)>-1){d=Fa(a,b)|0;if((d|0)>0)d=1;else{e=a+16|0;while(1){if(!d){d=0;break a}if(!(c[e>>2]|0))break;d=Fa(a,b)|0;if((d|0)>0){d=1;break a}}c[e>>2]=1;d=-1}}else d=0;while(0);return d|0}function Ha(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0;v=c[e>>2]|0;g=c[e+8>>2]|0;e=c[e+12>>2]|0;n=a[v+4>>0]|0;u=a[v+5>>0]|0;p=u&1;q=u&2;u=u&4;y=bb(d[v+13>>0]|0|0,0,8)|0;y=bb(y|(d[v+12>>0]|0)|0,x|0,8)|0;y=bb(y|(d[v+11>>0]|0)|0,x|0,8)|0;y=bb(y|(d[v+10>>0]|0)|0,x|0,8)|0;y=bb(y|(d[v+9>>0]|0)|0,x|0,8)|0;y=bb(y|(d[v+8>>0]|0)|0,x|0,8)|0;y=bb(y|(d[v+7>>0]|0)|0,x|0,8)|0;w=x;y=y|(d[v+6>>0]|0);m=(d[v+15>>0]|0)<<8|(d[v+14>>0]|0)|(d[v+16>>0]|0)<<16|(d[v+17>>0]|0)<<24;z=(d[v+19>>0]|0)<<8|(d[v+18>>0]|0)|(d[v+20>>0]|0)<<16|(d[v+21>>0]|0)<<24;r=a[v+26>>0]|0;t=r&255;if(!b){b=-1;return b|0}f=c[b>>2]|0;if(!f){b=-1;return b|0}k=b+36|0;l=c[k>>2]|0;h=b+12|0;i=c[h>>2]|0;if(i|0){s=b+8|0;j=(c[s>>2]|0)-i|0;c[s>>2]=j;if(j|0)eb(f|0,f+i|0,j|0)|0;c[h>>2]=0}if(l|0){h=b+28|0;f=(c[h>>2]|0)-l|0;if(!f)f=0;else{s=c[b+16>>2]|0;eb(s|0,s+(l<<2)|0,f<<2|0)|0;f=c[b+20>>2]|0;eb(f|0,f+(l<<3)|0,(c[h>>2]|0)-l<<3|0)|0;f=(c[h>>2]|0)-l|0}c[h>>2]=f;s=b+32|0;c[s>>2]=(c[s>>2]|0)-l;c[k>>2]=0}if(n<<24>>24?1:(m|0)!=(c[b+336>>2]|0)){b=-1;return b|0}if(Aa(b,t+1|0)|0){b=-1;return b|0}s=b+340|0;h=c[s>>2]|0;if((z|0)!=(h|0)){i=b+32|0;j=c[i>>2]|0;k=b+28|0;l=c[k>>2]|0;if((j|0)<(l|0)){m=c[b+16>>2]|0;n=b+8|0;f=j;o=c[n>>2]|0;do{o=o-(c[m+(f<<2)>>2]&255)|0;f=f+1|0}while((f|0)<(l|0));c[n>>2]=o}c[k>>2]=j;if((h|0)!=-1){n=c[b+16>>2]|0;o=j+1|0;c[k>>2]=o;c[n+(j<<2)>>2]=1024;c[i>>2]=o}}a:do if(p<<24>>24){f=c[b+28>>2]|0;if((f|0)>=1?(p=c[(c[b+16>>2]|0)+(f+-1<<2)>>2]|0,!((p|0)==1024|(p&255|0)!=255)):0){n=q;f=0;break}if(!(r<<24>>24)){n=0;f=0}else{f=0;while(1){r=a[v+(f+27)>>0]|0;q=r&255;g=g+q|0;e=e-q|0;r=r<<24>>24==-1;f=f+((r^1)&1)|0;if(!r){n=0;break a}f=f+1|0;if((f|0)>=(t|0)){n=0;break}}}}else{n=q;f=0}while(0);if(e|0){j=b+4|0;i=c[j>>2]|0;k=b+8|0;h=c[k>>2]|0;do if((i-e|0)>(h|0))i=c[b>>2]|0;else{if((i|0)>(2147483647-e|0)){e=c[b>>2]|0;if(e|0)Ka(e);e=c[b+16>>2]|0;if(e|0)Ka(e);e=c[b+20>>2]|0;if(e|0)Ka(e);fb(b|0,0,360)|0;b=-1;return b|0}i=i+e|0;i=(i|0)<2147482623?i+1024|0:i;h=Ma(c[b>>2]|0,i)|0;if(h|0){c[j>>2]=i;c[b>>2]=h;i=h;h=c[k>>2]|0;break}e=c[b>>2]|0;if(e|0)Ka(e);e=c[b+16>>2]|0;if(e|0)Ka(e);e=c[b+20>>2]|0;if(e|0)Ka(e);fb(b|0,0,360)|0;b=-1;return b|0}while(0);db(i+h|0,g|0,e|0)|0;c[k>>2]=(c[k>>2]|0)+e}if((f|0)<(t|0)){j=b+28|0;k=b+32|0;i=a[v+(f+27)>>0]|0;g=i&255;l=c[b+16>>2]|0;e=c[j>>2]|0;h=l+(e<<2)|0;c[h>>2]=g;m=c[b+20>>2]|0;r=m+(e<<3)|0;c[r>>2]=-1;c[r+4>>2]=-1;if(n|0)c[h>>2]=g|256;g=e+1|0;c[j>>2]=g;h=f+1|0;if(i<<24>>24==-1)e=-1;else c[k>>2]=g;if((h|0)!=(t|0))do{r=a[v+(h+27)>>0]|0;c[l+(g<<2)>>2]=r&255;f=m+(g<<3)|0;c[f>>2]=-1;c[f+4>>2]=-1;f=g;g=g+1|0;c[j>>2]=g;h=h+1|0;if(r<<24>>24!=-1){c[k>>2]=g;e=f}}while((h|0)!=(t|0));if((e|0)!=-1){v=(c[b+20>>2]|0)+(e<<3)|0;c[v>>2]=y;c[v+4>>2]=w}}if(u<<24>>24?(c[b+328>>2]=1,A=c[b+28>>2]|0,(A|0)>0):0){b=(c[b+16>>2]|0)+(A+-1<<2)|0;c[b>>2]=c[b>>2]|512}c[s>>2]=z+1;b=0;return b|0}function Ia(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;if(!a){l=0;return l|0}j=c[a>>2]|0;if(!j){l=0;return l|0}l=a+36|0;e=c[l>>2]|0;if((c[a+32>>2]|0)<=(e|0)){l=0;return l|0}h=c[a+16>>2]|0;d=c[h+(e<<2)>>2]|0;if(d&1024|0){c[l>>2]=e+1;l=a+344|0;a=l;a=cb(c[a>>2]|0,c[a+4>>2]|0,1,0)|0;c[l>>2]=a;c[l+4>>2]=x;l=-1;return l|0}k=(b|0)==0;f=d&255;g=d&512;i=d&256;if((f|0)==255){d=g;f=255;do{e=e+1|0;m=c[h+(e<<2)>>2]|0;g=m&255;d=(m&512|0)==0?d:512;f=g+f|0}while((g|0)==255);h=e}else{h=e;d=g}if(k){e=a+344|0;d=a+12|0}else{c[b+12>>2]=d;c[b+8>>2]=i;d=a+12|0;c[b>>2]=j+(c[d>>2]|0);e=a+344|0;j=e;m=c[j+4>>2]|0;k=b+24|0;c[k>>2]=c[j>>2];c[k+4>>2]=m;k=(c[a+20>>2]|0)+(h<<3)|0;a=c[k+4>>2]|0;m=b+16|0;c[m>>2]=c[k>>2];c[m+4>>2]=a;c[b+4>>2]=f}c[d>>2]=(c[d>>2]|0)+f;c[l>>2]=h+1;l=e;l=cb(c[l>>2]|0,c[l+4>>2]|0,1,0)|0;m=e;c[m>>2]=l;c[m+4>>2]=x;m=1;return m|0}function Ja(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;x=k;k=k+16|0;o=x;do if(a>>>0<245){l=a>>>0<11?16:a+11&-8;a=l>>>3;n=c[2156]|0;d=n>>>a;if(d&3|0){b=(d&1^1)+a|0;a=8664+(b<<1<<2)|0;d=a+8|0;e=c[d>>2]|0;f=e+8|0;g=c[f>>2]|0;if((g|0)==(a|0))c[2156]=n&~(1<<b);else{c[g+12>>2]=a;c[d>>2]=g}w=b<<3;c[e+4>>2]=w|3;w=e+w+4|0;c[w>>2]=c[w>>2]|1;w=f;k=x;return w|0}m=c[2158]|0;if(l>>>0>m>>>0){if(d|0){b=2<<a;b=d<<a&(b|0-b);b=(b&0-b)+-1|0;i=b>>>12&16;b=b>>>i;d=b>>>5&8;b=b>>>d;g=b>>>2&4;b=b>>>g;a=b>>>1&2;b=b>>>a;e=b>>>1&1;e=(d|i|g|a|e)+(b>>>e)|0;b=8664+(e<<1<<2)|0;a=b+8|0;g=c[a>>2]|0;i=g+8|0;d=c[i>>2]|0;if((d|0)==(b|0)){a=n&~(1<<e);c[2156]=a}else{c[d+12>>2]=b;c[a>>2]=d;a=n}w=e<<3;h=w-l|0;c[g+4>>2]=l|3;f=g+l|0;c[f+4>>2]=h|1;c[g+w>>2]=h;if(m|0){e=c[2161]|0;b=m>>>3;d=8664+(b<<1<<2)|0;b=1<<b;if(!(a&b)){c[2156]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=e;c[b+12>>2]=e;c[e+8>>2]=b;c[e+12>>2]=d}c[2158]=h;c[2161]=f;w=i;k=x;return w|0}g=c[2157]|0;if(g){d=(g&0-g)+-1|0;f=d>>>12&16;d=d>>>f;e=d>>>5&8;d=d>>>e;h=d>>>2&4;d=d>>>h;i=d>>>1&2;d=d>>>i;j=d>>>1&1;j=c[8928+((e|f|h|i|j)+(d>>>j)<<2)>>2]|0;d=j;i=j;j=(c[j+4>>2]&-8)-l|0;while(1){a=c[d+16>>2]|0;if(!a){a=c[d+20>>2]|0;if(!a)break}h=(c[a+4>>2]&-8)-l|0;f=h>>>0<j>>>0;d=a;i=f?a:i;j=f?h:j}h=i+l|0;if(h>>>0>i>>>0){f=c[i+24>>2]|0;b=c[i+12>>2]|0;do if((b|0)==(i|0)){a=i+20|0;b=c[a>>2]|0;if(!b){a=i+16|0;b=c[a>>2]|0;if(!b){d=0;break}}while(1){e=b+20|0;d=c[e>>2]|0;if(!d){e=b+16|0;d=c[e>>2]|0;if(!d)break;else{b=d;a=e}}else{b=d;a=e}}c[a>>2]=0;d=b}else{d=c[i+8>>2]|0;c[d+12>>2]=b;c[b+8>>2]=d;d=b}while(0);do if(f|0){b=c[i+28>>2]|0;a=8928+(b<<2)|0;if((i|0)==(c[a>>2]|0)){c[a>>2]=d;if(!d){c[2157]=g&~(1<<b);break}}else{w=f+16|0;c[((c[w>>2]|0)==(i|0)?w:f+20|0)>>2]=d;if(!d)break}c[d+24>>2]=f;b=c[i+16>>2]|0;if(b|0){c[d+16>>2]=b;c[b+24>>2]=d}b=c[i+20>>2]|0;if(b|0){c[d+20>>2]=b;c[b+24>>2]=d}}while(0);if(j>>>0<16){w=j+l|0;c[i+4>>2]=w|3;w=i+w+4|0;c[w>>2]=c[w>>2]|1}else{c[i+4>>2]=l|3;c[h+4>>2]=j|1;c[h+j>>2]=j;if(m|0){e=c[2161]|0;b=m>>>3;d=8664+(b<<1<<2)|0;b=1<<b;if(!(b&n)){c[2156]=b|n;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=e;c[b+12>>2]=e;c[e+8>>2]=b;c[e+12>>2]=d}c[2158]=j;c[2161]=h}w=i+8|0;k=x;return w|0}else n=l}else n=l}else n=l}else if(a>>>0<=4294967231){a=a+11|0;l=a&-8;e=c[2157]|0;if(e){f=0-l|0;a=a>>>8;if(a)if(l>>>0>16777215)j=31;else{n=(a+1048320|0)>>>16&8;r=a<<n;i=(r+520192|0)>>>16&4;r=r<<i;j=(r+245760|0)>>>16&2;j=14-(i|n|j)+(r<<j>>>15)|0;j=l>>>(j+7|0)&1|j<<1}else j=0;d=c[8928+(j<<2)>>2]|0;a:do if(!d){d=0;a=0;r=61}else{a=0;i=l<<((j|0)==31?0:25-(j>>>1)|0);g=0;while(1){h=(c[d+4>>2]&-8)-l|0;if(h>>>0<f>>>0)if(!h){a=d;f=0;r=65;break a}else{a=d;f=h}r=c[d+20>>2]|0;d=c[d+16+(i>>>31<<2)>>2]|0;g=(r|0)==0|(r|0)==(d|0)?g:r;if(!d){d=g;r=61;break}else i=i<<1}}while(0);if((r|0)==61){if((d|0)==0&(a|0)==0){a=2<<j;a=(a|0-a)&e;if(!a){n=l;break}n=(a&0-a)+-1|0;h=n>>>12&16;n=n>>>h;g=n>>>5&8;n=n>>>g;i=n>>>2&4;n=n>>>i;j=n>>>1&2;n=n>>>j;d=n>>>1&1;a=0;d=c[8928+((g|h|i|j|d)+(n>>>d)<<2)>>2]|0}if(!d){i=a;h=f}else r=65}if((r|0)==65){g=d;while(1){n=(c[g+4>>2]&-8)-l|0;d=n>>>0<f>>>0;f=d?n:f;a=d?g:a;d=c[g+16>>2]|0;if(!d)d=c[g+20>>2]|0;if(!d){i=a;h=f;break}else g=d}}if(((i|0)!=0?h>>>0<((c[2158]|0)-l|0)>>>0:0)?(m=i+l|0,m>>>0>i>>>0):0){g=c[i+24>>2]|0;b=c[i+12>>2]|0;do if((b|0)==(i|0)){a=i+20|0;b=c[a>>2]|0;if(!b){a=i+16|0;b=c[a>>2]|0;if(!b){b=0;break}}while(1){f=b+20|0;d=c[f>>2]|0;if(!d){f=b+16|0;d=c[f>>2]|0;if(!d)break;else{b=d;a=f}}else{b=d;a=f}}c[a>>2]=0}else{w=c[i+8>>2]|0;c[w+12>>2]=b;c[b+8>>2]=w}while(0);do if(g){a=c[i+28>>2]|0;d=8928+(a<<2)|0;if((i|0)==(c[d>>2]|0)){c[d>>2]=b;if(!b){e=e&~(1<<a);c[2157]=e;break}}else{w=g+16|0;c[((c[w>>2]|0)==(i|0)?w:g+20|0)>>2]=b;if(!b)break}c[b+24>>2]=g;a=c[i+16>>2]|0;if(a|0){c[b+16>>2]=a;c[a+24>>2]=b}a=c[i+20>>2]|0;if(a){c[b+20>>2]=a;c[a+24>>2]=b}}while(0);b:do if(h>>>0<16){w=h+l|0;c[i+4>>2]=w|3;w=i+w+4|0;c[w>>2]=c[w>>2]|1}else{c[i+4>>2]=l|3;c[m+4>>2]=h|1;c[m+h>>2]=h;b=h>>>3;if(h>>>0<256){d=8664+(b<<1<<2)|0;a=c[2156]|0;b=1<<b;if(!(a&b)){c[2156]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=m;c[b+12>>2]=m;c[m+8>>2]=b;c[m+12>>2]=d;break}b=h>>>8;if(b)if(h>>>0>16777215)d=31;else{v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;d=(w+245760|0)>>>16&2;d=14-(u|v|d)+(w<<d>>>15)|0;d=h>>>(d+7|0)&1|d<<1}else d=0;b=8928+(d<<2)|0;c[m+28>>2]=d;a=m+16|0;c[a+4>>2]=0;c[a>>2]=0;a=1<<d;if(!(e&a)){c[2157]=e|a;c[b>>2]=m;c[m+24>>2]=b;c[m+12>>2]=m;c[m+8>>2]=m;break}b=c[b>>2]|0;c:do if((c[b+4>>2]&-8|0)!=(h|0)){e=h<<((d|0)==31?0:25-(d>>>1)|0);while(1){d=b+16+(e>>>31<<2)|0;a=c[d>>2]|0;if(!a)break;if((c[a+4>>2]&-8|0)==(h|0)){b=a;break c}else{e=e<<1;b=a}}c[d>>2]=m;c[m+24>>2]=b;c[m+12>>2]=m;c[m+8>>2]=m;break b}while(0);v=b+8|0;w=c[v>>2]|0;c[w+12>>2]=m;c[v>>2]=m;c[m+8>>2]=w;c[m+12>>2]=b;c[m+24>>2]=0}while(0);w=i+8|0;k=x;return w|0}else n=l}else n=l}else n=-1;while(0);d=c[2158]|0;if(d>>>0>=n>>>0){b=d-n|0;a=c[2161]|0;if(b>>>0>15){w=a+n|0;c[2161]=w;c[2158]=b;c[w+4>>2]=b|1;c[a+d>>2]=b;c[a+4>>2]=n|3}else{c[2158]=0;c[2161]=0;c[a+4>>2]=d|3;w=a+d+4|0;c[w>>2]=c[w>>2]|1}w=a+8|0;k=x;return w|0}h=c[2159]|0;if(h>>>0>n>>>0){u=h-n|0;c[2159]=u;w=c[2162]|0;v=w+n|0;c[2162]=v;c[v+4>>2]=u|1;c[w+4>>2]=n|3;w=w+8|0;k=x;return w|0}if(!(c[2274]|0)){c[2276]=4096;c[2275]=4096;c[2277]=-1;c[2278]=-1;c[2279]=0;c[2267]=0;c[2274]=o&-16^1431655768;a=4096}else a=c[2276]|0;i=n+48|0;j=n+47|0;g=a+j|0;f=0-a|0;l=g&f;if(l>>>0<=n>>>0){w=0;k=x;return w|0}a=c[2266]|0;if(a|0?(m=c[2264]|0,o=m+l|0,o>>>0<=m>>>0|o>>>0>a>>>0):0){w=0;k=x;return w|0}d:do if(!(c[2267]&4)){d=c[2162]|0;e:do if(d){e=9072;while(1){o=c[e>>2]|0;if(o>>>0<=d>>>0?(o+(c[e+4>>2]|0)|0)>>>0>d>>>0:0)break;a=c[e+8>>2]|0;if(!a){r=128;break e}else e=a}b=g-h&f;if(b>>>0<2147483647){a=gb(b|0)|0;if((a|0)==((c[e>>2]|0)+(c[e+4>>2]|0)|0)){if((a|0)!=(-1|0)){h=b;g=a;r=145;break d}}else{e=a;r=136}}else b=0}else r=128;while(0);do if((r|0)==128){d=gb(0)|0;if((d|0)!=(-1|0)?(b=d,p=c[2275]|0,q=p+-1|0,b=((q&b|0)==0?0:(q+b&0-p)-b|0)+l|0,p=c[2264]|0,q=b+p|0,b>>>0>n>>>0&b>>>0<2147483647):0){o=c[2266]|0;if(o|0?q>>>0<=p>>>0|q>>>0>o>>>0:0){b=0;break}a=gb(b|0)|0;if((a|0)==(d|0)){h=b;g=d;r=145;break d}else{e=a;r=136}}else b=0}while(0);do if((r|0)==136){d=0-b|0;if(!(i>>>0>b>>>0&(b>>>0<2147483647&(e|0)!=(-1|0))))if((e|0)==(-1|0)){b=0;break}else{h=b;g=e;r=145;break d}a=c[2276]|0;a=j-b+a&0-a;if(a>>>0>=2147483647){h=b;g=e;r=145;break d}if((gb(a|0)|0)==(-1|0)){gb(d|0)|0;b=0;break}else{h=a+b|0;g=e;r=145;break d}}while(0);c[2267]=c[2267]|4;r=143}else{b=0;r=143}while(0);if(((r|0)==143?l>>>0<2147483647:0)?(u=gb(l|0)|0,q=gb(0)|0,s=q-u|0,t=s>>>0>(n+40|0)>>>0,!((u|0)==(-1|0)|t^1|u>>>0<q>>>0&((u|0)!=(-1|0)&(q|0)!=(-1|0))^1)):0){h=t?s:b;g=u;r=145}if((r|0)==145){b=(c[2264]|0)+h|0;c[2264]=b;if(b>>>0>(c[2265]|0)>>>0)c[2265]=b;j=c[2162]|0;f:do if(j){b=9072;while(1){a=c[b>>2]|0;d=c[b+4>>2]|0;if((g|0)==(a+d|0)){r=154;break}e=c[b+8>>2]|0;if(!e)break;else b=e}if(((r|0)==154?(v=b+4|0,(c[b+12>>2]&8|0)==0):0)?g>>>0>j>>>0&a>>>0<=j>>>0:0){c[v>>2]=d+h;w=(c[2159]|0)+h|0;u=j+8|0;u=(u&7|0)==0?0:0-u&7;v=j+u|0;u=w-u|0;c[2162]=v;c[2159]=u;c[v+4>>2]=u|1;c[j+w+4>>2]=40;c[2163]=c[2278];break}if(g>>>0<(c[2160]|0)>>>0)c[2160]=g;d=g+h|0;b=9072;while(1){if((c[b>>2]|0)==(d|0)){r=162;break}a=c[b+8>>2]|0;if(!a)break;else b=a}if((r|0)==162?(c[b+12>>2]&8|0)==0:0){c[b>>2]=g;m=b+4|0;c[m>>2]=(c[m>>2]|0)+h;m=g+8|0;m=g+((m&7|0)==0?0:0-m&7)|0;b=d+8|0;b=d+((b&7|0)==0?0:0-b&7)|0;l=m+n|0;i=b-m-n|0;c[m+4>>2]=n|3;g:do if((j|0)==(b|0)){w=(c[2159]|0)+i|0;c[2159]=w;c[2162]=l;c[l+4>>2]=w|1}else{if((c[2161]|0)==(b|0)){w=(c[2158]|0)+i|0;c[2158]=w;c[2161]=l;c[l+4>>2]=w|1;c[l+w>>2]=w;break}a=c[b+4>>2]|0;if((a&3|0)==1){h=a&-8;e=a>>>3;h:do if(a>>>0<256){a=c[b+8>>2]|0;d=c[b+12>>2]|0;if((d|0)==(a|0)){c[2156]=c[2156]&~(1<<e);break}else{c[a+12>>2]=d;c[d+8>>2]=a;break}}else{g=c[b+24>>2]|0;a=c[b+12>>2]|0;do if((a|0)==(b|0)){d=b+16|0;e=d+4|0;a=c[e>>2]|0;if(!a){a=c[d>>2]|0;if(!a){a=0;break}}else d=e;while(1){f=a+20|0;e=c[f>>2]|0;if(!e){f=a+16|0;e=c[f>>2]|0;if(!e)break;else{a=e;d=f}}else{a=e;d=f}}c[d>>2]=0}else{w=c[b+8>>2]|0;c[w+12>>2]=a;c[a+8>>2]=w}while(0);if(!g)break;d=c[b+28>>2]|0;e=8928+(d<<2)|0;do if((c[e>>2]|0)!=(b|0)){w=g+16|0;c[((c[w>>2]|0)==(b|0)?w:g+20|0)>>2]=a;if(!a)break h}else{c[e>>2]=a;if(a|0)break;c[2157]=c[2157]&~(1<<d);break h}while(0);c[a+24>>2]=g;d=b+16|0;e=c[d>>2]|0;if(e|0){c[a+16>>2]=e;c[e+24>>2]=a}d=c[d+4>>2]|0;if(!d)break;c[a+20>>2]=d;c[d+24>>2]=a}while(0);b=b+h|0;f=h+i|0}else f=i;b=b+4|0;c[b>>2]=c[b>>2]&-2;c[l+4>>2]=f|1;c[l+f>>2]=f;b=f>>>3;if(f>>>0<256){d=8664+(b<<1<<2)|0;a=c[2156]|0;b=1<<b;if(!(a&b)){c[2156]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=l;c[b+12>>2]=l;c[l+8>>2]=b;c[l+12>>2]=d;break}b=f>>>8;do if(!b)e=0;else{if(f>>>0>16777215){e=31;break}v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;e=(w+245760|0)>>>16&2;e=14-(u|v|e)+(w<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}while(0);b=8928+(e<<2)|0;c[l+28>>2]=e;a=l+16|0;c[a+4>>2]=0;c[a>>2]=0;a=c[2157]|0;d=1<<e;if(!(a&d)){c[2157]=a|d;c[b>>2]=l;c[l+24>>2]=b;c[l+12>>2]=l;c[l+8>>2]=l;break}b=c[b>>2]|0;i:do if((c[b+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=b+16+(e>>>31<<2)|0;a=c[d>>2]|0;if(!a)break;if((c[a+4>>2]&-8|0)==(f|0)){b=a;break i}else{e=e<<1;b=a}}c[d>>2]=l;c[l+24>>2]=b;c[l+12>>2]=l;c[l+8>>2]=l;break g}while(0);v=b+8|0;w=c[v>>2]|0;c[w+12>>2]=l;c[v>>2]=l;c[l+8>>2]=w;c[l+12>>2]=b;c[l+24>>2]=0}while(0);w=m+8|0;k=x;return w|0}b=9072;while(1){a=c[b>>2]|0;if(a>>>0<=j>>>0?(w=a+(c[b+4>>2]|0)|0,w>>>0>j>>>0):0)break;b=c[b+8>>2]|0}f=w+-47|0;a=f+8|0;a=f+((a&7|0)==0?0:0-a&7)|0;f=j+16|0;a=a>>>0<f>>>0?j:a;b=a+8|0;d=h+-40|0;u=g+8|0;u=(u&7|0)==0?0:0-u&7;v=g+u|0;u=d-u|0;c[2162]=v;c[2159]=u;c[v+4>>2]=u|1;c[g+d+4>>2]=40;c[2163]=c[2278];d=a+4|0;c[d>>2]=27;c[b>>2]=c[2268];c[b+4>>2]=c[2269];c[b+8>>2]=c[2270];c[b+12>>2]=c[2271];c[2268]=g;c[2269]=h;c[2271]=0;c[2270]=b;b=a+24|0;do{v=b;b=b+4|0;c[b>>2]=7}while((v+8|0)>>>0<w>>>0);if((a|0)!=(j|0)){g=a-j|0;c[d>>2]=c[d>>2]&-2;c[j+4>>2]=g|1;c[a>>2]=g;b=g>>>3;if(g>>>0<256){d=8664+(b<<1<<2)|0;a=c[2156]|0;b=1<<b;if(!(a&b)){c[2156]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=j;c[b+12>>2]=j;c[j+8>>2]=b;c[j+12>>2]=d;break}b=g>>>8;if(b)if(g>>>0>16777215)e=31;else{v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;e=(w+245760|0)>>>16&2;e=14-(u|v|e)+(w<<e>>>15)|0;e=g>>>(e+7|0)&1|e<<1}else e=0;d=8928+(e<<2)|0;c[j+28>>2]=e;c[j+20>>2]=0;c[f>>2]=0;b=c[2157]|0;a=1<<e;if(!(b&a)){c[2157]=b|a;c[d>>2]=j;c[j+24>>2]=d;c[j+12>>2]=j;c[j+8>>2]=j;break}b=c[d>>2]|0;j:do if((c[b+4>>2]&-8|0)!=(g|0)){e=g<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=b+16+(e>>>31<<2)|0;a=c[d>>2]|0;if(!a)break;if((c[a+4>>2]&-8|0)==(g|0)){b=a;break j}else{e=e<<1;b=a}}c[d>>2]=j;c[j+24>>2]=b;c[j+12>>2]=j;c[j+8>>2]=j;break f}while(0);v=b+8|0;w=c[v>>2]|0;c[w+12>>2]=j;c[v>>2]=j;c[j+8>>2]=w;c[j+12>>2]=b;c[j+24>>2]=0}}else{w=c[2160]|0;if((w|0)==0|g>>>0<w>>>0)c[2160]=g;c[2268]=g;c[2269]=h;c[2271]=0;c[2165]=c[2274];c[2164]=-1;c[2169]=8664;c[2168]=8664;c[2171]=8672;c[2170]=8672;c[2173]=8680;c[2172]=8680;c[2175]=8688;c[2174]=8688;c[2177]=8696;c[2176]=8696;c[2179]=8704;c[2178]=8704;c[2181]=8712;c[2180]=8712;c[2183]=8720;c[2182]=8720;c[2185]=8728;c[2184]=8728;c[2187]=8736;c[2186]=8736;c[2189]=8744;c[2188]=8744;c[2191]=8752;c[2190]=8752;c[2193]=8760;c[2192]=8760;c[2195]=8768;c[2194]=8768;c[2197]=8776;c[2196]=8776;c[2199]=8784;c[2198]=8784;c[2201]=8792;c[2200]=8792;c[2203]=8800;c[2202]=8800;c[2205]=8808;c[2204]=8808;c[2207]=8816;c[2206]=8816;c[2209]=8824;c[2208]=8824;c[2211]=8832;c[2210]=8832;c[2213]=8840;c[2212]=8840;c[2215]=8848;c[2214]=8848;c[2217]=8856;c[2216]=8856;c[2219]=8864;c[2218]=8864;c[2221]=8872;c[2220]=8872;c[2223]=8880;c[2222]=8880;c[2225]=8888;c[2224]=8888;c[2227]=8896;c[2226]=8896;c[2229]=8904;c[2228]=8904;c[2231]=8912;c[2230]=8912;w=h+-40|0;u=g+8|0;u=(u&7|0)==0?0:0-u&7;v=g+u|0;u=w-u|0;c[2162]=v;c[2159]=u;c[v+4>>2]=u|1;c[g+w+4>>2]=40;c[2163]=c[2278]}while(0);b=c[2159]|0;if(b>>>0>n>>>0){u=b-n|0;c[2159]=u;w=c[2162]|0;v=w+n|0;c[2162]=v;c[v+4>>2]=u|1;c[w+4>>2]=n|3;w=w+8|0;k=x;return w|0}}c[(Ta()|0)>>2]=12;w=0;k=x;return w|0}function Ka(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if(!a)return;d=a+-8|0;f=c[2160]|0;a=c[a+-4>>2]|0;b=a&-8;j=d+b|0;do if(!(a&1)){e=c[d>>2]|0;if(!(a&3))return;h=d+(0-e)|0;g=e+b|0;if(h>>>0<f>>>0)return;if((c[2161]|0)==(h|0)){a=j+4|0;b=c[a>>2]|0;if((b&3|0)!=3){i=h;b=g;break}c[2158]=g;c[a>>2]=b&-2;c[h+4>>2]=g|1;c[h+g>>2]=g;return}d=e>>>3;if(e>>>0<256){a=c[h+8>>2]|0;b=c[h+12>>2]|0;if((b|0)==(a|0)){c[2156]=c[2156]&~(1<<d);i=h;b=g;break}else{c[a+12>>2]=b;c[b+8>>2]=a;i=h;b=g;break}}f=c[h+24>>2]|0;a=c[h+12>>2]|0;do if((a|0)==(h|0)){b=h+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){a=0;break}}else b=d;while(1){e=a+20|0;d=c[e>>2]|0;if(!d){e=a+16|0;d=c[e>>2]|0;if(!d)break;else{a=d;b=e}}else{a=d;b=e}}c[b>>2]=0}else{i=c[h+8>>2]|0;c[i+12>>2]=a;c[a+8>>2]=i}while(0);if(f){b=c[h+28>>2]|0;d=8928+(b<<2)|0;if((c[d>>2]|0)==(h|0)){c[d>>2]=a;if(!a){c[2157]=c[2157]&~(1<<b);i=h;b=g;break}}else{i=f+16|0;c[((c[i>>2]|0)==(h|0)?i:f+20|0)>>2]=a;if(!a){i=h;b=g;break}}c[a+24>>2]=f;b=h+16|0;d=c[b>>2]|0;if(d|0){c[a+16>>2]=d;c[d+24>>2]=a}b=c[b+4>>2]|0;if(b){c[a+20>>2]=b;c[b+24>>2]=a;i=h;b=g}else{i=h;b=g}}else{i=h;b=g}}else{i=d;h=d}while(0);if(h>>>0>=j>>>0)return;a=j+4|0;e=c[a>>2]|0;if(!(e&1))return;if(!(e&2)){if((c[2162]|0)==(j|0)){j=(c[2159]|0)+b|0;c[2159]=j;c[2162]=i;c[i+4>>2]=j|1;if((i|0)!=(c[2161]|0))return;c[2161]=0;c[2158]=0;return}if((c[2161]|0)==(j|0)){j=(c[2158]|0)+b|0;c[2158]=j;c[2161]=h;c[i+4>>2]=j|1;c[h+j>>2]=j;return}f=(e&-8)+b|0;d=e>>>3;do if(e>>>0<256){b=c[j+8>>2]|0;a=c[j+12>>2]|0;if((a|0)==(b|0)){c[2156]=c[2156]&~(1<<d);break}else{c[b+12>>2]=a;c[a+8>>2]=b;break}}else{g=c[j+24>>2]|0;a=c[j+12>>2]|0;do if((a|0)==(j|0)){b=j+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){d=0;break}}else b=d;while(1){e=a+20|0;d=c[e>>2]|0;if(!d){e=a+16|0;d=c[e>>2]|0;if(!d)break;else{a=d;b=e}}else{a=d;b=e}}c[b>>2]=0;d=a}else{d=c[j+8>>2]|0;c[d+12>>2]=a;c[a+8>>2]=d;d=a}while(0);if(g|0){a=c[j+28>>2]|0;b=8928+(a<<2)|0;if((c[b>>2]|0)==(j|0)){c[b>>2]=d;if(!d){c[2157]=c[2157]&~(1<<a);break}}else{e=g+16|0;c[((c[e>>2]|0)==(j|0)?e:g+20|0)>>2]=d;if(!d)break}c[d+24>>2]=g;a=j+16|0;b=c[a>>2]|0;if(b|0){c[d+16>>2]=b;c[b+24>>2]=d}a=c[a+4>>2]|0;if(a|0){c[d+20>>2]=a;c[a+24>>2]=d}}}while(0);c[i+4>>2]=f|1;c[h+f>>2]=f;if((i|0)==(c[2161]|0)){c[2158]=f;return}}else{c[a>>2]=e&-2;c[i+4>>2]=b|1;c[h+b>>2]=b;f=b}a=f>>>3;if(f>>>0<256){d=8664+(a<<1<<2)|0;b=c[2156]|0;a=1<<a;if(!(b&a)){c[2156]=b|a;a=d;b=d+8|0}else{b=d+8|0;a=c[b>>2]|0}c[b>>2]=i;c[a+12>>2]=i;c[i+8>>2]=a;c[i+12>>2]=d;return}a=f>>>8;if(a)if(f>>>0>16777215)e=31;else{h=(a+1048320|0)>>>16&8;j=a<<h;g=(j+520192|0)>>>16&4;j=j<<g;e=(j+245760|0)>>>16&2;e=14-(g|h|e)+(j<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}else e=0;a=8928+(e<<2)|0;c[i+28>>2]=e;c[i+20>>2]=0;c[i+16>>2]=0;b=c[2157]|0;d=1<<e;a:do if(!(b&d)){c[2157]=b|d;c[a>>2]=i;c[i+24>>2]=a;c[i+12>>2]=i;c[i+8>>2]=i}else{a=c[a>>2]|0;b:do if((c[a+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=a+16+(e>>>31<<2)|0;b=c[d>>2]|0;if(!b)break;if((c[b+4>>2]&-8|0)==(f|0)){a=b;break b}else{e=e<<1;a=b}}c[d>>2]=i;c[i+24>>2]=a;c[i+12>>2]=i;c[i+8>>2]=i;break a}while(0);h=a+8|0;j=c[h>>2]|0;c[j+12>>2]=i;c[h>>2]=i;c[i+8>>2]=j;c[i+12>>2]=a;c[i+24>>2]=0}while(0);j=(c[2164]|0)+-1|0;c[2164]=j;if(j|0)return;a=9080;while(1){a=c[a>>2]|0;if(!a)break;else a=a+8|0}c[2164]=-1;return}function La(a,b){a=a|0;b=b|0;var d=0;if(a){d=M(b,a)|0;if((b|a)>>>0>65535)d=((d>>>0)/(a>>>0)|0|0)==(b|0)?d:-1}else d=0;a=Ja(d)|0;if(!a)return a|0;if(!(c[a+-4>>2]&3))return a|0;fb(a|0,0,d|0)|0;return a|0}function Ma(a,b){a=a|0;b=b|0;var d=0,e=0;if(!a){b=Ja(b)|0;return b|0}if(b>>>0>4294967231){c[(Ta()|0)>>2]=12;b=0;return b|0}d=Na(a+-8|0,b>>>0<11?16:b+11&-8)|0;if(d|0){b=d+8|0;return b|0}d=Ja(b)|0;if(!d){b=0;return b|0}e=c[a+-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;db(d|0,a|0,(e>>>0<b>>>0?e:b)|0)|0;Ka(a);b=d;return b|0}function Na(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;l=a+4|0;m=c[l>>2]|0;d=m&-8;i=a+d|0;if(!(m&3)){if(b>>>0<256){a=0;return a|0}if(d>>>0>=(b+4|0)>>>0?(d-b|0)>>>0<=c[2276]<<1>>>0:0)return a|0;a=0;return a|0}if(d>>>0>=b>>>0){d=d-b|0;if(d>>>0<=15)return a|0;k=a+b|0;c[l>>2]=m&1|b|2;c[k+4>>2]=d|3;m=i+4|0;c[m>>2]=c[m>>2]|1;Oa(k,d);return a|0}if((c[2162]|0)==(i|0)){k=(c[2159]|0)+d|0;d=k-b|0;e=a+b|0;if(k>>>0<=b>>>0){a=0;return a|0}c[l>>2]=m&1|b|2;c[e+4>>2]=d|1;c[2162]=e;c[2159]=d;return a|0}if((c[2161]|0)==(i|0)){e=(c[2158]|0)+d|0;if(e>>>0<b>>>0){a=0;return a|0}d=e-b|0;if(d>>>0>15){k=a+b|0;e=a+e|0;c[l>>2]=m&1|b|2;c[k+4>>2]=d|1;c[e>>2]=d;e=e+4|0;c[e>>2]=c[e>>2]&-2;e=k}else{c[l>>2]=m&1|e|2;e=a+e+4|0;c[e>>2]=c[e>>2]|1;e=0;d=0}c[2158]=d;c[2161]=e;return a|0}e=c[i+4>>2]|0;if(e&2|0){a=0;return a|0}j=(e&-8)+d|0;if(j>>>0<b>>>0){a=0;return a|0}k=j-b|0;f=e>>>3;do if(e>>>0<256){e=c[i+8>>2]|0;d=c[i+12>>2]|0;if((d|0)==(e|0)){c[2156]=c[2156]&~(1<<f);break}else{c[e+12>>2]=d;c[d+8>>2]=e;break}}else{h=c[i+24>>2]|0;d=c[i+12>>2]|0;do if((d|0)==(i|0)){e=i+16|0;f=e+4|0;d=c[f>>2]|0;if(!d){d=c[e>>2]|0;if(!d){f=0;break}}else e=f;while(1){g=d+20|0;f=c[g>>2]|0;if(!f){g=d+16|0;f=c[g>>2]|0;if(!f)break;else{d=f;e=g}}else{d=f;e=g}}c[e>>2]=0;f=d}else{f=c[i+8>>2]|0;c[f+12>>2]=d;c[d+8>>2]=f;f=d}while(0);if(h|0){d=c[i+28>>2]|0;e=8928+(d<<2)|0;if((c[e>>2]|0)==(i|0)){c[e>>2]=f;if(!f){c[2157]=c[2157]&~(1<<d);break}}else{g=h+16|0;c[((c[g>>2]|0)==(i|0)?g:h+20|0)>>2]=f;if(!f)break}c[f+24>>2]=h;d=i+16|0;e=c[d>>2]|0;if(e|0){c[f+16>>2]=e;c[e+24>>2]=f}d=c[d+4>>2]|0;if(d|0){c[f+20>>2]=d;c[d+24>>2]=f}}}while(0);if(k>>>0<16){c[l>>2]=m&1|j|2;m=a+j+4|0;c[m>>2]=c[m>>2]|1;return a|0}else{i=a+b|0;c[l>>2]=m&1|b|2;c[i+4>>2]=k|3;m=a+j+4|0;c[m>>2]=c[m>>2]|1;Oa(i,k);return a|0}return 0}function Oa(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;i=a+b|0;d=c[a+4>>2]|0;do if(!(d&1)){f=c[a>>2]|0;if(!(d&3))return;h=a+(0-f)|0;b=f+b|0;if((c[2161]|0)==(h|0)){a=i+4|0;d=c[a>>2]|0;if((d&3|0)!=3)break;c[2158]=b;c[a>>2]=d&-2;c[h+4>>2]=b|1;c[i>>2]=b;return}e=f>>>3;if(f>>>0<256){a=c[h+8>>2]|0;d=c[h+12>>2]|0;if((d|0)==(a|0)){c[2156]=c[2156]&~(1<<e);break}else{c[a+12>>2]=d;c[d+8>>2]=a;break}}g=c[h+24>>2]|0;a=c[h+12>>2]|0;do if((a|0)==(h|0)){d=h+16|0;e=d+4|0;a=c[e>>2]|0;if(!a){a=c[d>>2]|0;if(!a){a=0;break}}else d=e;while(1){f=a+20|0;e=c[f>>2]|0;if(!e){f=a+16|0;e=c[f>>2]|0;if(!e)break;else{a=e;d=f}}else{a=e;d=f}}c[d>>2]=0}else{f=c[h+8>>2]|0;c[f+12>>2]=a;c[a+8>>2]=f}while(0);if(g){d=c[h+28>>2]|0;e=8928+(d<<2)|0;if((c[e>>2]|0)==(h|0)){c[e>>2]=a;if(!a){c[2157]=c[2157]&~(1<<d);break}}else{f=g+16|0;c[((c[f>>2]|0)==(h|0)?f:g+20|0)>>2]=a;if(!a)break}c[a+24>>2]=g;d=h+16|0;e=c[d>>2]|0;if(e|0){c[a+16>>2]=e;c[e+24>>2]=a}d=c[d+4>>2]|0;if(d){c[a+20>>2]=d;c[d+24>>2]=a}}}else h=a;while(0);a=i+4|0;e=c[a>>2]|0;if(!(e&2)){if((c[2162]|0)==(i|0)){i=(c[2159]|0)+b|0;c[2159]=i;c[2162]=h;c[h+4>>2]=i|1;if((h|0)!=(c[2161]|0))return;c[2161]=0;c[2158]=0;return}if((c[2161]|0)==(i|0)){i=(c[2158]|0)+b|0;c[2158]=i;c[2161]=h;c[h+4>>2]=i|1;c[h+i>>2]=i;return}f=(e&-8)+b|0;d=e>>>3;do if(e>>>0<256){a=c[i+8>>2]|0;b=c[i+12>>2]|0;if((b|0)==(a|0)){c[2156]=c[2156]&~(1<<d);break}else{c[a+12>>2]=b;c[b+8>>2]=a;break}}else{g=c[i+24>>2]|0;b=c[i+12>>2]|0;do if((b|0)==(i|0)){a=i+16|0;d=a+4|0;b=c[d>>2]|0;if(!b){b=c[a>>2]|0;if(!b){d=0;break}}else a=d;while(1){e=b+20|0;d=c[e>>2]|0;if(!d){e=b+16|0;d=c[e>>2]|0;if(!d)break;else{b=d;a=e}}else{b=d;a=e}}c[a>>2]=0;d=b}else{d=c[i+8>>2]|0;c[d+12>>2]=b;c[b+8>>2]=d;d=b}while(0);if(g|0){b=c[i+28>>2]|0;a=8928+(b<<2)|0;if((c[a>>2]|0)==(i|0)){c[a>>2]=d;if(!d){c[2157]=c[2157]&~(1<<b);break}}else{e=g+16|0;c[((c[e>>2]|0)==(i|0)?e:g+20|0)>>2]=d;if(!d)break}c[d+24>>2]=g;b=i+16|0;a=c[b>>2]|0;if(a|0){c[d+16>>2]=a;c[a+24>>2]=d}b=c[b+4>>2]|0;if(b|0){c[d+20>>2]=b;c[b+24>>2]=d}}}while(0);c[h+4>>2]=f|1;c[h+f>>2]=f;if((h|0)==(c[2161]|0)){c[2158]=f;return}}else{c[a>>2]=e&-2;c[h+4>>2]=b|1;c[h+b>>2]=b;f=b}b=f>>>3;if(f>>>0<256){d=8664+(b<<1<<2)|0;a=c[2156]|0;b=1<<b;if(!(a&b)){c[2156]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=h;c[b+12>>2]=h;c[h+8>>2]=b;c[h+12>>2]=d;return}b=f>>>8;if(b)if(f>>>0>16777215)e=31;else{g=(b+1048320|0)>>>16&8;i=b<<g;d=(i+520192|0)>>>16&4;i=i<<d;e=(i+245760|0)>>>16&2;e=14-(d|g|e)+(i<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}else e=0;b=8928+(e<<2)|0;c[h+28>>2]=e;c[h+20>>2]=0;c[h+16>>2]=0;a=c[2157]|0;d=1<<e;if(!(a&d)){c[2157]=a|d;c[b>>2]=h;c[h+24>>2]=b;c[h+12>>2]=h;c[h+8>>2]=h;return}b=c[b>>2]|0;a:do if((c[b+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=b+16+(e>>>31<<2)|0;a=c[d>>2]|0;if(!a)break;if((c[a+4>>2]&-8|0)==(f|0)){b=a;break a}else{e=e<<1;b=a}}c[d>>2]=h;c[h+24>>2]=b;c[h+12>>2]=h;c[h+8>>2]=h;return}while(0);g=b+8|0;i=c[g>>2]|0;c[i+12>>2]=h;c[g>>2]=h;c[h+8>>2]=i;c[h+12>>2]=b;c[h+24>>2]=0;return}function Pa(a){a=a|0;var b=0,d=0;b=k;k=k+16|0;d=b;c[d>>2]=Ua(c[a+60>>2]|0)|0;a=Sa(da(6,d|0)|0)|0;k=b;return a|0}function Qa(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0;n=k;k=k+48|0;l=n+32|0;g=n+16|0;f=n;i=a+28|0;e=c[i>>2]|0;c[f>>2]=e;j=a+20|0;e=(c[j>>2]|0)-e|0;c[f+4>>2]=e;c[f+8>>2]=b;c[f+12>>2]=d;e=e+d|0;h=a+60|0;c[g>>2]=c[h>>2];c[g+4>>2]=f;c[g+8>>2]=2;g=Sa(ca(146,g|0)|0)|0;a:do if((e|0)!=(g|0)){b=2;while(1){if((g|0)<0)break;e=e-g|0;p=c[f+4>>2]|0;o=g>>>0>p>>>0;f=o?f+8|0:f;b=b+(o<<31>>31)|0;p=g-(o?p:0)|0;c[f>>2]=(c[f>>2]|0)+p;o=f+4|0;c[o>>2]=(c[o>>2]|0)-p;c[l>>2]=c[h>>2];c[l+4>>2]=f;c[l+8>>2]=b;g=Sa(ca(146,l|0)|0)|0;if((e|0)==(g|0)){m=3;break a}}c[a+16>>2]=0;c[i>>2]=0;c[j>>2]=0;c[a>>2]=c[a>>2]|32;if((b|0)==2)d=0;else d=d-(c[f+4>>2]|0)|0}else m=3;while(0);if((m|0)==3){p=c[a+44>>2]|0;c[a+16>>2]=p+(c[a+48>>2]|0);c[i>>2]=p;c[j>>2]=p}k=n;return d|0}function Ra(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;f=k;k=k+32|0;g=f;e=f+20|0;c[g>>2]=c[a+60>>2];c[g+4>>2]=0;c[g+8>>2]=b;c[g+12>>2]=e;c[g+16>>2]=d;if((Sa(ba(140,g|0)|0)|0)<0){c[e>>2]=-1;a=-1}else a=c[e>>2]|0;k=f;return a|0}function Sa(a){a=a|0;if(a>>>0>4294963200){c[(Ta()|0)>>2]=0-a;a=-1}return a|0}function Ta(){return 9120}function Ua(a){a=a|0;return a|0}function Va(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;a:do if(!d)b=0;else{while(1){e=a[b>>0]|0;f=a[c>>0]|0;if(e<<24>>24!=f<<24>>24)break;d=d+-1|0;if(!d){b=0;break a}else{b=b+1|0;c=c+1|0}}b=(e&255)-(f&255)|0}while(0);return b|0}function Wa(a){a=a|0;return 0}function Xa(a){a=a|0;return}function Ya(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=d&255;f=(e|0)!=0;a:do if(f&(b&3|0)!=0){g=d&255;while(1){if((a[b>>0]|0)==g<<24>>24){i=6;break a}b=b+1|0;e=e+-1|0;f=(e|0)!=0;if(!(f&(b&3|0)!=0)){i=5;break}}}else i=5;while(0);if((i|0)==5)if(f)i=6;else i=16;b:do if((i|0)==6){g=d&255;if((a[b>>0]|0)==g<<24>>24)if(!e){i=16;break}else break;f=M(h,16843009)|0;c:do if(e>>>0>3)while(1){h=c[b>>2]^f;if((h&-2139062144^-2139062144)&h+-16843009|0)break c;b=b+4|0;e=e+-4|0;if(e>>>0<=3){i=11;break}}else i=11;while(0);if((i|0)==11)if(!e){i=16;break}while(1){if((a[b>>0]|0)==g<<24>>24)break b;e=e+-1|0;if(!e){i=16;break}else b=b+1|0}}while(0);if((i|0)==16)b=0;return b|0}function Za(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=e+16|0;g=c[f>>2]|0;if(!g)if(!(_a(e)|0)){g=c[f>>2]|0;h=5}else f=0;else h=5;a:do if((h|0)==5){j=e+20|0;i=c[j>>2]|0;f=i;if((g-i|0)>>>0<d>>>0){f=ia[c[e+36>>2]&7](e,b,d)|0;break}b:do if((a[e+75>>0]|0)<0|(d|0)==0){h=0;g=b}else{i=d;while(1){g=i+-1|0;if((a[b+g>>0]|0)==10)break;if(!g){h=0;g=b;break b}else i=g}f=ia[c[e+36>>2]&7](e,b,i)|0;if(f>>>0<i>>>0)break a;h=i;g=b+i|0;d=d-i|0;f=c[j>>2]|0}while(0);db(f|0,g|0,d|0)|0;c[j>>2]=(c[j>>2]|0)+d;f=h+d|0}while(0);return f|0}function _a(b){b=b|0;var d=0,e=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;d=c[b>>2]|0;if(!(d&8)){c[b+8>>2]=0;c[b+4>>2]=0;e=c[b+44>>2]|0;c[b+28>>2]=e;c[b+20>>2]=e;c[b+16>>2]=e+(c[b+48>>2]|0);b=0}else{c[b>>2]=d|32;b=-1}return b|0}function $a(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=M(d,b)|0;d=(b|0)==0?0:d;if((c[e+76>>2]|0)>-1){g=(Wa(e)|0)==0;a=Za(a,f,e)|0;if(!g)Xa(e)}else a=Za(a,f,e)|0;if((a|0)!=(f|0))d=(a>>>0)/(b>>>0)|0;return d|0}function ab(){}function bb(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){x=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}x=a<<c-32;return 0}function cb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return (x=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function db(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((e|0)>=8192)return ea(b|0,d|0,e|0)|0;h=b|0;g=b+e|0;if((b&3)==(d&3)){while(b&3){if(!e)return h|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}e=g&-4|0;f=e-64|0;while((b|0)<=(f|0)){c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];c[b+16>>2]=c[d+16>>2];c[b+20>>2]=c[d+20>>2];c[b+24>>2]=c[d+24>>2];c[b+28>>2]=c[d+28>>2];c[b+32>>2]=c[d+32>>2];c[b+36>>2]=c[d+36>>2];c[b+40>>2]=c[d+40>>2];c[b+44>>2]=c[d+44>>2];c[b+48>>2]=c[d+48>>2];c[b+52>>2]=c[d+52>>2];c[b+56>>2]=c[d+56>>2];c[b+60>>2]=c[d+60>>2];b=b+64|0;d=d+64|0}while((b|0)<(e|0)){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0}}else{e=g-4|0;while((b|0)<(e|0)){a[b>>0]=a[d>>0]|0;a[b+1>>0]=a[d+1>>0]|0;a[b+2>>0]=a[d+2>>0]|0;a[b+3>>0]=a[d+3>>0]|0;b=b+4|0;d=d+4|0}}while((b|0)<(g|0)){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0}return h|0}function eb(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b>>0]=a[c>>0]|0}b=e}else db(b,c,d)|0;return b|0}function fb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=b+e|0;d=d&255;if((e|0)>=67){while(b&3){a[b>>0]=d;b=b+1|0}f=h&-4|0;g=f-64|0;i=d|d<<8|d<<16|d<<24;while((b|0)<=(g|0)){c[b>>2]=i;c[b+4>>2]=i;c[b+8>>2]=i;c[b+12>>2]=i;c[b+16>>2]=i;c[b+20>>2]=i;c[b+24>>2]=i;c[b+28>>2]=i;c[b+32>>2]=i;c[b+36>>2]=i;c[b+40>>2]=i;c[b+44>>2]=i;c[b+48>>2]=i;c[b+52>>2]=i;c[b+56>>2]=i;c[b+60>>2]=i;b=b+64|0}while((b|0)<(f|0)){c[b>>2]=i;b=b+4|0}}while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0}return h-e|0}function gb(a){a=a|0;var b=0,d=0;d=c[i>>2]|0;b=d+a|0;if((a|0)>0&(b|0)<(d|0)|(b|0)<0){U()|0;aa(12);return -1}c[i>>2]=b;if((b|0)>(T()|0)?(S()|0)==0:0){c[i>>2]=d;aa(12);return -1}return d|0}function hb(a,b){a=a|0;b=b|0;return ha[a&3](b|0)|0}function ib(a){a=a|0;return W(0,a|0)|0}function jb(a){a=a|0;return W(1,a|0)|0}function kb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ia[a&7](b|0,c|0,d|0)|0}function lb(a,b,c){a=a|0;b=b|0;c=c|0;return Y(0,a|0,b|0,c|0)|0}function mb(a,b,c){a=a|0;b=b|0;c=c|0;return Y(1,a|0,b|0,c|0)|0}function nb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ja[a&3](b|0,c|0,d|0,e|0)}function ob(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;_(0,a|0,b|0,c|0,d|0)}function pb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;_(1,a|0,b|0,c|0,d|0)}function qb(a){a=a|0;Q(0);return 0}function rb(a,b,c){a=a|0;b=b|0;c=c|0;Q(1);return 0}function sb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Q(2)}

// EMSCRIPTEN_END_FUNCS
var ha=[qb,ib,jb,Pa];var ia=[rb,lb,mb,Qa,Ra,rb,rb,rb];var ja=[sb,ob,pb,sb];return{_AVOggAllocBuf:sa,_AVOggDestroy:ua,_AVOggInit:ra,_AVOggRead:ta,___errno_location:Ta,_bitshift64Shl:bb,_free:Ka,_i64Add:cb,_malloc:Ja,_memcpy:db,_memmove:eb,_memset:fb,_sbrk:gb,dynCall_ii:hb,dynCall_iiii:kb,dynCall_viiii:nb,establishStackSpace:na,getTempRet0:qa,runPostSets:ab,setTempRet0:pa,setThrew:oa,stackAlloc:ka,stackRestore:ma,stackSave:la}})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var _AVOggAllocBuf=Module["_AVOggAllocBuf"]=asm["_AVOggAllocBuf"];var _AVOggDestroy=Module["_AVOggDestroy"]=asm["_AVOggDestroy"];var _AVOggInit=Module["_AVOggInit"]=asm["_AVOggInit"];var _AVOggRead=Module["_AVOggRead"]=asm["_AVOggRead"];var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var _free=Module["_free"]=asm["_free"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _memmove=Module["_memmove"]=asm["_memmove"];var _memset=Module["_memset"]=asm["_memset"];var _sbrk=Module["_sbrk"]=asm["_sbrk"];var establishStackSpace=Module["establishStackSpace"]=asm["establishStackSpace"];var getTempRet0=Module["getTempRet0"]=asm["getTempRet0"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var setTempRet0=Module["setTempRet0"]=asm["setTempRet0"];var setThrew=Module["setThrew"]=asm["setThrew"];var stackAlloc=Module["stackAlloc"]=asm["stackAlloc"];var stackRestore=Module["stackRestore"]=asm["stackRestore"];var stackSave=Module["stackSave"]=asm["stackSave"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_viiii=Module["dynCall_viiii"]=asm["dynCall_viiii"];Module["asm"]=asm;Module["addFunction"]=addFunction;Module["removeFunction"]=removeFunction;if(memoryInitializer){if(!isDataURI(memoryInitializer)){memoryInitializer=locateFile(memoryInitializer)}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,GLOBAL_BASE)}else{addRunDependency("memory initializer");var applyMemoryInitializer=(function(data){if(data.byteLength)data=new Uint8Array(data);HEAPU8.set(data,GLOBAL_BASE);if(Module["memoryInitializerRequest"])delete Module["memoryInitializerRequest"].response;removeRunDependency("memory initializer")});function doBrowserLoad(){Module["readAsync"](memoryInitializer,applyMemoryInitializer,(function(){throw"could not load memory initializer "+memoryInitializer}))}var memoryInitializerBytes=tryParseAsDataURI(memoryInitializer);if(memoryInitializerBytes){applyMemoryInitializer(memoryInitializerBytes.buffer)}else if(Module["memoryInitializerRequest"]){function useRequest(){var request=Module["memoryInitializerRequest"];var response=request.response;if(request.status!==200&&request.status!==0){var data=tryParseAsDataURI(Module["memoryInitializerRequestURL"]);if(data){response=data.buffer}else{console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: "+request.status+", retrying "+memoryInitializer);doBrowserLoad();return}}applyMemoryInitializer(response)}if(Module["memoryInitializerRequest"].response){setTimeout(useRequest,0)}else{Module["memoryInitializerRequest"].addEventListener("load",useRequest)}}else{doBrowserLoad()}}}function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=run;function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){out(what);err(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}Module["noExitRuntime"]=true;run()




module.exports = Module

},{"fs":2,"path":3}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":4}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
(function (global){
var AV = (typeof window !== "undefined" ? window['AV'] : typeof global !== "undefined" ? global['AV'] : null);
var Ogg = require('../build/libogg');

var OggDemuxer = AV.Demuxer.extend(function() {
  AV.Demuxer.register(this);

  this.probe = function(buffer) {
    return buffer.peekString(0, 4) === 'OggS';
  };

  this.plugins = [];
  this.prototype.init = function() {
    this.ogg = Ogg._AVOggInit();

    var self = this;
    var plugin = null;
    var doneHeaders = false;

    // copy the stream in case we override it, e.g. flac
    this._stream = this.stream;
    this.callback = Ogg.addFunction(function(packet, bytes, streamEnd, granulePos) {
      var data = new Uint8Array(Ogg.HEAPU8.subarray(packet, packet + bytes));

      // find plugin for codec
      if (!plugin) {
        for (var i = 0; i < OggDemuxer.plugins.length; i++) {
          var cur = OggDemuxer.plugins[i];
          var magic = data.subarray(0, cur.magic.length);
          if (String.fromCharCode.apply(String, magic) === cur.magic) {
            plugin = cur;
            break;
          }
        }

        if (!plugin)
          throw new Error("Unknown format in Ogg file.");

        if (plugin.init)
          plugin.init.call(self);
      }

      // send packet to plugin
      if (!doneHeaders)
        doneHeaders = plugin.readHeaders.call(self, data);
      else
        plugin.readPacket.call(self, data, streamEnd, granulePos);
    });
  };

  this.prototype.readChunk = function() {
    const length = this._stream.remainingBytes();
    const buf = Ogg._AVOggAllocBuf(this.ogg, length);
    Ogg.HEAPU8.set(this._stream.readBuffer(length).data, buf);
    Ogg._AVOggRead(this.ogg, length, this.callback);
  };

  this.prototype.destroy = function() {
    this._super();
    Ogg.removeFunction(this.callback);
    Ogg._AVOggDestroy(this.ogg);

    this.ogg = null;
    this.callback = null;
  };
});

module.exports = OggDemuxer;
AV.OggDemuxer = OggDemuxer; // for browser

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../build/libogg":1}]},{},[5]);
