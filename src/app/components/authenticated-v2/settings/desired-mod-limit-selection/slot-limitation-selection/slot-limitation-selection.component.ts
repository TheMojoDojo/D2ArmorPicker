/*
 * Copyright (c) 2023 D2ArmorPicker by Mijago.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { MAXIMUM_STAT_MOD_AMOUNT } from "../../../../../data/constants";
import { ArmorSlot } from "../../../../../data/enum/armor-slot";
import { ConfigurationService } from "../../../../../services/configuration.service";
import {
  ArmorPerkOrSlot,
  ArmorPerkOrSlotNames,
  StatModifier,
} from "../../../../../data/enum/armor-stat";
import { DestinyClass } from "bungie-api-ts/destiny2";
import { InventoryService } from "../../../../../services/inventory.service";
import { DatabaseService } from "../../../../../services/database.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { environment } from "../../../../../../environments/environment";
import { ItemIconServiceService } from "src/app/services/item-icon-service.service";
import { ModUrl } from "../../../results/table-mod-display/table-mod-display.component";

@Component({
  selector: "app-slot-limitation-selection",
  templateUrl: "./slot-limitation-selection.component.html",
  styleUrls: ["./slot-limitation-selection.component.scss"],
})
export class SlotLimitationSelectionComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly featureDisabled = !environment.featureFlags.enableModslotLimitation;
  readonly ModUrls = ModUrl;
  readonly StatModifier = StatModifier;
  readonly ArmorSlot = ArmorSlot;
  readonly ArmorPerkOrSlotNames = ArmorPerkOrSlotNames;
  readonly ArmorPerkOrSlot = ArmorPerkOrSlot;
  readonly ModRange = new Array(MAXIMUM_STAT_MOD_AMOUNT + 1);
  selection: number = MAXIMUM_STAT_MOD_AMOUNT;

  @Input()
  slot: ArmorSlot = ArmorSlot.ArmorSlotHelmet;
  @Output()
  possible: EventEmitter<boolean> = new EventEmitter<boolean>();

  fixedExoticInThisSlot: boolean = false;
  isPossible: boolean = true;
  configSelectedClass: DestinyClass = DestinyClass.Titan;
  configAssumeLegendaryIsArtifice: boolean = false;
  configSelectedExoticSum: number = 0;
  configSelectedExotic: number[] = [];
  configAssumeClassItemIsArtifice: boolean = false;
  configAssumeExoticIsArtifice: boolean = false;
  armorPerk: ArmorPerkOrSlot = ArmorPerkOrSlot.None;
  armorPerkLock: boolean = false;
  maximumModSlots: number = 5;

  hoveredSlot: number = -1;

  disabled: boolean = false;

  readonly availableArmorPerks = [
    ArmorPerkOrSlot.None,
    ArmorPerkOrSlot.SlotEidosApprentice,
    ArmorPerkOrSlot.SlotSalvationsEdge,
    ArmorPerkOrSlot.SlotCrotasEnd,
    ArmorPerkOrSlot.SlotRootOfNightmares,
    ArmorPerkOrSlot.SlotKingsFall,
    ArmorPerkOrSlot.SlotVowOfTheDisciple,
    ArmorPerkOrSlot.SlotVaultOfGlass,
    ArmorPerkOrSlot.SlotDeepStoneCrypt,
    ArmorPerkOrSlot.SlotGardenOfSalvation,
    ArmorPerkOrSlot.SlotLastWish,
    ArmorPerkOrSlot.SlotArtifice,
    ArmorPerkOrSlot.PerkEchoesOfGlory,
    ArmorPerkOrSlot.PerkIronBanner,
    ArmorPerkOrSlot.SlotNightmare,
  ];

  constructor(
    public config: ConfigurationService,
    public inventory: InventoryService,
    private iconService: ItemIconServiceService,
    private db: DatabaseService
  ) {}

  public async runPossibilityCheck() {
    if (
      this.configAssumeLegendaryIsArtifice ||
      (this.slot == ArmorSlot.ArmorSlotClass && this.configAssumeClassItemIsArtifice)
    ) {
      this.isPossible = true;
    } else {
      const mustCheckArmorPerk = this.armorPerkLock && this.armorPerk != ArmorPerkOrSlot.None;

      let results = 0;
      if (mustCheckArmorPerk) {
        // check if the current slot is locked to a specific exotic
        if (this.fixedExoticInThisSlot) {
          if (this.armorPerk == ArmorPerkOrSlot.SlotArtifice && this.configAssumeExoticIsArtifice) {
            results += 1;
          } else {
            this.configSelectedExotic.forEach(async (exoticHash) => {
              var exotics = await this.db.inventoryArmor
                .where("clazz")
                .equals(this.configSelectedClass)
                .and((f) => f.perk == this.armorPerk)
                .and((f) => f.hash == exoticHash)
                .and((f) => f.isExotic == 1)
                .count();
              results += exotics;
              this.isPossible = results > 0;
              this.possible.next(this.isPossible);
            });
          }
        } else {
          results += await this.db.inventoryArmor
            .where("clazz")
            .equals(this.configSelectedClass)
            .and((f) => this.configSelectedExoticSum == 0 || f.isExotic == 0)
            .and((f) => f.slot == this.slot)
            .and((f) => f.perk == this.armorPerk)
            .count();
          this.isPossible = results > 0;
        }
      } else {
        this.isPossible = true;
      }
    }
    this.possible.next(this.isPossible);
  }

  get slotName(): string {
    switch (this.slot) {
      case ArmorSlot.ArmorSlotHelmet:
        return "Helmet";
      case ArmorSlot.ArmorSlotGauntlet:
        return "Gauntlet";
      case ArmorSlot.ArmorSlotChest:
        return "Chest";
      case ArmorSlot.ArmorSlotLegs:
        return "Leg";
      case ArmorSlot.ArmorSlotClass:
        return "Class Item";
      default:
        return "";
    }
  }

  ngOnInit(): void {
    this.config.configuration.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (c) => {
      const newExoticSum = c.selectedExotics.reduce((acc, x) => acc + x, 0);

      var mustRunPossibilityCheck =
        this.configSelectedClass != (c.characterClass as unknown as DestinyClass) ||
        this.configAssumeLegendaryIsArtifice != c.assumeEveryLegendaryIsArtifice ||
        this.configAssumeExoticIsArtifice != c.assumeEveryExoticIsArtifice ||
        this.configAssumeClassItemIsArtifice != c.assumeClassItemIsArtifice ||
        this.selection != c.maximumModSlots[this.slot].value ||
        this.armorPerk != c.armorPerks[this.slot].value ||
        this.armorPerkLock != c.armorPerks[this.slot].fixed ||
        this.configSelectedExoticSum != newExoticSum ||
        this.maximumModSlots != c.maximumModSlots[this.slot].value;

      this.configAssumeLegendaryIsArtifice = c.assumeEveryLegendaryIsArtifice;
      this.configAssumeExoticIsArtifice = c.assumeEveryExoticIsArtifice;
      this.configAssumeClassItemIsArtifice = c.assumeClassItemIsArtifice;
      this.configSelectedClass = c.characterClass as unknown as DestinyClass;
      this.selection = c.maximumModSlots[this.slot].value;
      this.armorPerk = c.armorPerks[this.slot].value;
      this.armorPerkLock = c.armorPerks[this.slot].fixed;
      this.maximumModSlots = c.maximumModSlots[this.slot].value;
      this.configSelectedExoticSum = newExoticSum;
      this.configSelectedExotic = c.selectedExotics;

      this.fixedExoticInThisSlot =
        (await this.inventory.getExoticsForClass(c.characterClass))
          .filter((x) => c.selectedExotics.indexOf(x.item.hash) > -1)
          .map((e) => e.item.slot)
          .indexOf(this.slot) > -1;

      if (mustRunPossibilityCheck) await this.runPossibilityCheck();
    });
  }

  ngAfterViewInit(): void {
    if (
      environment.featureFlags.enableGuardianGamesFeatures &&
      this.slot === ArmorSlot.ArmorSlotClass
    ) {
      this.availableArmorPerks.splice(1, 0, ArmorPerkOrSlot.GuardianGamesClassItem);
    }
  }

  toggleArmorPerkLock() {
    this.config.modifyConfiguration((c) => {
      c.armorPerks[this.slot].fixed = !c.armorPerks[this.slot].fixed;
    });
  }

  setArmorPerk(perk: ArmorPerkOrSlot) {
    if (this.armorPerk != perk)
      this.config.modifyConfiguration((c) => {
        c.armorPerks[this.slot].value = perk;
      });
  }

  setValue(i: number) {
    if (this.featureDisabled) return;
    if (this.maximumModSlots == i) return;

    this.maximumModSlots = i;
    this.config.modifyConfiguration((c) => (c.maximumModSlots[this.slot].value = i));
  }

  async getStatIconUrl(statHash: number) {
    const item = await this.iconService.getItemCached(statHash);
    return item?.icon;
  }

  private ngUnsubscribe = new Subject();

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
