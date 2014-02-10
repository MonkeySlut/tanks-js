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
      [192,110,96,96,grey1],
      [678,110,96,96,grey1],
      [192,330,96,96,grey1],
      [678,330,96,96,grey1]
    ],
    Polys: []
  },

  /** 1 centered block. */
  Dirt1: {
    Textures: [
      [0,0,970,546,dirt1]
    ],
    Blocks: [
      [435,223,96,96,grey1]
    ],
    Polys: []
  },

  /** N-like path/shape. */
  BigN: {
    Textures: [
      [0,0,970,546,dirt1]
    ],
    Blocks: [
      [300,194,32,321,grey1],
      [660,32,32,320,grey1]
    ],
    Polys: []
  },

  /** Poly test. */
  PolyTest: {
    Textures: [
      [0,0,970,546,dirt1]
    ],
    Blocks: [],
    Polys: [
      [
        [250,150],
        [350,250],
        [250,350],
        [150,250]
      ],
      [
        [650,200],  // 2
        [700,150],  // 3
        [750,200]   // 4
      ],
      [
        [650,250],  // 12
        [750,250],  // 6
        [800,200],  // 5
        [600,200]   // 1
      ],
      [
        [750,250],  // 6
        [800,300],  // 7
        [750,300],  // 8
        [700,250]   // 9
      ],
      [
        [700,250],  // 9
        [650,300],  // 10
        [600,300],  // 11
        [650,250]   // 12
      ]
    ]
  },
}