import * as assert from 'assert';
import { pluralize } from '../../utils/plural.js';

suite('Plural Utils Test Suite', () => {
  suite('pluralize', () => {
    test('should pluralize regular nouns by adding "s"', () => {
      assert.strictEqual(pluralize('cat'), 'cats');
      assert.strictEqual(pluralize('dog'), 'dogs');
      assert.strictEqual(pluralize('car'), 'cars');
      assert.strictEqual(pluralize('book'), 'books');
    });

    test('should pluralize nouns ending in "y" preceded by consonant to "ies"', () => {
      assert.strictEqual(pluralize('city'), 'cities');
      assert.strictEqual(pluralize('baby'), 'babies');
      assert.strictEqual(pluralize('story'), 'stories');
      assert.strictEqual(pluralize('party'), 'parties');
    });

    test('should pluralize nouns ending in "y" preceded by vowel by adding "s"', () => {
      assert.strictEqual(pluralize('boy'), 'boys');
      assert.strictEqual(pluralize('key'), 'keys');
      assert.strictEqual(pluralize('day'), 'days');
      assert.strictEqual(pluralize('toy'), 'toys');
    });

    test('should pluralize nouns ending in "s", "sh", "ch", "x", or "z" by adding "es"', () => {
      assert.strictEqual(pluralize('bus'), 'buses');
      assert.strictEqual(pluralize('brush'), 'brushes');
      assert.strictEqual(pluralize('church'), 'churches');
      assert.strictEqual(pluralize('box'), 'boxes');
      assert.strictEqual(pluralize('quiz'), 'quizzes');
    });

    test('should handle irregular plurals', () => {
      assert.strictEqual(pluralize('person'), 'people');
      assert.strictEqual(pluralize('child'), 'children');
      assert.strictEqual(pluralize('man'), 'men');
      assert.strictEqual(pluralize('woman'), 'women');
      assert.strictEqual(pluralize('tooth'), 'teeth');
      assert.strictEqual(pluralize('foot'), 'feet');
      assert.strictEqual(pluralize('mouse'), 'mice');
      assert.strictEqual(pluralize('goose'), 'geese');
    });

    test('should handle database-related irregular plurals', () => {
      assert.strictEqual(pluralize('datum'), 'data');
      assert.strictEqual(pluralize('index'), 'indices');
      assert.strictEqual(pluralize('vertex'), 'vertices');
      assert.strictEqual(pluralize('matrix'), 'matrices');
      assert.strictEqual(pluralize('analysis'), 'analyses');
      assert.strictEqual(pluralize('basis'), 'bases');
      assert.strictEqual(pluralize('crisis'), 'crises');
      assert.strictEqual(pluralize('thesis'), 'theses');
    });

    test('should handle unchanged plurals', () => {
      assert.strictEqual(pluralize('sheep'), 'sheep');
      assert.strictEqual(pluralize('deer'), 'deer');
      assert.strictEqual(pluralize('fish'), 'fish');
      assert.strictEqual(pluralize('moose'), 'moose');
      assert.strictEqual(pluralize('series'), 'series');
      assert.strictEqual(pluralize('species'), 'species');
    });

    test('should handle Rails model common names', () => {
      assert.strictEqual(pluralize('user'), 'users');
      assert.strictEqual(pluralize('post'), 'posts');
      assert.strictEqual(pluralize('comment'), 'comments');
      assert.strictEqual(pluralize('article'), 'articles');
      assert.strictEqual(pluralize('category'), 'categories');
      assert.strictEqual(pluralize('tag'), 'tags');
    });

    test('should be case-sensitive for irregular plurals', () => {
      assert.strictEqual(pluralize('Person'), 'people');
      assert.strictEqual(pluralize('CHILD'), 'children');
      assert.strictEqual(pluralize('Man'), 'men');
    });

    test('should handle compound words in Rails models', () => {
      // These should follow regular rules since they're not in IRREGULARS
      assert.strictEqual(pluralize('blog_post'), 'blog_posts');
      assert.strictEqual(pluralize('user_profile'), 'user_profiles');
    });
  });
});
