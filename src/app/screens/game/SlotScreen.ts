import type { Spritesheet } from "pixi.js";
import { Assets, Container, Sprite, Texture } from "pixi.js";

import { OverlayContainer } from "../../slot/info/OverlayContainer";
import { ReelContainer } from "../../slot/reels/ReelContainer";

export class SlotScreen extends Container {
  public static assetBundles = ["preload", "main"];

  // Contenedor principal que agrupa todo (imagen+subcontainers)
  private readonly mainContainer: Container;

  // Fondo ahora vive dentro de mainContainer
  private background: Sprite;

  // Subcontainers (hijos de mainContainer)
  private readonly overlaycontainer: OverlayContainer;
  private readonly reelcontainer: ReelContainer;

  constructor() {
    super();

    // 1) Crear el contenedor principal (la “imagen principal” pedida)
    this.mainContainer = new Container();
    // Conveniente: usar el centro como origen local
    this.mainContainer.pivot.set(0, 0);
    this.addChild(this.mainContainer);

    // 2) Cargar datos / texturas
    const spritesheet =
      (Assets.get("data-0.json") as Spritesheet | undefined) ??
      (Assets.get("main/images/data-0.json") as Spritesheet | undefined);

    const backgroundTexture = Texture.from("background.jpg");

    // 3) Fondo dentro del contenedor principal
    this.background = new Sprite(backgroundTexture);
    this.background.anchor.set(0.5);
    // Como el mainContainer lo colocaremos en el centro de la pantalla,
    // dejamos el fondo centrado en (0,0) dentro de mainContainer:
    this.background.position.set(0, 0);
    this.mainContainer.addChildAt(this.background, 0);

    // 4) Crear sub-containers como hijos de mainContainer
    const bgW = this.background.texture.width;
    const bgH = this.background.texture.height;

    this.overlaycontainer = new OverlayContainer(spritesheet, bgW, bgH);
    this.mainContainer.addChild(this.overlaycontainer);

    this.reelcontainer = new ReelContainer(bgW, bgH);
    this.mainContainer.addChild(this.reelcontainer);
  }

  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    const texW = this.background.texture.width;
    const texH = this.background.texture.height;

    // Escala para encajar el fondo en pantalla
    const scaleToFit = Math.min(width / texW, height / texH);

    // Posicionar el contenedor principal en el centro de la pantalla
    this.mainContainer.position.set(centerX, centerY);

    // Escalar TODO el grupo (fondo + subcontainers)
    this.mainContainer.scale.set(scaleToFit);

    // El fondo ya está centrado en (0,0) dentro del mainContainer
    // y su escala queda en 1 porque la escala global la aplica mainContainer.
    this.background.scale.set(1);
    this.background.position.set(0, 0);

    // IMPORTANTE:
    // Desde ahora, las coordenadas locales del “centro” para los hijos de mainContainer son (0,0).
    // Si tus OverlayContainer/ReelContainer esperan coords absolutas, conviene ajustarlas
    // para que usen (0,0) como centro local.
    this.overlaycontainer.position.set(0, 0);
    this.reelcontainer.position.set(0, 0);

    // Si sus métodos resize usan el centro para posicionarse,
    // ahora pásales 0,0 (centro local), junto con la escala global aplicada.
    this.overlaycontainer.resize(scaleToFit, 0, 0);
    this.reelcontainer.resize(scaleToFit, 0, 0, width, height);
  }
}
