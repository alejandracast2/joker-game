import { Container, Texture, Sprite, Graphics, BlurFilter } from "pixi.js";

export class DownContainer extends Container {
    private region = { x: 138, y: 869, w: 1485, h: 130 };
    private downWrap: Container;
    private reelOffset = { x: 0, y: 0 };
    private buttonbet: Sprite;
    private flechabet: Sprite;
    private add: Sprite;
    private rest: Sprite;

    constructor(bgW: number, bgH: number) {
        super();
        this.downWrap = new Container();
        this.addChild(this.downWrap);

        // contenedor para botón + flecha
        const buttonContainer = new Container();
        this.downWrap.addChild(buttonContainer);

        // botón
        const button = Texture.from("boton.png")
        this.buttonbet = new Sprite(button);
        this.buttonbet.anchor.set(0.5);
        this.buttonbet.scale.set(0.95)
        buttonContainer.addChild(this.buttonbet);

        // flecha
        const flecha = Texture.from("fechas.png")
        this.flechabet = new Sprite(flecha);
        this.flechabet.anchor.set(0.43, 0.37);
        this.flechabet.scale.set(0.6);
        buttonContainer.addChild(this.flechabet);

        buttonContainer.x = 484;
        buttonContainer.y = -40;
        
        //sumar
        const sumar = Texture.from("add.png");
        this.add = new Sprite(sumar);
        this.add.anchor.y=0.95;
        this.add.scale.set(0.7)
        this.downWrap.addChild(this.add)
        // this.add.y = 0;
        this.add.x = 600;

        //restar
        const restar = Texture.from("rest.png");
        this.rest = new Sprite(restar);
        this.rest.anchor.y=0.95;
        this.rest.scale.set(0.7)
        this.downWrap.addChild(this.rest)
        this.rest.x=320;

        //turbo
        const turboContainer = new Container();
        buttonContainer.addChild(turboContainer);

        // Cargar las 3 imágenes
        const t1 = new Sprite(Texture.from("turbo1.png"));
        const t2 = new Sprite(Texture.from("union.png"));
        const t3 = new Sprite(Texture.from("center.png"));
        const t4 = new Sprite(Texture.from("end.png"));


        // (Opcional) si quieres centrar vertical
        t1.anchor.y = 0.5;
        t2.anchor.y = 0.5;
        t3.anchor.y = 0.5;
        t4.anchor.y = 0.5;

        // Colocarlas pegadas una junto a otra (sin separación)
        t1.x = 0;
        t2.x = 27;                 // pegado a la derecha de t1
        t3.x = 27 + 3;      // pegado a la derecha de t2
        t4.x = 28 + 3+95;      // pegado a la derecha de t2
        
        // Añadirlas al contenedor
        turboContainer.addChild(t1, t2, t3,t4);

        turboContainer.x=-80;
        turboContainer.y=85;

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