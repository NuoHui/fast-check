import * as loremIpsum from 'lorem-ipsum';

import Random from '../../random/generator/Random';
import Arbitrary from './definition/Arbitrary';
import Shrinkable from './definition/Shrinkable';
import { nat } from './IntegerArbitrary';

class LoremArbitrary extends Arbitrary<string> {
  readonly arbWordsCount: Arbitrary<number>;
  readonly sentencesMode: boolean;
  constructor(maxWordsCount?: number, sentencesMode?: boolean) {
    super();
    this.arbWordsCount = nat(maxWordsCount || 5);
    this.sentencesMode = sentencesMode || false;
  }
  generate(mrng: Random): Shrinkable<string> {
    const numWords = this.arbWordsCount.generate(mrng).value;
    const loremString = loremIpsum({
      count: numWords,
      units: this.sentencesMode ? 'sentences' : 'words',
      random: () => mrng.nextDouble()
    });
    return new Shrinkable(loremString);
  }
}

/**
 * Arbitrary producing lorem ipsum string of words
 *
 * WARNING: It cannot be shrunk
 */
function lorem(): Arbitrary<string>;
/**
 * Arbitrary producing lorem ipsum string of words
 *
 * WARNING: It cannot be shrunk
 * @param maxWordsCount Upper bound of the number of words allowed
 */
function lorem(maxWordsCount: number): Arbitrary<string>;
/**
 * Arbitrary producing lorem ipsum string of words
 *
 * WARNING: It cannot be shrunk
 * @param maxWordsCount Upper bound of the number of words/sentences allowed
 * @param sentencesMode If enabled, multiple sentences might be generated
 */
function lorem(maxWordsCount: number, sentencesMode: boolean): Arbitrary<string>;
function lorem(maxWordsCount?: number, sentencesMode?: boolean): Arbitrary<string> {
  return new LoremArbitrary(maxWordsCount, sentencesMode);
}

export { lorem };
