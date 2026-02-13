import { Container, Graphics, Text } from "pixi.js";

import type { SymbolDefinition } from "../paytable/Paytable";

const SYMBOL_BORDER_RADIUS = 18;

/**
 * Simple visual representation for a slot symbol.
 */
export class SymbolView extends Container {
  public readonly background: Graphics;
  public readonly textLabel: Text;
  public definition: SymbolDefinition;

  constructor(definition: SymbolDefinition, size: number) {
    super();

    this.definition = definition;
    this.background = new Graphics();
    this.addChild(this.background);

    this.textLabel = new Text(definition.label, {
      fill: 0xffffff,
      fontSize: Math.round(size * 0.4),
      fontWeight: "700",
    });
    this.textLabel.anchor.set(0.5);
    this.textLabel.position.set(size / 2, size / 2);
    this.addChild(this.textLabel);

    this.drawBackground(size, definition);
    this.eventMode = "none";
  }

  public applyDefinition(definition: SymbolDefinition, size: number) {
    this.definition = definition;
    this.drawBackground(size, definition);
    this.textLabel.text = definition.label;
  }

  private drawBackground(size: number, definition: SymbolDefinition) {
    this.background.clear();
    this.background
      .roundRect(0, 0, size, size, SYMBOL_BORDER_RADIUS)
      .fill({ color: definition.color, alpha: 0.95 })
      .stroke({ width: 4, color: 0xffffff, alpha: 0.6 });
  }
}
