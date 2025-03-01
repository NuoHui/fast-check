import fc from '../../../lib/fast-check';

import { unicodeJsonValue, JsonSharedConstraints } from '../../../src/arbitrary/unicodeJsonValue';
import {
  assertProduceCorrectValues,
  assertProduceSameValueGivenSameSeed,
  assertProduceValuesShrinkableWithoutContext,
  assertShrinkProducesSameValueWithoutInitialContext,
} from './__test-helpers__/ArbitraryAssertions';
import { computeObjectDepth } from './__test-helpers__/ComputeObjectDepth';
import { isObjectWithNumericKeys } from './__test-helpers__/ObjectWithNumericKeys';
import { sizeArb } from './__test-helpers__/SizeHelpers';

describe('unicodeJsonValue (integration)', () => {
  type Extra = JsonSharedConstraints | undefined;
  const extraParameters: fc.Arbitrary<Extra> = fc.option(
    fc
      .record(
        {
          depthSize: fc.oneof(fc.double({ min: 0.1, noNaN: true }), sizeArb),
          maxDepth: fc.nat({ max: 5 }),
        },
        { requiredKeys: [] }
      )
      .filter((ct) => ct.depthSize === undefined || ct.depthSize <= 10 || ct.maxDepth !== undefined),
    { nil: undefined }
  );

  const isCorrect = (v: unknown, extra: Extra) => {
    expect(JSON.parse(fc.stringify(v))).toEqual(v); // JSON.stringify does not handle the -0 properly
    if (extra !== undefined && extra.maxDepth !== undefined) {
      expect(computeObjectDepth(v)).toBeLessThanOrEqual(extra.maxDepth);
    }
  };

  const unicodeJsonValueBuilder = (extra: Extra) => unicodeJsonValue(extra);

  it('should produce the same values given the same seed', () => {
    assertProduceSameValueGivenSameSeed(unicodeJsonValueBuilder, { extraParameters });
  });

  it('should only produce correct values', () => {
    assertProduceCorrectValues(unicodeJsonValueBuilder, isCorrect, { extraParameters });
  });

  it('should produce values seen as shrinkable without any context', () => {
    assertProduceValuesShrinkableWithoutContext(unicodeJsonValueBuilder, { extraParameters });
  });

  // Property: should be able to shrink to the same values without initial context
  // Is partially applicable given the fact that: Object.keys() has a specific handling of integer keys over string ones.
  // eg.: Object.keys({"2": "2", "0": "0", "C": "C", "A": "A", "B": "B", "1": "1"}) -> ["0", "1", "2", "C", "A", "B"]
  // As a consequence there is no way to rebuild the source array of tuples (key, value) in the right order in such case (when numerics).
  it('should be able to shrink to the same values without initial context', () => {
    assertShrinkProducesSameValueWithoutInitialContext(
      (extra) => unicodeJsonValueBuilder(extra).filter((o) => !isObjectWithNumericKeys(o)),
      { extraParameters }
    );
  });
});
