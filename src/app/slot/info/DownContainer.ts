import { Container, Texture, Sprite, Graphics, BlurFilter } from "pixi.js";

export class DownContainer extends Container {
    private region = { x: 138, y: 869, w: 1485, h: 130 };
    private downWrap: Container;
    private reelOffset = { x: 0, y: 0 };
    private buttonbet: Sprite;
    private flechabet:Sprite;
    
    constructor(bgW: number, bgH: number) {
        super();
        this.downWrap = new Container();
        this.addChild(this.downWrap);

        const button = Texture.from("boton.png")
        this.buttonbet = new Sprite(button);
        this.buttonbet.anchor.set(0.5);
        this.downWrap.addChild(this.buttonbet);
        // this.buttonbet.blendMode="add";
        // this.buttonbet.alpha=0.3;
        this.buttonbet.y=-40;
        this.buttonbet.x=490;

        const flecha = Texture.from("fechas.png")
        this.flechabet = new Sprite(flecha);
        this.flechabet.anchor.set(0.5);
        this.flechabet.scale.set(0.6);

        this.downWrap.addChild(this.flechabet);
        // this.buttonbet.blendMode="add";
        // this.buttonbet.alpha=0.3;
        this.flechabet.y=-30;
        this.flechabet.x=500;



        this.reelOffset = {
            x: (this.region.x + this.region.w / 2) - (bgW / 2),
            y: (this.region.y + this.region.h / 2) - (bgH / 2),
        };
    }
    resize() {
        const { x: ox, y: oy } = this.reelOffset;
        // ANTES: this.reel.position.set(ox, oy);
        // AHORA: mover el WRAPPER
        this.downWrap.position.set(ox, oy);
    }
}