var AV = require('av');
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

    this.callback = Ogg.addFunction(function(packet, bytes) {
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
        plugin.readPacket.call(self, data);
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
