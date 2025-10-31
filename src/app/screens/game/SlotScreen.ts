import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import type { Spritesheet } from "pixi.js";
import { Assets, Container, Sprite, Texture, Graphics, AnimatedSprite } from "pixi.js";

import { engine } from "../../getEngine";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { ResultEvaluator } from "../../slot/paytable/ResultEvaluator";
import type { EvaluationResult } from "../../slot/paytable/ResultEvaluator";
import { SLOT_PAYTABLE } from "../../slot/paytable/Paytable";
import { ReelManager } from "../../slot/reels/ReelManager";
import { SlotStateMachine } from "../../slot/state/SlotStateMachine";
import type { SlotState } from "../../slot/state/SlotStateMachine";
import { SpinController } from "../../slot/controllers/SpinController";

const REEL_CONFIG = {
  reels: 5,
  rows: 3,
  symbolSize: 150,
  rowSpacing: 16,
  reelSpacing: 26,
  padding: 12,
};

/**
 * Main gameplay screen for the slot machine demo.
 */
export class SlotScreen extends Container {
  public static assetBundles = ["preload", "main"];

  private readonly mainContainer: Container;
  private readonly hudContainer: Container;
  private background: Sprite;
  private overlay?: Sprite;
  private overlayOffset = { x: 0, y: 0 };   // offset en coords del fondo
  private overlayTarget = { w: 0, h: 0 };   // tamaño de la franja (coords fondo)
  private overlayMask?: Graphics;
  private readonly reelManager: ReelManager;
  private readonly resultEvaluator: ResultEvaluator;
  private readonly stateMachine: SlotStateMachine;
  private readonly spinController: SpinController;

  private readonly spinButton: Button;
  private readonly betUpButton: Button;
  private readonly betDownButton: Button;
  private readonly autoplayButton: FancyButton;
  private readonly balanceLabel: Label;
  private readonly betLabel: Label;
  private readonly winLabel: Label;
  private readonly stateLabel: Label;

  private readonly hudBackground: Graphics;

  private balance = 1_000;
  private bet = 10;
  private autoplay = false;

