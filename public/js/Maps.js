/**
 * Map configurations.
 *
 * A map configuration requires:
 *  Textures
 *    [x,y,width,height,image]
 *    Just graphics with no collisions (background).
 *  Blocks
 *    [x,y,width,height,image]
 *    Rectangles that cause collisions.
 *
 *
 * Map dimensions are 970x546
 *
 * Available images:
 *  dirt1: 32x32 of dirt
 *  gret1: 32x32 grey metal type graphic
 *
 */

var TTMaps = {

  /** Classic map of 4 blocks. */
  Classic: {
    Textures: [
      [0,0,970,546,dirt1]
    ],
    Blocks: [
    ],
    Polys: [
    ]
  }
}