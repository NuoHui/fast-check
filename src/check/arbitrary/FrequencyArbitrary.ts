import Random from '../../random/generator/Random';
import Arbitrary from './definition/Arbitrary';
import Shrinkable from './definition/Shrinkable';
import { nat } from './IntegerArbitrary';

export interface WeightedArbitrary<T> {
  weight: number;
  arbitrary: Arbitrary<T>;
}

class FrequencyArbitrary<T> extends Arbitrary<T> {
  readonly summedWarbs: WeightedArbitrary<T>[];
  readonly idArb: Arbitrary<number>;
  constructor(readonly warbs: WeightedArbitrary<T>[]) {
    super();
    this.summedWarbs = warbs
      .reduce(
        (p: WeightedArbitrary<T>[], c) =>
          p.concat({
            weight: p[p.length - 1].weight + c.weight,
            arbitrary: c.arbitrary
          }),
        [{ weight: 0, arbitrary: warbs[0].arbitrary }]
      )
      .slice(1);
    this.idArb = nat(this.summedWarbs[this.summedWarbs.length - 1].weight - 1);
  }
  generate(mrng: Random): Shrinkable<T> {
    const selected = this.idArb.generate(mrng).value;
    return this.summedWarbs.find(warb => selected < warb.weight)!.arbitrary.generate(mrng);
  }
}

/**
 * Arbitrary producing one of the values generated by `warb0` or `...warbs`.
 * The probability of selecting the ith warb is of warb[i].weight / sum(warb[j].weight)
 *
 * @param warb0 One of the (Arbitrary, weight) that might be called to produce a value
 * @param warbs Other possible (Arbitrary, weight)
 */
function frequency<T>(warb0: WeightedArbitrary<T>, ...warbs: WeightedArbitrary<T>[]): Arbitrary<T> {
  return new FrequencyArbitrary([warb0, ...warbs]);
}

export { frequency };
