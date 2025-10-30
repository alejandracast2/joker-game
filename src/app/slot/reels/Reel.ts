import { Container, Graphics } from "pixi.js";

import type { SymbolDefinition } from "../paytable/Paytable";
import { delay } from "../../utils/delay";
import { SymbolView } from "./Symbol";

export interface ReelOptions {
  rows: number;
  size: number;
  padding: number;
  availableSymbols: SymbolDefinition[];
}

interface SpinOptions {
  delay?: number;
  cycles?: number;
  stepDuration?: number;
}

/**
 * Represents a single reel column with symbol placeholders.
 */
export class Reel extends Container {
  public readonly options: ReelOptions;
  private readonly maskGraphics: Graphics;
  private readonly background: Graphics;
  private readonly symbolContainer: Container;
  private readonly symbolViews: SymbolView[] = [];

  constructor(options: ReelOptions) {
    super();
    this.options = options;

    this.background = new Graphics()
      .roundRect(
        -options.padding,
        -options.padding,
        options.size + options.padding * 2,
        options.rows * options.size + options.padding * 2,
        24,
      )
      .fill({ color: 0x0d0d1d, alpha: 0.85 })
      .stroke({ width: 4, color: 0xffffff, alpha: 0.06 });
    this.addChild(this.background);

    this.maskGraphics = new Graphics()
      .roundRect(
        -options.padding,
        -options.padding,
        options.size + options.padding * 2,
        options.rows * options.size + options.padding * 2,
        24,
      )
      .fill({ color: 0xffffff });

    this.symbolContainer = new Container();
    this.symbolContainer.mask = this.maskGraphics;
    this.maskGraphics.visible = false;
    this.addChild(this.symbolContainer, this.maskGraphics);

    for (let row = 0; row < options.rows; row++) {
      const definition = this.randomDefinition();
      const view = new SymbolView(definition, options.size);
      view.y = row * options.size;
      this.symbolViews.push(view);
      this.symbolContainer.addChild(view);
    }
  }

  public layout(rowSpacing: number) {
    for (let index = 0; index < this.symbolViews.length; index++) {
      const view = this.symbolViews[index];
      view.y = index * (this.options.size + rowSpacing);
    }

    const contentHeight =
      this.symbolViews.length * (this.options.size + rowSpacing) - rowSpacing;

    const totalHeight = contentHeight + this.options.padding * 2;
    this.background.height = totalHeight;
    this.maskGraphics.height = totalHeight;
    this.maskGraphics.y = 0;
    this.background.y = 0;
  }

  public get reelHeight(): number {
    return this.background.height;
  }

  public get reelWidth(): number {
    return this.options.size + this.options.padding * 2;
  }

  public getVisibleDefinitions(): SymbolDefinition[] {
    return this.symbolViews.map((view) => view.definition);
  }

  public setDefinitions(definitions: SymbolDefinition[]) {
    for (let index = 0; index < this.symbolViews.length; index++) {
      const view = this.symbolViews[index];
      const definition = definitions[index] ?? this.randomDefinition();
      view.applyDefinition(definition, this.options.size);
    }
  }

  public randomize() {
    for (const view of this.symbolViews) {
      view.applyDefinition(this.randomDefinition(), this.options.size);
    }
  }

  public async spinTo(
    definitions: SymbolDefinition[],
    options: SpinOptions = {},
  ) {
    const { delay: delayMs = 0, cycles = 3, stepDuration = 90 } = options;

    if (delayMs > 0) {
      await delay(delayMs);
    }

    for (let cycle = 0; cycle < cycles; cycle++) {
      this.randomize();
      await delay(stepDuration);
    }

    this.setDefinitions(definitions);
  }

  private randomDefinition(): SymbolDefinition {
    const { availableSymbols } = this.options;
    return availableSymbols[
      Math.floor(Math.random() * availableSymbols.length)
    ];
  }
}
