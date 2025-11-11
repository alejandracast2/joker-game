import { Container, Texture, Sprite, Graphics, BlurFilter } from "pixi.js";

type ReelData = {
  container: Container;
  symbols: Sprite[];
  position: number;
  previousPosition: number;
  blur: BlurFilter;
};

export class ReelContainer extends Container {
  private region = { x: 170, y: 327, w: 1435, h: 525 };
  private reel: Sprite;
  private reelOffset = { x: 0, y: 0 };
  private topLights: Sprite;
  private bottomLights: Sprite;

  private slotsRoot: Container;
  private readonly COLS = 5;
  private readonly ROWS = 3;
  private readonly padding = { x: 20, y: 20 };

  // NUEVO: contenedor y datos de reels (para animar luego si quieres)
  private reelContainer: Container;
  private reels: ReelData[] = [];

  constructor(bgW: number, bgH: number) {
    super();

    // 🎰 Carrete (fondo)
    const reelTexture = Texture.from("carrete1.png");
    this.reel = new Sprite(reelTexture);
    this.reel.anchor.set(0.5);
    this.addChild(this.reel);

    // 💡 Textura compartida (transparencia)
    const lightsTexture = Texture.from("transparencia.png");

    // 🔼 Luces superiores
    this.topLights = new Sprite(lightsTexture);
    this.topLights.anchor.set(0.5);
    // Si usas PIXI v7+, mejor: this.topLights.blendMode = BLEND_MODES.ADD;
    // mantengo tu valor original por compatibilidad
    // @ts-ignore
    this.topLights.blendMode = "add";
    this.reel.addChild(this.topLights);
    this.topLights.y = -this.reel.height / 2 + 33;
    this.topLights.x = 12;

    // 🔽 Luces inferiores (misma textura invertida)
    this.bottomLights = new Sprite(lightsTexture);
    this.bottomLights.anchor.set(0.5);
    // @ts-ignore
    this.bottomLights.blendMode = "add";
    this.bottomLights.scale.y = -1;
    this.reel.addChild(this.bottomLights);
    this.bottomLights.y = this.reel.height / 2 - 33;
    this.bottomLights.x = 12;

    // Raíz de slots y contenedor de reels
    this.slotsRoot = new Container();
    this.reel.addChild(this.slotsRoot);

    this.reelContainer = new Container();
    this.slotsRoot.addChild(this.reelContainer);

    // === AQUÍ VA EL REEMPLAZO DEL BLOQUE DE COLUMNAS POR REELS ===

    // Dimensiones por columna (mantenemos tus números para compatibilidad)
    const VIEW_WIDTH= 1435;       // ancho de cada columna
    const VIEW_HEIGHT = 540;      // alto visible del área de símbolos por columna
    // Tamaño de cada símbolo según filas visibles
    const SYMBOL_SIZE = Math.floor(VIEW_HEIGHT / this.ROWS); // ~177 si ROWS=3
    const REEL_WIDTH = Math.floor(VIEW_WIDTH / this.COLS); ;
    console.log("simbol",SYMBOL_SIZE)
    // Coloca el reelContainer alineado con tu cálculo anterior
    // (equivale a: (-this.reel.width/2)+20 para la primera columna, y -this.reel.height/2 para Y)
    this.reelContainer.x = (-this.reel.width / 2);
    this.reelContainer.y = -this.reel.height / 2;

    // Prepara tus texturas de símbolos (pon aquí tus archivos reales)
    // Por ejemplo:
    // const slotTextures = ["cherry.png","lemon.png","bar.png","seven.png","bell.png"].map(Texture.from);
    const slotTextures = ["perla-0.png","gema-0.png","zapatos-0.png","diamante-0.png","bolos-0.png","guitar-0.png","joker-0.png","bonus-0.png"].map(Texture.from); // placeholder

    // Crea los reels (columnas)
    for (let i = 0; i < this.COLS; i++) {
      const rc = new Container();
      rc.x = i * REEL_WIDTH;
      this.reelContainer.addChild(rc);

      const reel: ReelData = {
        container: rc,
        symbols: [],
        position: 0,
        previousPosition: 0,
        blur: new BlurFilter(),
      };

      reel.blur.strengthX = 0;
      reel.blur.strengthY = 0;
      rc.filters = [reel.blur];

      // Construye los símbolos de este reel
      for (let j = 0; j < this.ROWS; j++) {
        const tex = slotTextures[Math.floor(Math.random() * slotTextures.length)];
        const symbol = new Sprite(tex);

        // Escalar imagen
        symbol.scale.set(1);

        // Posición: centrado horizontalmente dentro del REEL_WIDTH, y apilado verticalmente
        symbol.x = Math.round((REEL_WIDTH - symbol.width) / 2);
        symbol.y =(SYMBOL_SIZE/2) -(symbol.height/2) +j*SYMBOL_SIZE;
        rc.addChild(symbol);
        reel.symbols.push(symbol);
      }

      this.reels.push(reel);
    }

    // Posición general del carrete (igual que antes)
    this.reelOffset = {
      x: (this.region.x + this.region.w / 2) - (bgW / 2),
      y: (this.region.y + this.region.h / 2) - (bgH / 2),
    };
  }