  constructor() {
    super();

    this.mainContainer = new Container();
    this.hudContainer = new Container();
    this.hudBackground = new Graphics();
    this.drawHudBackground(400, 160);
    this.hudBackground.pivot.set(200, 80);
    this.hudBackground.eventMode = "none";

    const spritesheet =
      (Assets.get("data-0.json") as Spritesheet | undefined) ??
      (Assets.get("main/images/data-0.json") as Spritesheet | undefined);
    const backgroundTexture =
      spritesheet?.textures?.["background.jpg"] ??
      Texture.from("background.jpg");

    this.background = new Sprite(backgroundTexture);
    this.background.anchor.set(0.5);
    this.addChildAt(this.background, 0);

    const region = { x: 190, y: 10, w: 1403, h: 297 };

    // Tamaño original de la textura del fondo:
    const bgW = this.background.texture.width;
    const bgH = this.background.texture.height;

    // Offset del centro de la franja respecto al centro del fondo:
    this.overlayOffset = {
      x: (region.x + region.w / 2) - (bgW / 2),
      y: (region.y + region.h / 2) - (bgH / 2),
    };

    // Guarda el tamaño objetivo de la franja:
    this.overlayTarget = { w: region.w, h: region.h };

    const overlayAnimation =
      spritesheet?.animations?.["baece685-156b-4425-8980-7af279ac9c1d"]

    if (!overlayAnimation) {
      throw new Error(`No existe la animación "baece685-156b-4425-8980-7af279ac9c1d" en sheet.animations`);
    }
    const animatedOverlay = new AnimatedSprite(overlayAnimation);
    animatedOverlay.anchor.set(0.5);
    animatedOverlay.blendMode = "add";
    animatedOverlay.animationSpeed = 0.1;
    animatedOverlay.play();
    this.overlay = animatedOverlay;
    this.addChild(animatedOverlay);

    this.resultEvaluator = new ResultEvaluator(SLOT_PAYTABLE);
    this.stateMachine = new SlotStateMachine();
    this.reelManager = new ReelManager({
      ...REEL_CONFIG,
      paytable: SLOT_PAYTABLE,
    });
    this.spinController = new SpinController({
      reelManager: this.reelManager,
      evaluator: this.resultEvaluator,
      stateMachine: this.stateMachine,
    });

    this.mainContainer.addChild(this.reelManager);
    this.addChild(this.mainContainer);

    this.balanceLabel = new Label({
      text: this.getBalanceText(),
      style: { fill: 0xf4f4f4, fontSize: 36 },
    });
    this.betLabel = new Label({
      text: this.getBetText(),
      style: { fill: 0xf4f4f4, fontSize: 32 },
    });
    this.winLabel = new Label({
      text: "Win: 0",
      style: { fill: 0x98ffb4, fontSize: 32 },
    });
    this.stateLabel = new Label({
      text: "Ready",
      style: { fill: 0xffffff, fontSize: 22 },
    });

    this.spinButton = new Button({ text: "SPIN", width: 220, height: 110 });
    this.spinButton.onPress.connect(() => void this.handleSpin());

    this.betUpButton = new Button({ text: "+", width: 110, height: 110 });
    this.betUpButton.onPress.connect(() => this.adjustBet(5));

    this.betDownButton = new Button({ text: "-", width: 110, height: 110 });
    this.betDownButton.onPress.connect(() => this.adjustBet(-5));

    this.autoplayButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
    });
    this.autoplayButton.onPress.connect(() => this.toggleAutoplay());

    this.hudContainer.addChild(
      this.hudBackground,
      this.balanceLabel,
      this.betLabel,
      this.winLabel,
      this.stateLabel,
      this.spinButton,
      this.betUpButton,
      this.betDownButton,
      this.autoplayButton,
    );
    this.addChild(this.hudContainer);

    this.stateMachine.onChange((next) => {
      this.updateHudState(next);
    });
  }

  public prepare() {
    this.reposition();
  }

  public update() {
    if (this.autoplay && this.stateMachine.current === "idle") {
      void this.handleSpin();
    }

    if (this.stateMachine.current === "counting") {
      this.winLabel.scale.set(1 + Math.sin(performance.now() / 200) * 0.05);
      this.winLabel.rotation = Math.sin(performance.now() / 150) * 0.04;
    } else {
      this.winLabel.scale.set(1);
      this.winLabel.rotation = 0;
    }
  }

  public async pause() {
    this.interactiveChildren = false;
  }

  public async resume() {
    this.interactiveChildren = true;
  }

  public resize(width: number, height: number) {
    this.mainContainer.position.set(width * 0.5, height * 0.45);
    const { width: reelWidth, height: reelHeight } = this.reelManager.getSize();
    this.reelManager.position.set(-reelWidth / 2, -reelHeight / 2);

    
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const texW = this.background.texture.width;
  const texH = this.background.texture.height;

  // Escala del fondo (tu lógica)
  const backgroundScale = Math.min(width / texW, height / texH);

  // Posición/escala del fondo
  this.background.position.set(centerX, centerY);
  this.background.scale.set(backgroundScale);

  // 👉 Overlay colocado en la franja
  if (this.overlay) {
    // 1) Posición: centro de pantalla + offset (en coords del fondo) * escala del fondo
    const ox = centerX + this.overlayOffset.x * backgroundScale;
    const oy = centerY + this.overlayOffset.y * backgroundScale;
    this.overlay.position.set(ox, oy);

    // 2) Escala: ajusta la animación para "llenar" la franja (cover)
    const frame0 = (this.overlay as AnimatedSprite).textures[0];
    const sFit = Math.max(
      this.overlayTarget.w / frame0.width,
      this.overlayTarget.h / frame0.height
    );
    this.overlay.scale.set(backgroundScale * sFit);

    // 3) Máscara para recortar exactamente al rectángulo de la franja
    if (!this.overlayMask) {
      this.overlayMask = new Graphics();
      this.addChild(this.overlayMask);
      this.overlay.mask = this.overlayMask;
    }

    const rw = this.overlayTarget.w * backgroundScale; // ancho en pantalla
    const rh = this.overlayTarget.h * backgroundScale; // alto en pantalla
    const radius = 16 * backgroundScale;               // ajusta si tu borde es redondeado

    this.overlayMask
      .clear()
      .roundRect(ox - rw / 2, oy - rh / 2, rw, rh, radius)
      .fill(0xffffff);
  }

    this.hudContainer.position.set(width * 0.5, height - 200);
    const hudWidth = Math.min(width * 0.9, 700);
    const hudHeight = 160;
    this.drawHudBackground(hudWidth, hudHeight);
    this.hudBackground.pivot.set(hudWidth / 2, hudHeight / 2);

    this.balanceLabel.position.set(-this.hudBackground.width / 2 + 120, -40);
    this.betLabel.position.set(-this.hudBackground.width / 2 + 120, 30);
    this.winLabel.position.set(0, -40);
    this.stateLabel.position.set(0, 36);

    this.spinButton.position.set(this.hudBackground.width / 2 - 120, 0);
    this.betUpButton.position.set(-40, 50);
    this.betDownButton.position.set(-160, 50);
    this.autoplayButton.position.set(this.hudBackground.width / 2 - 40, -50);
  }

  public async show() {
    this.alpha = 0;
    const animation = animate(this, { alpha: 1 } as ObjectTarget<this>, {
      duration: 0.6,
      ease: "easeOut",
    });
    await animation.finished;
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", {
      volume: 0.45,
      loop: true,
    });
  }

  public async hide() {
    const animation = animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.3,
    });
    await animation.finished;
    engine().audio.bgm.stop();
  }

  private async handleSpin() {
    if (this.stateMachine.current !== "idle") {
      return;
    }

    if (this.balance < this.bet) {
      this.stateLabel.text = "Add more credits";
      return;
    }

    this.balance -= this.bet;
    this.updateBalanceLabel();
    this.stateLabel.text = "Spinning";
    this.spinButton.interactiveChildren = false;
    this.spinButton.interactive = false;

    const evaluation = await this.spinController.startSpin(this.bet);
    await this.handleEvaluation(evaluation);
  }

  private async handleEvaluation(evaluation: EvaluationResult) {
    this.winLabel.text = `Win: ${evaluation.totalWin}`;
    if (evaluation.totalWin > 0) {
      this.balance += evaluation.totalWin;
      this.updateBalanceLabel();
      await this.highlightWins(evaluation);
    }

    await this.spinController.finishCounting();
    this.winLabel.scale.set(1);
    this.winLabel.rotation = 0;
    this.stateLabel.text = this.autoplay ? "Auto" : "Ready";
    this.spinButton.interactiveChildren = true;
    this.spinButton.interactive = true;
  }

  private async highlightWins(evaluation: EvaluationResult) {
    for (const lineWin of evaluation.lineWins) {
      this.stateLabel.text = `${lineWin.line.name}: ${lineWin.symbol.label} x${lineWin.count}`;
      engine().audio.sfx.play("main/sounds/sfx-hover.wav");
      const up = animate(
        this.winLabel,
        { scale: { x: 1.2, y: 1.2 } } as ObjectTarget<Label>,
        { duration: 0.2, ease: "easeOut" },
      );
      await up.finished;
      const down = animate(
        this.winLabel,
        { scale: { x: 1, y: 1 } } as ObjectTarget<Label>,
        { duration: 0.2, ease: "easeIn" },
      );
      await down.finished;
    }
  }

  private adjustBet(delta: number) {
    const newBet = Math.max(1, this.bet + delta);
    this.bet = Math.min(newBet, 100);
    this.updateBetLabel();
  }

  private toggleAutoplay() {
    this.autoplay = !this.autoplay;
    this.stateLabel.text = this.autoplay ? "Auto" : "Ready";
    this.autoplayButton.scale.set(this.autoplay ? 1.2 : 1);
  }

  private drawHudBackground(width: number, height: number) {
    this.hudBackground.clear();
    this.hudBackground
      .roundRect(0, 0, width, height, 24)
      .fill({ color: 0x12122a, alpha: 0.9 })
      .stroke({ color: 0xffffff, width: 2, alpha: 0.12 });
  }

  private getBalanceText() {
    return `Balance: ${this.balance}`;
  }

  private getBetText() {
    return `Bet: ${this.bet}`;
  }

  private updateBetLabel() {
    this.betLabel.text = this.getBetText();
  }

  private updateBalanceLabel() {
    this.balanceLabel.text = this.getBalanceText();
  }

  private updateHudState(next: SlotState) {
    switch (next) {
      case "idle":
        this.stateLabel.text = this.autoplay ? "Auto" : "Ready";
        break;
      case "spinning":
        this.stateLabel.text = "Spinning";
        break;
      case "counting":
        this.stateLabel.text = "Counting";
        break;
      case "feature":
        this.stateLabel.text = "Feature";
        break;
    }
  }

  private reposition() {
    const { width, height } = this.reelManager.getSize();
    this.reelManager.position.set(-width / 2, -height / 2);
  }
}
