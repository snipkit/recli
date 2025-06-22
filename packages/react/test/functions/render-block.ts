import { KhulnasoftElement } from '@khulnasoft.com/sdk';

export const el = (options?: Partial<KhulnasoftElement>, useId?: number): KhulnasoftElement => ({
  '@type': '@khulnasoft.com/sdk:Element',
  id: `khulnasoft-${useId ? useId : Math.random().toString().split('.')[1]}`,
  ...options,
});

export const block = (
  name: string,
  options?: any,
  elOptions?: Partial<KhulnasoftElement>,
  useId?: number
) =>
  el(
    {
      ...elOptions,
      component: {
        name,
        options,
      },
    },
    useId
  );
