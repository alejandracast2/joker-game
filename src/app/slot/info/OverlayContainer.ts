import { Container, AnimatedSprite, Graphics } from "pixi.js";

export class OverlayContainer extends Container {
  private overlayMask: Graphics;
  private region = { x: 191, y: 16, w: 1403, h: 290 };
  private overlay: AnimatedSprite;
  private overlayOffset = { x: 0, y: 0 };  // desplazamiento local desde el centro del fondo
  private overlayTarget = { w: 0, h: 0 };  // tamaño objetivo (en px del asset, sin escalar)

  constructor(spritesheet: any, bgW: number, bgH: number) {
    super();

    // Calculamos el desplazamiento desde el centro del fondo hasta el centro de la región:
    // (antes ya lo hacías, esto sigue siendo válido)
    this.overlayOffset = {
      x: (this.region.x + this.region.w / 2) - (bgW / 2),
      y: (this.region.y + this.region.h / 2) - (bgH / 2),
    };

    // El tamaño objetivo de la máscara/overlay se mantiene en unidades "asset"
    this.overlayTarget = { w: this.region.w, h: this.region.h };

    const overlayAnimation =
      spritesheet?.animations?.["baece685-156b-4425-8980-7af279ac9c1d"];
    if (!overlayAnimation) {
      throw new Error(
        `No existe la animación "baece685-156b-4425-8980-7af279ac9c1d" en sheet.animations`
      );
    }

    const animatedOverlay = new AnimatedSprite(overlayAnimation);
    animatedOverlay.anchor.set(0.5);
    animatedOverlay.blendMode = "add";
    animatedOverlay.animationSpeed = 0.1;
    animatedOverlay.play();

    this.overlay = animatedOverlay;
    this.addChild(animatedOverlay);

    // Máscara (en coordenadas locales)
    this.overlayMask = new Graphics();
    this.addChild(this.overlayMask);
    this.overlay.mask = this.overlayMask;
  }

  /**
   * NUEVO: ya no necesitas centerX/centerY ni backgroundScale,
   * porque el padre (mainContainer) se encarga de centrar y escalar.
   * Mantengo la firma para compatibilidad, pero se ignoran los parámetros.
   */
  resize() {
    // 1) Posicionar el overlay en el centro de la región, en coords locales (0,0 = centro del fondo)
    const ox = this.overlayOffset.x;
    const oy = this.overlayOffset.y;
    this.overlay.position.set(ox, oy);

    // 2) Escalar overlay para "cover" dentro del área target (solo ajuste relativo al propio asset)
    const frame0 = this.overlay.textures[0];
    const sFit = Math.max(
      this.overlayTarget.w / frame0.width,
      this.overlayTarget.h / frame0.height
    );
    this.overlay.scale.set(sFit); // ¡OJO! Sin multiplicar por backgroundScale

    // 3) Dibujar máscara con bordes redondeados en coords locales
    const rw = this.overlayTarget.w;
    const rh = this.overlayTarget.h;
    const radius = 16;

    this.overlayMask
      .clear()
      .roundRect(ox - rw / 2, oy - rh / 2, rw, rh, radius)
      .fill(0xffffff);
  }
}
