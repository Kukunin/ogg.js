#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <ogg/ogg.h>

typedef void (*AVCallback)(unsigned char *, int, long, long);

typedef struct {
  ogg_sync_state *state;
  ogg_page page;
  ogg_stream_state *stream;
  ogg_packet packet;
} AVOgg;

AVOgg *AVOggInit() {
  AVOgg *ogg = calloc(1, sizeof(AVOgg));
  ogg->state = calloc(1, sizeof(ogg_sync_state));
  assert(!ogg_sync_init(ogg->state));
  assert(ogg_sync_pageout(ogg->state, &ogg->page) != 1);
  return ogg;
}

char* AVOggAllocBuf(AVOgg *ogg, int buflen) {
  return ogg_sync_buffer(ogg->state, buflen);
}

int AVOggRead(AVOgg *ogg, int buflen, AVCallback callback) {
  // write buffer into ogg stream
  assert(!ogg_sync_wrote(ogg->state, buflen));

  // read ogg pages
  int pageout, packetout;
  while ((pageout = ogg_sync_pageout(ogg->state, &ogg->page)) == 1) {
    int serial = ogg_page_serialno(&ogg->page);

    if (ogg_page_bos(&ogg->page)) {
      if(ogg->stream) {
        ogg_stream_destroy(ogg->stream);
      }
      ogg->stream = calloc(1, sizeof(ogg_stream_state));
      assert(!ogg_stream_init(ogg->stream, serial));
    }

    assert(!ogg_stream_pagein(ogg->stream, &ogg->page));

    // read packets
    while ((packetout = ogg_stream_packetout(ogg->stream, &ogg->packet)) == 1) {
      callback(ogg->packet.packet, ogg->packet.bytes, ogg->packet.e_o_s, ogg->packet.granulepos);
    }
    if(packetout == -1) {
      fprintf(stderr, "OGG stream is out of sync\n");
    }
  }
  if(pageout == -1) {
    fprintf(stderr, "OGG page is out of sync\n");
  }

  return 0;
}

void AVOggDestroy(AVOgg *ogg) {
  ogg_sync_destroy(ogg->state);
  if(ogg->stream) {
    ogg_stream_destroy(ogg->stream);
  }
  free(ogg);
}