  resize() {
    const ox = this.reelOffset.x;
    const oy = this.reelOffset.y;
    this.reel.position.set(ox, oy);
  }
}

// import { Container, Texture, Sprite, Graphics } from "pixi.js";

// export class ReelContainer extends Container {
//   private region = { x: 170, y: 327, w: 1435, h: 525 };
//   private reel: Sprite;
//   private reelOffset = { x: 0, y: 0 };
//   private topLights: Sprite;
//   private bottomLights: Sprite; // 🔥 nueva

//   private slotsRoot: Container;
//   private columns: Container[] = [];
//   private readonly COLS = 5;
//   private readonly ROWS = 3;
//   private readonly padding = { x: 20, y: 20 }; // margen interno por celda (ajústalo)

//   constructor(bgW: number, bgH: number) {
//     super();

//     // 🎰 Carrete
//     const reelTexture = Texture.from("carrete1.png");
//     this.reel = new Sprite(reelTexture);
//     this.reel.anchor.set(0.5);
//     this.addChild(this.reel);

//     // 💡 Textura compartida (transparencia)
//     const lightsTexture = Texture.from("transparencia.png");

//     // 🔼 Luces superiores
//     this.topLights = new Sprite(lightsTexture);
//     this.topLights.anchor.set(0.5);
//     this.topLights.blendMode = "add";
//     this.reel.addChild(this.topLights);
//     this.topLights.y = -this.reel.height / 2 + 33;
//     this.topLights.x = 12;

//     // 🔽 Luces inferiores (misma textura, invertida)
//     this.bottomLights = new Sprite(lightsTexture);
//     this.bottomLights.anchor.set(0.5);
//     this.bottomLights.blendMode = "add";
//     this.bottomLights.scale.y = -1; // 👈 voltea verticalmente
//     this.reel.addChild(this.bottomLights);
//     this.bottomLights.y = this.reel.height / 2 - 33; // posición debajo del carrete
//     this.bottomLights.x = 12;
//     console.log(this.bottomLights.y, this.bottomLights.x)

//     this.slotsRoot = new Container();
//     this.reel.addChild(this.slotsRoot);

//     for (let c = 0; c < this.COLS; c++) {
//       const col = new Container();
//       this.slotsRoot.addChild(col);
//       this.columns.push(col);

//       // this.slotsRoot.x = (-this.reel.width / 2)+20;
//       // this.slotsRoot.y = -this.reel.height / 2;
//       // 📏 dimensiones del contenedor
//       const width = 272;
//       const height = 533;
//       col.width = width;
//       col.height = height;

//       // 📍 posición
//       col.x = (-this.reel.width / 2)+20 + (c*width);
//       col.y = -this.reel.height / 2;

//       // 🎰 crea los símbolos dentro de cada columna
//       for (let r = 0; r < this.ROWS; r++) {
//         const tex = Texture.from("name.png");
//         const sp = new Sprite(tex);
//         sp.anchor.set(0.5);
//         col.addChild(sp);

//       }
//     }

//     // Posición general del carrete
//     this.reelOffset = {
//       x: (this.region.x + this.region.w / 2) - (bgW / 2),
//       y: (this.region.y + this.region.h / 2) - (bgH / 2),
//     };
//   }

//   resize() {
//     const ox = this.reelOffset.x;
//     const oy = this.reelOffset.y;
//     this.reel.position.set(ox, oy);
//   }
// }



//     // for (let c = 0; c < this.COLS; c++) {
//     //   const col = new Container();
//     //   this.slotsRoot.addChild(col);
//     //   this.columns.push(col);

//     //   for (let r = 0; r < this.ROWS; r++) {
//     //     // Cambia estos nombres por tus texturas reales (o luego usa setColumnTextures)
//     //     const tex = Texture.from("name.png");
//     //     const sp = new Sprite(tex);
//     //     console.log(r,sp)
//     //     sp.anchor.set(0.5);
//     //     col.addChild(sp);
//     //   }
//     // }
