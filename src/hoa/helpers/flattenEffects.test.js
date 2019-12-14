import test from 'ava';
import { flattenEffects } from './flattenEffects';

const FakeFX = () => {};
const Fake = (props = {}) => [FakeFX, props];

test('with one effect returns an array with only that effect', (t) => {
  const effect = Fake();

  t.deepEqual(flattenEffects(effect), [effect]);
});

test('with no effect returns an empty array', (t) => {
  t.deepEqual(flattenEffects(null), []);
});

test('with a flat array of effects, returns those effects', (t) => {
  const effects = [
    Fake(1),
    Fake(2),
  ];

  t.deepEqual(flattenEffects(effects), effects);
});

test('with a nested array of effects, returns a flattened list of effects', (t) => {
  const effects = [
    Fake(1),
    [
      Fake(2),
      Fake(3),
      [Fake(4)],
    ],
  ];

  t.deepEqual(flattenEffects(effects), [
    Fake(1),
    Fake(2),
    Fake(3),
    Fake(4),
  ]);
});

test('ignores non-effect data', (t) => {
  const effects = [
    Fake(1),
    [
      false,
      Fake(3),
      [Fake(4)],
    ],
  ];

  t.deepEqual(flattenEffects(effects), [
    Fake(1),
    Fake(3),
    Fake(4),
  ]);
});
