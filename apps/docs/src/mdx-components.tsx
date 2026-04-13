import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import * as Twoslash from 'fumadocs-twoslash/ui';
import { SideBySide } from './components/side-by-side';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...Twoslash,
    SideBySide,
    ...components,
  };
}
