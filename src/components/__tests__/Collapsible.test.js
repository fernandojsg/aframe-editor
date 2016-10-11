import React from 'react';
import renderer from 'react-test-renderer';

import Collapsible from '../Collapsible.js';

describe('Collapsible', () => {
 it('does not set class when not collapsed', () => {
    const tree = renderer.create(
      <Collapsible collapsed={false}>
        <div/><div/>
      </Collapsible>
    ).toJSON();
    expect(tree.children[1].props.className).not.toContain('hide');
  });

  it('sets class when collapsed', () => {
    const tree = renderer.create(
      <Collapsible collapsed={true}>
        <div/><div/>
      </Collapsible>
    ).toJSON();
    expect(tree.children[1].props.className).toContain('hide');
  });
});
